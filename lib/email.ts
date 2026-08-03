export async function sendEmail({
  to,
  subject,
  html,
  notificationId,
}: {
  to: string;
  subject: string;
  html: string;
  notificationId: string;
}) {
  try {
    const appUrl = process.env.NEXTAUTH_URL || "";
    let senderEmail = "noreply@mail.abacusai.app";
    let appName = "Bözer Gaming";
    try {
      senderEmail = `noreply@${new URL(appUrl).hostname}`;
      appName = "Bözer Gaming";
    } catch {}

    const response = await fetch(
      "https://apps.abacus.ai/api/sendNotificationEmail",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deployment_token: process.env.ABACUSAI_API_KEY,
          app_id: process.env.WEB_APP_ID,
          notification_id: notificationId,
          subject,
          body: html,
          is_html: true,
          recipient_email: to,
          sender_email: senderEmail,
          sender_alias: appName,
        }),
      }
    );

    const result = await response.json();
    if (!result?.success && !result?.notification_disabled) {
      console.error("Email send failed:", result);
      return false;
    }
    return true;
  } catch (error: any) {
    console.error("Email error:", error);
    return false;
  }
}

export function verifyEmailTemplate(username: string, verifyUrl: string) {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;background:#1a1d21;color:#e5e7eb;border-radius:16px;overflow:hidden">
      <div style="background:#f97316;padding:24px;text-align:center">
        <h1 style="margin:0;color:#000;font-size:24px">🎮 Bözer Gaming</h1>
      </div>
      <div style="padding:32px 24px">
        <h2 style="margin:0 0 16px;color:#f97316">Hoş Geldin, ${username}!</h2>
        <p style="margin:0 0 24px;line-height:1.6">Hesabını doğrulamak için aşağıdaki butona tıkla:</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background:#f97316;color:#000;text-decoration:none;border-radius:12px;font-weight:700;font-size:16px">Hesabımı Doğrula</a>
        </div>
        <p style="margin:0;color:#9ca3af;font-size:13px">Bu link 24 saat geçerlidir.</p>
      </div>
    </div>
  `;
}

export function resetPasswordTemplate(resetUrl: string) {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;background:#1a1d21;color:#e5e7eb;border-radius:16px;overflow:hidden">
      <div style="background:#f97316;padding:24px;text-align:center">
        <h1 style="margin:0;color:#000;font-size:24px">🎮 Bözer Gaming</h1>
      </div>
      <div style="padding:32px 24px">
        <h2 style="margin:0 0 16px;color:#f97316">Şifre Sıfırlama</h2>
        <p style="margin:0 0 24px;line-height:1.6">Şifreni sıfırlamak için aşağıdaki butona tıkla:</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:#f97316;color:#000;text-decoration:none;border-radius:12px;font-weight:700;font-size:16px">Şifremi Sıfırla</a>
        </div>
        <p style="margin:0;color:#9ca3af;font-size:13px">Bu link 1 saat geçerlidir. Eğer bu talebi sen yapmadıysan, bu e-postayı görmezden gel.</p>
      </div>
    </div>
  `;
}

export function usernameReminderTemplate(username: string) {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;background:#1a1d21;color:#e5e7eb;border-radius:16px;overflow:hidden">
      <div style="background:#f97316;padding:24px;text-align:center">
        <h1 style="margin:0;color:#000;font-size:24px">🎮 Bözer Gaming</h1>
      </div>
      <div style="padding:32px 24px">
        <h2 style="margin:0 0 16px;color:#f97316">Kullanıcı Adı Hatırlatma</h2>
        <p style="margin:0 0 8px;line-height:1.6">Kullanıcı adın:</p>
        <div style="text-align:center;margin:24px 0;padding:16px;background:#2b3038;border-radius:12px">
          <span style="font-size:24px;font-weight:700;color:#f97316">${username}</span>
        </div>
        <p style="margin:0;color:#9ca3af;font-size:13px">Bu bilgiyi sen istemediysen, bu e-postayı görmezden gel.</p>
      </div>
    </div>
  `;
}
