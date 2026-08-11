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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const today = new Date().toISOString().split("T")[0];

    const { data: overdueInstallments } = await supabaseAdmin
      .from("payment_installments")
      .select(`
        id, installment_number, label, amount, due_date, overdue_notified_at, admin_warning_sent_at,
        agent_applications!inner (
          id, student_full_name, student_email, agent_id, student_id, courses(title)
        )
      `)
      .eq("status", "pending")
      .lt("due_date", today);

    let emailsSent = 0;
    let adminWarnings = 0;

    for (const inst of (overdueInstallments ?? [])) {
      const app = inst.agent_applications;
      const daysOverdue = Math.floor((Date.now() - new Date(inst.due_date).getTime()) / (1000 * 60 * 60 * 24));

      const shouldNotifyStudent = !inst.overdue_notified_at || daysOverdue <= 2;
      if (shouldNotifyStudent && app.student_email) {
        const { data: emailConfig } = await supabaseAdmin
          .from("app_secrets")
          .select("value")
          .eq("key", "EMAIL_FROM")
          .maybeSingle();
        const fromAddr = emailConfig?.value || "MIHE <no-reply@ashcore.space>";

        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: app.student_email,
            from: fromAddr,
            subject: "Tuition Fee Payment Overdue - MIHE",
            html: `<p>Dear ${app.student_full_name},</p><p>This is a reminder that your <strong>${inst.label}</strong> of <strong>$${parseFloat(inst.amount).toLocaleString()}</strong> was due on ${inst.due_date} and is now overdue.</p><p>Please make your payment as soon as possible to avoid any disruption to your enrolment.</p><p>If you have already paid, please disregard this email.</p><p>Regards,<br>MIHE Admissions</p>`,
          }),
        });
        emailsSent++;
      }

      await supabaseAdmin
        .from("payment_installments")
        .update({ overdue_notified_at: new Date().toISOString() })
        .eq("id", inst.id);

      if (!inst.admin_warning_sent_at && app.agent_id) {
        await supabaseAdmin.from("agent_notifications").insert({
          user_id: app.agent_id,
          title: "Overdue Payment Warning",
          message: `Student ${app.student_full_name} has missed the payment deadline for ${inst.label} (due ${inst.due_date}). Please follow up.`,
          type: "status_change",
        });
      }
      if (!inst.admin_warning_sent_at) {
        const { data: admins } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .in("role", ["admin", "super_admin", "admissions", "finance"]);

        for (const admin of (admins ?? [])) {
          await supabaseAdmin.from("agent_notifications").insert({
            user_id: admin.id,
            title: "Student Failed to Pay",
            message: `${app.student_full_name} has missed the payment deadline for ${inst.label} (due ${inst.due_date}). Action required.`,
            type: "status_change",
          });
        }
        adminWarnings++;
      }

      await supabaseAdmin
        .from("payment_installments")
        .update({ admin_warning_sent_at: new Date().toISOString() })
        .eq("id", inst.id);
    }

    return new Response(JSON.stringify({
      checked: overdueInstallments?.length ?? 0,
      emailsSent,
      adminWarnings,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
