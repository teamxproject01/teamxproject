import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function genTempPassword() {
  return Math.random().toString(36).slice(2, 10) + "A1!";
}

async function sendWelcomeEmail(supabaseAdmin: any, studentEmail: string, studentName: string, tempPassword: string, courseTitle: string | undefined) {
  let resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    const { data } = await supabaseAdmin.from("app_secrets").select("value").eq("key", "RESEND_API_KEY").maybeSingle();
    resendApiKey = data?.value;
  }
  if (!resendApiKey) return;

  let emailFrom = Deno.env.get("EMAIL_FROM");
  if (!emailFrom) {
    const { data } = await supabaseAdmin.from("app_secrets").select("value").eq("key", "EMAIL_FROM").maybeSingle();
    emailFrom = data?.value;
  }
  const fromAddress = emailFrom || "MIHE <no-reply@ashcore.space>";
  const appUrl = Deno.env.get("APP_URL") || "https://ashcore.space";

  try {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromAddress,
        to: [studentEmail],
        subject: "Your Student Portal Account is Ready",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e3a5f;">Welcome to MIHE Student Portal</h2>
            <p>Hi ${studentName},</p>
            <p>Your application has been approved and your student portal account has been created.</p>
            <div style="background: #f0f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Login URL:</strong> <a href="${appUrl}/login">${appUrl}/login</a></p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${studentEmail}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>
            <p style="color: #e74c3c; font-weight: bold;">For security, you will be required to set a new password the first time you log in.</p>
            <p>Course: ${courseTitle || "Your enrolled course"}</p>
            <p>If you have any questions, please contact us through the portal.</p>
            <p>Best regards,<br>MIHE Admissions Team</p>
          </div>
        `,
      }),
    });
    if (!emailResponse.ok) {
      const errBody = await emailResponse.text();
      console.error("Email send failed:", emailResponse.status, errBody);
    }
  } catch (emailErr) {
    console.error("Email send failed:", emailErr);
  }
}

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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseUser.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role, full_name")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (!profile || !["admin", "super_admin"].includes(profile.role)) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const action = body.action || "create";

    // ── Reset password for an existing student ──
    if (action === "resetPassword") {
      const { studentId } = body;
      if (!studentId) {
        return new Response(JSON.stringify({ error: "studentId is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: studentProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name")
        .eq("id", studentId)
        .maybeSingle();

      if (!studentProfile) {
        return new Response(JSON.stringify({ error: "Student not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const newTempPassword = genTempPassword();

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        studentId,
        { password: newTempPassword }
      );

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Force password reset on next login
      await supabaseAdmin.from("profiles")
        .update({ must_reset_password: true })
        .eq("id", studentId);

      // Try to send email with new temp password
      await sendWelcomeEmail(supabaseAdmin, studentProfile.email, studentProfile.full_name, newTempPassword, undefined);

      // Audit log
      await supabaseAdmin.from("audit_logs").insert({
        user_id: userData.user.id,
        action: "reset_student_password",
        target_table: "auth.users",
        target_id: studentId,
        metadata: { student_email: studentProfile.email },
      });

      return new Response(JSON.stringify({
        success: true,
        message: "Password reset. Student will be required to set a new password on next login.",
        email: studentProfile.email,
        tempPassword: newTempPassword,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Create a new student account from an approved application ──
    const { applicationId } = body;
    if (!applicationId) {
      return new Response(JSON.stringify({ error: "applicationId is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: application } = await supabaseAdmin
      .from("agent_applications")
      .select("*, courses(title)")
      .eq("id", applicationId)
      .maybeSingle();

    if (!application) {
      return new Response(JSON.stringify({ error: "Application not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (application.status !== "approved") {
      return new Response(JSON.stringify({ error: "Application must be approved first" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (application.student_id) {
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, email")
        .eq("id", application.student_id)
        .maybeSingle();

      if (existingProfile) {
        return new Response(JSON.stringify({
          success: true,
          message: "Student account already exists",
          studentId: existingProfile.id,
          email: existingProfile.email,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const studentEmail = application.student_email;
    const studentName = application.student_full_name || "Student";

    if (!studentEmail) {
      return new Response(JSON.stringify({ error: "Student email is required on the application" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tempPassword = genTempPassword();

    const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: studentEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: studentName },
    });

    if (createError || !newAuthUser.user) {
      return new Response(JSON.stringify({ error: createError?.message || "Failed to create user" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const studentUserId = newAuthUser.user.id;

    await supabaseAdmin.from("profiles").upsert({
      id: studentUserId,
      role: "student",
      full_name: studentName,
      email: studentEmail,
      must_reset_password: true,
    }, { onConflict: "id" });

    await supabaseAdmin.from("agent_applications")
      .update({ student_id: studentUserId })
      .eq("id", applicationId);

    await supabaseAdmin.from("approval_snapshots").insert({
      application_id: applicationId,
      status: "approved",
      approved_by: userData.user.id,
      approved_by_name: profile.full_name || profile.role,
      snapshot: application,
      comment: application.public_comment || application.admin_comment || "",
    });

    await sendWelcomeEmail(supabaseAdmin, studentEmail, studentName, tempPassword, application.courses?.title);

    await supabaseAdmin.from("audit_logs").insert({
      user_id: userData.user.id,
      action: "create_student_account_from_approval",
      target_table: "auth.users",
      target_id: studentUserId,
      metadata: { application_id: applicationId, student_email: studentEmail },
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Student account created and welcome email sent",
      studentId: studentUserId,
      email: studentEmail,
      tempPassword,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
