import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey || !webhookSecret) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    const sigRes = await fetch("https://api.stripe.com/v1/webhook_endpoints", {
      headers: { "Authorization": `Bearer ${stripeKey}` },
    });

    const sigParts = signature.split(",");
    let sigTimestamp = "";
    let sigV1 = "";
    for (const part of sigParts) {
      const [k, v] = part.split("=");
      if (k === "t") sigTimestamp = v;
      if (k === "v1") sigV1 = v;
    }

    if (!sigTimestamp || !sigV1) {
      return new Response(JSON.stringify({ error: "Invalid signature format" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const enc = new TextEncoder();
    const keyData = await crypto.subtle.importKey(
      "raw", enc.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const signedPayload = `${sigTimestamp}.${body}`;
    const expectedSig = await crypto.subtle.sign("HMAC", keyData, enc.encode(signedPayload));
    const expectedHex = Array.from(new Uint8Array(expectedSig))
      .map(b => b.toString(16).padStart(2, "0")).join("");

    if (expectedHex !== sigV1) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(body);
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const installmentId = session.client_reference_id;

      if (installmentId) {
        await supabaseAdmin
          .from("payment_installments")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            stripe_payment_intent_id: session.payment_intent,
            updated_at: new Date().toISOString(),
          })
          .eq("id", installmentId);

        const { data: installment } = await supabaseAdmin
          .from("payment_installments")
          .select("application_id, installment_number, label")
          .eq("id", installmentId)
          .maybeSingle();

        if (installment) {
          const { data: app } = await supabaseAdmin
            .from("agent_applications")
            .select("id, student_full_name, student_email, agent_id, student_id, courses(title)")
            .eq("id", installment.application_id)
            .maybeSingle();

          if (app) {
            const { data: allInstallments } = await supabaseAdmin
              .from("payment_installments")
              .select("status")
              .eq("application_id", app.id);

            const allPaid = (allInstallments ?? []).every(i => i.status === "paid");

            if (allPaid) {
              await supabaseAdmin
                .from("agent_applications")
                .update({
                  payment_status: "paid",
                  payment_completed_at: new Date().toISOString(),
                  status: "waiting_for_payment",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", app.id);
            }

            if (app.agent_id) {
              await supabaseAdmin.from("agent_notifications").insert({
                user_id: app.agent_id,
                title: "Payment Received",
                message: `Payment of ${installment.label} received for ${app.student_full_name}.`,
                type: "status_change",
              });
            }
            if (app.student_id) {
              await supabaseAdmin.from("messages").insert({
                student_id: app.student_id,
                sender_role: "admin",
                subject: "Payment Received",
                content: `Your payment for ${installment.label} has been received successfully. Thank you!`,
              });
            }

            const { data: emailConfig } = await supabaseAdmin
              .from("app_secrets")
              .select("value")
              .eq("key", "EMAIL_FROM")
              .maybeSingle();
            const fromAddr = emailConfig?.value || "MIHE <no-reply@ashcore.space>";

            if (app.student_email) {
              await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  to: app.student_email,
                  from: fromAddr,
                  subject: "Payment Received - MIHE",
                  html: `<p>Dear ${app.student_full_name},</p><p>Your payment for <strong>${installment.label}</strong> has been received successfully.</p><p>Thank you for your payment.</p><p>Regards,<br>MIHE Admissions</p>`,
                }),
              });
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
