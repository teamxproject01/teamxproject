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
    const { installmentId } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: installment, error: instError } = await supabaseAdmin
      .from("payment_installments")
      .select(`
        *,
        agent_applications!inner (
          id, student_full_name, student_email, courses (title)
        )
      `)
      .eq("id", installmentId)
      .maybeSingle();

    if (instError || !installment) {
      return new Response(JSON.stringify({ error: "Installment not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (installment.status === "paid") {
      return new Response(JSON.stringify({ error: "This installment is already paid" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const app = installment.agent_applications;
    const courseTitle = app.courses?.title ?? "MIHE Course";

    const origin = req.headers.get("origin") || "https://mihe.vic.edu.au";

    const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "mode": "payment",
        "payment_method_types[0]": "card",
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": "aud",
        "line_items[0][price_data][unit_amount]": Math.round(parseFloat(installment.amount) * 100).toString(),
        "line_items[0][price_data][product_data][name]": `${installment.label} - ${courseTitle}`,
        "line_items[0][price_data][product_data][description]": `Payment for ${app.student_full_name}`,
        "client_reference_id": installment.id,
        "customer_email": app.student_email || "",
        "success_url": `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        "cancel_url": `${origin}/payment/cancelled`,
      }),
    });

    const session = await sessionRes.json();

    if (!sessionRes.ok) {
      return new Response(JSON.stringify({ error: session.error?.message || "Failed to create Stripe session" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabaseAdmin
      .from("payment_installments")
      .update({
        stripe_checkout_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", installmentId);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
