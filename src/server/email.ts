import nodemailer, { type Transporter } from 'nodemailer';
import { db } from '../db/index.ts';
import { notificationLogs, userSettings, users, todos } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface SmtpConfig {
  host?: string | null;
  port?: number | null;
  user?: string | null;
  password?: string | null;
  fromEmail?: string | null;
}

export const DEFAULT_SMTP_HOST = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
export const DEFAULT_SMTP_PORT = Number(process.env.SMTP_PORT || 587);
export const DEFAULT_SMTP_USER = (process.env.SMTP_USER || '').trim();
export const DEFAULT_SMTP_PASSWORD = (process.env.SMTP_PASSWORD || '').trim();
export const DEFAULT_FROM_EMAIL = (process.env.FROM_EMAIL || DEFAULT_SMTP_USER).trim();

// Cache the default transporter instance to reuse established TLS connections across emails
let defaultTransporterCache: Transporter | null = null;
let lastCacheConfigKey = '';

export function getTransporter(customConfig?: SmtpConfig) {
  // Check if custom user-provided credentials are fully specified
  const hasCustomAuth = Boolean(customConfig?.user?.trim() && customConfig?.password?.trim());
  
  const host = (hasCustomAuth && customConfig?.host && customConfig.host.trim()) || DEFAULT_SMTP_HOST;
  const port = hasCustomAuth && customConfig?.port ? Number(customConfig.port) : DEFAULT_SMTP_PORT;
  const user = hasCustomAuth ? customConfig!.user!.trim() : DEFAULT_SMTP_USER;
  const rawPass = hasCustomAuth ? customConfig!.password!.trim() : DEFAULT_SMTP_PASSWORD;
  // Strip spaces, quotes, and carriage returns (e.g. Google 16-char App Passwords formatted with spaces)
  const pass = rawPass ? rawPass.replace(/[\s'"]/g, '') : '';
  const fromEmail = (customConfig?.fromEmail && customConfig.fromEmail.trim()) || (hasCustomAuth ? user : DEFAULT_FROM_EMAIL);

  if (!pass || !user) {
    return {
      transporter: null,
      fromEmail,
      error: 'SMTP user or password not configured. Please check environment variables or user settings.',
    };
  }

  // If using standard default config, use cached transporter to leverage connection pooling
  const configKey = `${host}:${port}:${user}:${pass}`;
  if (!hasCustomAuth && defaultTransporterCache && lastCacheConfigKey === configKey) {
    return {
      transporter: defaultTransporterCache,
      fromEmail,
      error: null,
    };
  }

  const isGmail = host.toLowerCase().includes('gmail');

  const transportOptions: any = isGmail
    ? {
        service: 'gmail',
        auth: {
          user,
          pass,
        },
        pool: true,
        maxConnections: 3,
        maxMessages: 100,
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 30000,
      }
    : {
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
        pool: true,
        maxConnections: 3,
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 30000,
      };

  const transporter = nodemailer.createTransport(transportOptions);

  if (!hasCustomAuth) {
    defaultTransporterCache = transporter;
    lastCacheConfigKey = configKey;
  }

  return {
    transporter,
    fromEmail,
    error: null,
  };
}

/**
 * Verifies the SMTP transporter connection on server boot or diagnostics
 */
export async function verifySmtpConnection(): Promise<{ success: boolean; error?: string; sender?: string }> {
  try {
    const { transporter, fromEmail, error } = getTransporter();
    if (!transporter || error) {
      console.warn('[SMTP Engine] ⚠️ SMTP not initialized:', error);
      return { success: false, error: error || 'Transporter unavailable', sender: fromEmail };
    }
    await transporter.verify();
    console.log(`[SMTP Engine] ✅ SMTP verified & ready to dispatch emails via ${fromEmail} (Host: ${DEFAULT_SMTP_HOST})`);
    return { success: true, sender: fromEmail };
  } catch (err: any) {
    console.error('[SMTP Engine] ❌ SMTP Verification Error:', err.message || err);
    return { success: false, error: err.message || 'Verification failed' };
  }
}

export async function logNotification(data: {
  userId?: number | null;
  todoId?: number | null;
  type: string;
  recipientEmail: string;
  title: string;
  body: string;
  status: 'sent' | 'failed' | 'pending';
  errorMessage?: string | null;
}) {
  try {
    const [inserted] = await db
      .insert(notificationLogs)
      .values({
        userId: data.userId || null,
        todoId: data.todoId || null,
        type: data.type,
        recipientEmail: data.recipientEmail,
        title: data.title,
        body: data.body,
        status: data.status,
        errorMessage: data.errorMessage || null,
      })
      .returning();
    return inserted;
  } catch (err: any) {
    console.error('Failed to log notification to database:', err);
    return null;
  }
}

export async function sendEmailDirect({
  userId,
  todoId,
  type,
  recipientEmail,
  subject,
  html,
  text,
  customConfig,
}: {
  userId?: number | null;
  todoId?: number | null;
  type: string;
  recipientEmail: string;
  subject: string;
  html: string;
  text?: string;
  customConfig?: SmtpConfig;
}) {
  const { transporter, fromEmail, error: configError } = getTransporter(customConfig);

  if (!transporter || configError) {
    const errorMsg = configError || 'SMTP Transporter unavailable';
    console.warn(`[EMAIL NOTICE] Cannot dispatch to ${recipientEmail}: ${errorMsg}`);
    const logged = await logNotification({
      userId,
      todoId,
      type,
      recipientEmail,
      title: subject,
      body: text || html,
      status: 'failed',
      errorMessage: errorMsg,
    });
    return { success: false, error: errorMsg, log: logged };
  }

  try {
    const plainText = text || html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();

    const info = await transporter.sendMail({
      from: `"Astronaut Mission Control" <${fromEmail}>`,
      replyTo: fromEmail,
      to: recipientEmail,
      subject,
      text: plainText,
      html,
      headers: {
        'X-Mailer': 'AstronautMissionControl/1.0',
      },
    });

    console.log(`[EMAIL SENT] Successfully sent ${type} email to ${recipientEmail} (ID: ${info.messageId})`);
    const logged = await logNotification({
      userId,
      todoId,
      type,
      recipientEmail,
      title: subject,
      body: text || html,
      status: 'sent',
    });
    return { success: true, messageId: info.messageId, log: logged };
  } catch (err: any) {
    console.error(`[EMAIL ERROR] Failed to send ${type} to ${recipientEmail}:`, err);
    const logged = await logNotification({
      userId,
      todoId,
      type,
      recipientEmail,
      title: subject,
      body: text || html,
      status: 'failed',
      errorMessage: err.message || 'SMTP transmission error',
    });
    return { success: false, error: err.message, log: logged };
  }
}

export const SPECIAL_ASTRONAUT_EMAILS = [
  'navyakovelakuntla@gmail.com',
  'pardhupavan456@gmail.com',
];

export function isAstronautUiEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return SPECIAL_ASTRONAUT_EMAILS.includes(normalized);
}

export async function sendOtpEmail(
  email: string,
  otpCode: string,
  isNewUser: boolean = true,
  customConfig?: SmtpConfig
) {
  // ASTRONAUT COSMIC UI - Sent to all users
  const subject = `🚀 Astronaut Access Code: ${otpCode} • Mission Clearance Protocol`;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <style>
    @keyframes pulseGlow {
      0% { box-shadow: 0 0 25px rgba(168, 85, 247, 0.4); }
      50% { box-shadow: 0 0 45px rgba(168, 85, 247, 0.85); }
      100% { box-shadow: 0 0 25px rgba(168, 85, 247, 0.4); }
    }
    .code-box-glow {
      animation: pulseGlow 2.5s infinite ease-in-out;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #cbd5e1; line-height: 1.6;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #090d16; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #0b0f19; border-radius: 24px; border: 1px solid #2e1065; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85);">
          
          <!-- Deep Space Cosmic Header with Astronaut Banner -->
          <tr>
            <td style="padding: 36px 28px 24px 28px; background: linear-gradient(135deg, #090d16 0%, #1e1b4b 55%, #3b0764 100%); border-bottom: 1px solid #2e1065; text-align: center;">
              
              <!-- Mission Pill -->
              <div style="display: inline-block; padding: 6px 16px; border-radius: 9999px; background-color: rgba(168, 85, 247, 0.2); border: 1px solid rgba(192, 132, 252, 0.5); color: #e9d5ff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.6px; margin-bottom: 16px;">
                🚀 MISSION CONTROL • ASTRONAUT PROTOCOL
              </div>

              <!-- Astronaut Graphic -->
              <div align="center" style="margin: 12px auto 16px auto;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="background: radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(30, 27, 75, 0.4) 50%, rgba(15, 23, 42, 0) 72%); border-radius: 50%; padding: 10px;">
                      <img src="https://uiverse.io/astronaut.png" width="135" height="135" alt="Astronaut" style="display: block; border: 0; outline: none; text-decoration: none; margin: 0 auto; filter: drop-shadow(0 12px 24px rgba(168, 85, 247, 0.65)); max-width: 135px; height: auto;" />
                    </td>
                  </tr>
                </table>
              </div>

              <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 26px; font-weight: 800; line-height: 1.2; letter-spacing: -0.5px;">
                Astronaut Security Access Code
              </h1>
              <p style="margin: 0 auto; max-width: 480px; color: #c4b5fd; font-size: 14px; line-height: 1.5;">
                ${
                  isNewUser
                    ? 'Welcome to the crew, Space Cadet! Authorize your terminal with the single-use mission code below to launch your productivity workspace.'
                    : 'Welcome back, Commander! Enter your single-use verification code below to authenticate into your productivity spacecraft.'
                }
              </p>
            </td>
          </tr>

          <!-- Main Body: Glowing Cosmic Code Card -->
          <tr>
            <td style="padding: 32px 28px;">
              
              <div class="code-box-glow" style="background: linear-gradient(135deg, #130f26 0%, #1e1b4b 60%, #0d1322 100%); border-radius: 20px; padding: 28px 20px; border: 2px solid #a855f7; text-align: center; margin-bottom: 24px; box-shadow: 0 0 35px rgba(168, 85, 247, 0.35);">
                
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #d8b4fe; margin-bottom: 12px;">
                  ★ SINGLE-USE MISSION VERIFICATION CODE ★
                </div>

                <!-- Digits Box -->
                <div style="margin: 12px 0 16px 0;">
                  <span style="display: inline-block; font-family: 'Courier New', Courier, Monaco, Consolas, monospace; font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #38bdf8; text-shadow: 0 0 20px #818cf8; background-color: #090d16; padding: 16px 28px; border-radius: 14px; border: 1px solid rgba(56, 189, 248, 0.5); box-shadow: inset 0 2px 10px rgba(0,0,0,0.8);">
                    ${escapeHtml(otpCode)}
                  </span>
                </div>

                <div style="display: inline-block; padding: 6px 14px; background-color: rgba(15, 23, 42, 0.7); border-radius: 9999px; border: 1px solid rgba(168, 85, 247, 0.3); font-size: 12px; color: #f1f5f9;">
                  ⏱️ <strong>Security Oxygen:</strong> Valid for <strong>10 minutes</strong> • One-time use
                </div>
              </div>

              <!-- 3 Cosmic Specification Badges -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td width="32%" style="padding: 12px; background-color: #111827; border-radius: 14px; border: 1px solid #1f2937; text-align: center; vertical-align: top;">
                    <div style="font-size: 20px; margin-bottom: 4px;">⏱️</div>
                    <div style="font-size: 11px; font-weight: 700; color: #f8fafc; margin-bottom: 2px;">10 Min Window</div>
                    <div style="font-size: 10px; color: #94a3b8; line-height: 1.3;">Auto-terminates after 10m.</div>
                  </td>
                  <td width="2%"></td>
                  <td width="32%" style="padding: 12px; background-color: #111827; border-radius: 14px; border: 1px solid #1f2937; text-align: center; vertical-align: top;">
                    <div style="font-size: 20px; margin-bottom: 4px;">🔒</div>
                    <div style="font-size: 11px; font-weight: 700; color: #f8fafc; margin-bottom: 2px;">AES / Bcrypt</div>
                    <div style="font-size: 10px; color: #94a3b8; line-height: 1.3;">Single-use cryptographic token.</div>
                  </td>
                  <td width="2%"></td>
                  <td width="32%" style="padding: 12px; background-color: #111827; border-radius: 14px; border: 1px solid #1f2937; text-align: center; vertical-align: top;">
                    <div style="font-size: 20px; margin-bottom: 4px;">🛸</div>
                    <div style="font-size: 11px; font-weight: 700; color: #f8fafc; margin-bottom: 2px;">Orbit Sync</div>
                    <div style="font-size: 10px; color: #94a3b8; line-height: 1.3;">Live WebSocket productivity.</div>
                  </td>
                </tr>
              </table>

              <!-- Celestial Inspiration Quote -->
              <div style="background-color: #111827; border-radius: 14px; padding: 16px 20px; border: 1px solid #1e293b; margin-bottom: 20px; text-align: center;">
                <p style="margin: 0 0 6px 0; font-size: 13px; color: #e2e8f0; font-style: italic;">
                  "One small step for today, one giant leap for your ambitions! Keep aiming for the cosmos. 🚀"
                </p>
                <span style="font-size: 11px; color: #a855f7; font-weight: 600;">
                  — Astronaut Mission Control Flight Log
                </span>
              </div>

              <!-- Security Notice -->
              <div style="padding: 12px 16px; background-color: rgba(15, 23, 42, 0.6); border-radius: 10px; border: 1px solid #1e293b; font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center;">
                🛡️ <em>If you did not request this verification code, no action is needed — your account security remains completely uncompromised.</em>
              </div>

            </td>
          </tr>

          <!-- Cosmic Footer -->
          <tr>
            <td style="padding: 20px 28px; background-color: #080c14; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b;">
                Sent directly to <strong style="color: #cbd5e1;">${escapeHtml(email)}</strong> • Real-Time Productivity Engine
              </p>
              <p style="margin: 0; font-size: 10px; color: #475569;">
                Orbit Security Clearance • Spacecraft Session ID: ${Date.now().toString(36).toUpperCase()}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `;

  return await sendEmailDirect({
    type: 'otp',
    recipientEmail: email,
    subject,
    html,
    text: `Your Astronaut verification code is ${otpCode}. Valid for 10 minutes. Real-Time Productivity Engine.`,
    customConfig,
  });
}

export async function sendTaskCompletionEmail(
  user: typeof users.$inferSelect,
  todo: typeof todos.$inferSelect,
  settings?: typeof userSettings.$inferSelect | null
) {
  if (settings && !settings.emailNotificationsEnabled) return null;
  if (settings && !settings.taskCompletionEmail) return null;

  const fromEmail = (settings?.customFromEmail && settings.customFromEmail.trim()) || DEFAULT_FROM_EMAIL;
  
  // Exact Rohit Sharma fan email accounts
  const rohitUsers = [
    'pardhupavan456@gmail.com',
    'navadhanushka474@gmail.com',
  ];

  const userEmail = user.email.trim().toLowerCase();
  const isRohit = rohitUsers.includes(userEmail);

  let subject = `Task Completed: ${todo.title} 🎉`;
  let html = '';

  if (isRohit) {
    // ROHIT SHARMA FAN THEMED TASK COMPLETION EMAIL
    subject = '🏏 Hitman Task Completed — Another One Done! 💙';
    html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; background-color: #FFFDF7; border: 2px solid #1769E0; border-radius: 16px; box-shadow: 0 8px 30px rgba(8,43,99,0.12);">
        
        <!-- Header Banner -->
        <div style="text-align: center; padding-bottom: 16px; border-bottom: 2px dashed #8EC5FF;">
          <div style="display: inline-block; background-color: #082B63; color: #ffffff; padding: 6px 18px; border-radius: 20px; font-size: 13px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
            ROHIT SHARMA FANS 💙
          </div>
          <p style="margin: 8px 0 0 0; color: #1769E0; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">
            HITMAN LIST • PLAN • DO • WIN
          </p>
        </div>

        <!-- Hero Pull Shot Image -->
        <div style="margin: 20px 0 12px 0; text-align: center;">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/9/98/Rohit_Sharma_Batting.jpg"
            alt="Rohit Sharma Batting Pull Shot"
            style="width: 100%; max-width: 480px; height: auto; border-radius: 12px; display: block; margin: 0 auto; border: 2px solid #1769E0; box-shadow: 0 4px 14px rgba(23,105,224,0.25);"
          />
          <p style="margin: 8px 0 0 0; font-size: 12px; font-weight: 700; color: #082B63; font-style: italic;">
            Hitman doing what Hitman does best. 🏏🔥
          </p>
        </div>

        <!-- Mode Badge -->
        <div style="text-align: center; margin: 16px 0;">
          <span style="display: inline-block; background: linear-gradient(135deg, #1769E0 0%, #082B63 100%); color: #ffffff; padding: 8px 22px; border-radius: 30px; font-size: 14px; font-weight: 900; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(23,105,224,0.3);">
            Hitman Mode: COMPLETED 🔥
          </span>
        </div>

        <!-- Task Card Container -->
        <div style="margin: 20px 0; padding: 20px; background-color: #ffffff; border: 1.5px solid #8EC5FF; border-radius: 12px; border-left: 6px solid #1769E0; box-shadow: 0 2px 8px rgba(8,43,99,0.06);">
          <div style="font-size: 11px; font-weight: 800; color: #1769E0; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
            TASK COMPLETED
          </div>
          <div style="font-size: 18px; font-weight: 800; color: #082B63; line-height: 1.4;">
            ${todo.title}
          </div>
          ${todo.description ? `<p style="color: #475569; font-size: 14px; margin: 8px 0 0 0; line-height: 1.5;">${todo.description}</p>` : ''}
          <div style="margin-top: 12px; display: inline-flex; align-items: center; color: #15803d; font-size: 13px; font-weight: 700; background-color: #dcfce7; padding: 4px 12px; border-radius: 20px;">
            ✓ Completed successfully
          </div>
        </div>

        <!-- Motivational Scrapbook Message -->
        <div style="background-color: #EAF4FF; border: 1px solid #8EC5FF; border-radius: 12px; padding: 18px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #082B63; font-size: 15px; font-weight: 700; line-height: 1.6;">
            Great work!<br><br>
            One more task completed.<br>
            Stay focused.<br>
            Stay consistent.<br>
            Keep winning. 💙
          </p>
          <div style="margin-top: 14px; font-size: 16px; font-weight: 900; color: #1769E0;">
            Hitman mentality — DONE! 🏏🔥
          </div>
        </div>

        <!-- Jersey 45 & Slogan Footer -->
        <div style="text-align: center; padding-top: 16px; border-top: 2px dashed #8EC5FF;">
          <div style="display: inline-block; background-color: #1769E0; color: #F4C95D; border: 2px solid #F4C95D; font-size: 14px; font-weight: 900; padding: 4px 14px; border-radius: 20px; font-family: monospace; letter-spacing: 1px;">
            45 | HITMAN
          </div>
          <p style="margin: 10px 0 4px 0; font-size: 13px; font-weight: 800; color: #082B63;">
            Plan it • Focus • Execute • Win 🏆
          </p>
          <p style="margin: 0; font-size: 11px; color: #64748b;">
            Sent directly to <strong>${user.email}</strong> • Real-Time Productivity Engine
          </p>
        </div>

      </div>
    `;
  } else {
    // EXISTING NORMAL COMPLETION EMAIL FOR ALL OTHER USERS
    html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #16a34a; margin-top: 0; font-size: 22px;">Task Completed! 🎉</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Hey ${user.name}, you just marked another task as complete:
        </p>
        <div style="margin: 20px 0; padding: 16px; background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 6px;">
          <strong style="color: #15803d; font-size: 16px;">${todo.title}</strong>
          ${todo.description ? `<p style="color: #4b5563; font-size: 14px; margin: 6px 0 0 0;">${todo.description}</p>` : ''}
        </div>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Keep up the great momentum and achieve your goals today!
        </p>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5;">
          <p style="margin: 0 0 4px 0;">Sent directly to <strong>${user.email}</strong> by Real-Time Productivity Engine.</p>
          <p style="margin: 0;">💡 <em>Tip: If this email arrived in your Spam or Promotions folder, mark it as "Not Spam" or add <strong>${fromEmail}</strong> to your contacts for instant Primary delivery.</em></p>
        </div>
      </div>
    `;
  }

  const customConfig: SmtpConfig = {
    host: settings?.customSmtpHost,
    port: settings?.customSmtpPort,
    user: settings?.customSmtpUser,
    password: settings?.customSmtpPassword,
    fromEmail: settings?.customFromEmail,
  };

  return await sendEmailDirect({
    userId: user.id,
    todoId: todo.id,
    type: 'task_completion',
    recipientEmail: user.email,
    subject,
    html,
    customConfig,
  });
}

export async function sendScheduledReminderEmail(
  user: typeof users.$inferSelect,
  todo: typeof todos.$inferSelect,
  settings?: typeof userSettings.$inferSelect | null
) {
  if (settings && !settings.emailNotificationsEnabled) return null;
  if (settings && !settings.scheduledRemindersEmail) return null;

  const fromEmail = (settings?.customFromEmail && settings.customFromEmail.trim()) || DEFAULT_FROM_EMAIL;
  const subject = `⏰ Reminder: ${todo.title}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #2563eb; margin-top: 0; font-size: 22px;">Upcoming Task Reminder ⏰</h2>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">
        Hello ${user.name}, this is a scheduled reminder for your task:
      </p>
      <div style="margin: 20px 0; padding: 16px; background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 6px;">
        <strong style="color: #1e40af; font-size: 16px;">${todo.title}</strong>
        <p style="color: #475569; font-size: 13px; margin: 6px 0 0 0;">
          Due Date: <strong>${todo.dueDate}</strong> ${todo.dueTime ? `at <strong>${todo.dueTime}</strong>` : ''}
        </p>
        ${todo.description ? `<p style="color: #64748b; font-size: 14px; margin: 8px 0 0 0;">${todo.description}</p>` : ''}
      </div>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">
        Check it off on your real-time dashboard once finished!
      </p>
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5;">
        <p style="margin: 0 0 4px 0;">Sent directly to <strong>${user.email}</strong> by Real-Time Productivity Engine.</p>
        <p style="margin: 0;">💡 <em>Tip: If this email arrived in your Spam or Promotions folder, mark it as "Not Spam" or add <strong>${fromEmail}</strong> to your contacts for instant Primary delivery.</em></p>
      </div>
    </div>
  `;

  const customConfig: SmtpConfig = {
    host: settings?.customSmtpHost,
    port: settings?.customSmtpPort,
    user: settings?.customSmtpUser,
    password: settings?.customSmtpPassword,
    fromEmail: settings?.customFromEmail,
  };

  return await sendEmailDirect({
    userId: user.id,
    todoId: todo.id,
    type: 'task_reminder',
    recipientEmail: user.email,
    subject,
    html,
    customConfig,
  });
}

export async function sendMorningDigestEmail(
  user: typeof users.$inferSelect,
  todaysTodos: (typeof todos.$inferSelect)[],
  settings?: typeof userSettings.$inferSelect | null
) {
  if (settings && !settings.emailNotificationsEnabled) return null;
  if (settings && !settings.morningDigestEmail) return null;

  const fromEmail = (settings?.customFromEmail && settings.customFromEmail.trim()) || DEFAULT_FROM_EMAIL;
  const subject = `Daily Plan for Today ☀️ - ${user.name}`;
  const taskListHtml =
    todaysTodos.length > 0
      ? todaysTodos
          .map(
            (t, index) =>
              `<li style="margin-bottom: 8px; font-size: 15px; color: #334155;"><strong>${index + 1}. ${t.title}</strong> ${t.dueTime ? `<span style="color:#64748b; font-size:13px;">(${t.dueTime})</span>` : ''}</li>`
          )
          .join('')
      : '<p style="color: #64748b; font-style: italic;">No tasks scheduled yet today. Open the app to set your daily goals!</p>';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #d97706; margin-top: 0; font-size: 22px;">Daily Plan for Today ☀️</h2>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello ${user.name}, here is your schedule for today:</p>
      <ol style="padding-left: 20px; margin: 20px 0;">
        ${taskListHtml}
      </ol>
      <p style="color: #059669; font-weight: 600; font-size: 15px;">You've got this! 💪</p>
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5;">
        <p style="margin: 0 0 4px 0;">Sent directly to <strong>${user.email}</strong> by Real-Time Productivity Engine.</p>
        <p style="margin: 0;">💡 <em>Tip: If this email arrived in your Spam or Promotions folder, mark it as "Not Spam" or add <strong>${fromEmail}</strong> to your contacts for instant Primary delivery.</em></p>
      </div>
    </div>
  `;

  const customConfig: SmtpConfig = {
    host: settings?.customSmtpHost,
    port: settings?.customSmtpPort,
    user: settings?.customSmtpUser,
    password: settings?.customSmtpPassword,
    fromEmail: settings?.customFromEmail,
  };

  return await sendEmailDirect({
    userId: user.id,
    type: 'morning_digest',
    recipientEmail: user.email,
    subject,
    html,
    customConfig,
  });
}

export async function sendMissedTaskEmail(
  user: typeof users.$inferSelect,
  todo: typeof todos.$inferSelect,
  settings?: typeof userSettings.$inferSelect | null
) {
  if (settings && !settings.emailNotificationsEnabled) return null;
  if (settings && !settings.missedTaskEmail) return null;

  const fromEmail = (settings?.customFromEmail && settings.customFromEmail.trim()) || DEFAULT_FROM_EMAIL;
  const subject = `⚠️ Missed Task: ${todo.title}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #dc2626; margin-top: 0; font-size: 22px;">Missed Task Alert ⚠️</h2>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">
        Hey ${user.name}, the scheduled time for your task has passed and it is still pending:
      </p>
      <div style="margin: 20px 0; padding: 16px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 6px;">
        <strong style="color: #991b1b; font-size: 16px;">${todo.title}</strong>
        <p style="color: #7f1d1d; font-size: 13px; margin: 6px 0 0 0;">
          Scheduled: <strong>${todo.dueDate} ${todo.dueTime || ''}</strong>
        </p>
      </div>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">
        You can reschedule it or mark it completed whenever you're ready!
      </p>
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5;">
        <p style="margin: 0 0 4px 0;">Sent directly to <strong>${user.email}</strong> by Real-Time Productivity Engine.</p>
        <p style="margin: 0;">💡 <em>Tip: If this email arrived in your Spam or Promotions folder, mark it as "Not Spam" or add <strong>${fromEmail}</strong> to your contacts for instant Primary delivery.</em></p>
      </div>
    </div>
  `;

  const customConfig: SmtpConfig = {
    host: settings?.customSmtpHost,
    port: settings?.customSmtpPort,
    user: settings?.customSmtpUser,
    password: settings?.customSmtpPassword,
    fromEmail: settings?.customFromEmail,
  };

  return await sendEmailDirect({
    userId: user.id,
    todoId: todo.id,
    type: 'missed_task',
    recipientEmail: user.email,
    subject,
    html,
    customConfig,
  });
}

/**
 * Dispatches an animated, executive Welcome Cover Letter email to newly registered users
 */
export async function sendWelcomeCoverLetterEmail(
  to: string,
  userName: string,
  userId: number,
  appUrl: string,
  isReminder: boolean = false,
  reminderCount: number = 0,
  customConfig?: SmtpConfig
) {
  const trackingPixelUrl = `${appUrl}/api/email-tracking/welcome-pixel/${userId}`;
  const confirmUrl = `${appUrl}/api/email-tracking/welcome-confirm/${userId}`;

  const subject = `🚀 Official Welcome on Board, Commander ${userName}! - Real-Time Productivity Engine`;

  const headerHtml = `
            <td style="padding: 36px 32px 28px 32px; background: linear-gradient(135deg, #090d16 0%, #1e1b4b 60%, #3b0764 100%); border-bottom: 1px solid #2e1065; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" style="padding-right: 16px;">
                    <div style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background-color: rgba(168, 85, 247, 0.2); border: 1px solid rgba(192, 132, 252, 0.45); color: #e9d5ff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 14px;">
                      🚀 Astronaut Mission Control
                    </div>
                    <h1 style="margin: 0 0 10px 0; color: #ffffff; font-size: 28px; font-weight: 800; line-height: 1.2; letter-spacing: -0.5px;">
                      Welcome on Board, <span style="color: #67e8f9;">${escapeHtml(userName)}</span>! 👨‍🚀
                    </h1>
                    <p style="margin: 0; color: #cbd5e1; font-size: 14px; line-height: 1.5;">
                      Your personal workspace, Day &amp; Night task engine, and real-time velocity tracking are now fully activated.
                    </p>
                  </td>
                  <td width="115" align="center" valign="middle">
                    <img src="https://uiverse.io/astronaut.png" width="105" height="105" alt="Astronaut" style="display: block; border: 0; outline: none; margin: 0 auto; filter: drop-shadow(0 10px 20px rgba(168, 85, 247, 0.6)); max-width: 105px; height: auto;" />
                  </td>
                </tr>
              </table>
            </td>
  `;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <style>
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .badge-shimmer {
      background: linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%);
      background-size: 200% auto;
      animation: shimmer 3s linear infinite;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #cbd5e1; line-height: 1.6;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #090d16; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="620" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; width: 100%; background-color: #0f172a; border-radius: 24px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
          
          <!-- Animated Header Shimmer / Cover Banner -->
          <tr>
            ${headerHtml}
          </tr>

          <!-- Cover Letter Content -->
          <tr>
            <td style="padding: 32px;">
              <div style="background-color: #1e293b; border-radius: 16px; padding: 24px; border: 1px solid #334155; margin-bottom: 24px;">
                <h2 style="margin: 0 0 12px 0; color: #f8fafc; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                  ✉️ Executive Welcome &amp; Onboarding Letter
                </h2>
                <p style="margin: 0 0 14px 0; font-size: 14px; color: #e2e8f0; line-height: 1.7;">
                  Dear <strong>${escapeHtml(userName)}</strong>,
                </p>
                <p style="margin: 0 0 14px 0; font-size: 14px; color: #cbd5e1; line-height: 1.7;">
                  Welcome to your new digital command center! We designed this platform to bring precision, clarity, and momentum to your daily workflow.
                </p>
                <p style="margin: 0 0 14px 0; font-size: 14px; color: #cbd5e1; line-height: 1.7;">
                  Your account is secured with durable <strong>Cloud SQL PostgreSQL</strong> storage and powered by a real-time <strong>WebSocket sync channel</strong> that automatically updates your 7-day productivity velocity graphs across all your devices.
                </p>
                <p style="margin: 0; font-size: 14px; color: #cbd5e1; line-height: 1.7;">
                  Warmest regards,<br/>
                  <strong style="color: #ffffff;">The Engineering &amp; Productivity Team</strong>
                </p>
              </div>

              <!-- Key Capabilities -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                <tr>
                  <td width="32%" style="padding: 14px; background-color: #111827; border-radius: 14px; border: 1px solid #1f2937; vertical-align: top;">
                    <div style="font-size: 20px; margin-bottom: 6px;">⚡</div>
                    <div style="font-size: 12px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">Live WebSockets</div>
                    <div style="font-size: 11px; color: #94a3b8; line-height: 1.4;">Instant multi-device task and graph sync.</div>
                  </td>
                  <td width="2%"></td>
                  <td width="32%" style="padding: 14px; background-color: #111827; border-radius: 14px; border: 1px solid #1f2937; vertical-align: top;">
                    <div style="font-size: 20px; margin-bottom: 6px;">🎯</div>
                    <div style="font-size: 12px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">Focus Mode</div>
                    <div style="font-size: 11px; color: #94a3b8; line-height: 1.4;">Built-in Pomodoro timers with harmonic audio bells.</div>
                  </td>
                  <td width="2%"></td>
                  <td width="32%" style="padding: 14px; background-color: #111827; border-radius: 14px; border: 1px solid #1f2937; vertical-align: top;">
                    <div style="font-size: 20px; margin-bottom: 6px;">📊</div>
                    <div style="font-size: 12px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">Real-Time Graph</div>
                    <div style="font-size: 11px; color: #94a3b8; line-height: 1.4;">Live 7-day velocity and streak calculations.</div>
                  </td>
                </tr>
              </table>

              <!-- Action button: Confirm receipt and enter dashboard -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${confirmUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; border-radius: 14px; box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.5); letter-spacing: 0.3px;">
                  ✓ Confirm Welcome Email &amp; Launch Dashboard →
                </a>
                <p style="margin: 10px 0 0 0; font-size: 11px; color: #64748b;">
                  Clicking confirms receipt and completes your onboarding verification.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0b1120; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b;">
                Sent directly to <strong style="color: #94a3b8;">${escapeHtml(to)}</strong>
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                © 2026 Real-Time Productivity Platform • Cloud SQL PostgreSQL
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return await sendEmailDirect({
    userId,
    type: 'welcome_cover_letter',
    recipientEmail: to,
    subject,
    html,
    customConfig,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  otpCode: string,
  customConfig?: SmtpConfig
) {
  const subject = `🔑 Password Reset Code: ${otpCode} • ToDo List Account Recovery`;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; line-height: 1.6;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" max-width="560" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; width: 100%; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 28px 24px 28px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-bottom: 1px solid #bfdbfe; text-align: center;">
              
              <div style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background-color: #ffffff; border: 1px solid #93c5fd; color: #1d4ed8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 12px;">
                🔒 SECURITY &amp; RECOVERY
              </div>

              <h1 style="margin: 0 0 8px 0; color: #1e3a8a; font-size: 24px; font-weight: 800; line-height: 1.2;">
                Reset Your Password
              </h1>
              <p style="margin: 0 auto; max-width: 440px; color: #3b82f6; font-size: 13px; line-height: 1.5;">
                We received a request to reset the password for your ToDo List productivity account. Use the verification code below to set a new password.
              </p>
            </td>
          </tr>

          <!-- Main Body: Code Card -->
          <tr>
            <td style="padding: 32px 28px;">
              
              <div style="background-color: #f1f5f9; border-radius: 16px; padding: 24px 20px; border: 2px dashed #94a3b8; text-align: center; margin-bottom: 24px;">
                
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 8px;">
                  YOUR 6-DIGIT RESET CODE
                </div>

                <div style="font-size: 38px; font-weight: 900; font-family: monospace; letter-spacing: 8px; color: #0f172a; margin: 8px 0;">
                  ${otpCode}
                </div>

                <div style="font-size: 12px; color: #64748b; margin-top: 6px;">
                  ⏳ Valid for 15 minutes • Do not share this code with anyone
                </div>
              </div>

              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 14px 16px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 12px; color: #991b1b; line-height: 1.5;">
                  <strong>Didn't request a password reset?</strong> If you did not make this request, you can safely ignore this email. Your current password will remain unchanged and your account is secure.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b;">
                Sent directly to <strong style="color: #334155;">${escapeHtml(email)}</strong>
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                © 2026 ToDo List • Productivity Workspace System
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return await sendEmailDirect({
    type: 'password_reset_otp',
    recipientEmail: email,
    subject,
    html,
    customConfig,
  });
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>'"]/g, (tag) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}
