/**
 * Production-grade email service with HTML templates and queue integration.
 */
import { createTransport, Transporter } from 'nodemailer';
import Handlebars from 'handlebars';
import { enqueueJob, registerHandler } from './queue';

// ─── TRANSPORTER ──────────────────────────────────────────────

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  transporter = createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

// ─── BASE TEMPLATE ────────────────────────────────────────────

const BASE_TEMPLATE = Handlebars.compile(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; margin: 0; padding: 0; background: #f8fafc; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.02em; }
    .header p { color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0; }
    .content { padding: 32px 24px; }
    .content h2 { color: #0f172a; font-size: 20px; margin: 0 0 16px; font-weight: 700; }
    .content p { color: #475569; line-height: 1.7; margin: 0 0 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; margin: 8px 0 24px; }
    .info-box { background: #f1f5f9; border-radius: 12px; padding: 16px 20px; margin: 16px 0; }
    .info-box .label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
    .info-box .value { font-size: 18px; color: #0f172a; font-weight: 700; margin: 4px 0 0; }
    .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 13px; }
    .status-approved { background: #dcfce7; color: #15803d; }
    .status-rejected { background: #fee2e2; color: #b91c1c; }
    .status-pending { background: #fef3c7; color: #b45309; }
    .status-reviewed { background: #e0e7ff; color: #3730a3; }
    .footer { background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #f1f5f9; }
    .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
    ul { color: #475569; line-height: 1.8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SaralYojna</h1>
      <p>Government Schemes Discovery Platform</p>
    </div>
    <div class="content">
      {{{body}}}
    </div>
    <div class="footer">
      <p>&copy; {{year}} SaralYojna. Helping citizens access government benefits.</p>
      <p>This is an automated message. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
`);

// ─── EMAIL TEMPLATES ──────────────────────────────────────────

const TEMPLATES: Record<string, HandlebarsTemplateDelegate> = {
  welcome: Handlebars.compile(`
    <h2>Welcome, {{firstName}}! 🎉</h2>
    <p>Thank you for joining SaralYojna. You're now one step closer to discovering government schemes tailored for you.</p>
    <p>Here's what you can do next:</p>
    <ul>
      <li><strong>Complete your profile</strong> to get personalized scheme recommendations</li>
      <li><strong>Check your eligibility</strong> for 100+ government schemes</li>
      <li><strong>Apply online</strong> with our guided application process</li>
    </ul>
    <a href="{{appUrl}}/profile" class="btn">Complete Your Profile</a>
    <p>If you need any help, our AI assistant is available 24/7.</p>
  `),

  applicationSubmitted: Handlebars.compile(`
    <h2>Application Submitted Successfully ✅</h2>
    <p>Dear {{firstName}}, your application has been submitted and is being processed.</p>
    <div class="info-box">
      <div class="label">Scheme</div>
      <div class="value">{{schemeName}}</div>
    </div>
    <div class="info-box">
      <div class="label">Application ID</div>
      <div class="value">{{applicationId}}</div>
    </div>
    <div class="info-box">
      <div class="label">Status</div>
      <div class="value"><span class="status-badge status-pending">Pending Review</span></div>
    </div>
    <p>You'll receive email updates as your application progresses. You can also track your application status anytime.</p>
    <a href="{{appUrl}}/applications" class="btn">Track Application</a>
  `),

  statusUpdate: Handlebars.compile(`
    <h2>Application Status Update</h2>
    <p>Dear {{firstName}}, there's an update on your application.</p>
    <div class="info-box">
      <div class="label">Scheme</div>
      <div class="value">{{schemeName}}</div>
    </div>
    <div class="info-box">
      <div class="label">New Status</div>
      <div class="value">
        <span class="status-badge status-{{statusClass}}">{{status}}</span>
      </div>
    </div>
    {{#if rejectionReason}}
    <div class="info-box">
      <div class="label">Reason</div>
      <div class="value" style="font-size:14px; font-weight:400;">{{rejectionReason}}</div>
    </div>
    {{/if}}
    <a href="{{appUrl}}/applications" class="btn">View Details</a>
  `),

  eligibilityNotification: Handlebars.compile(`
    <h2>New Scheme Match Found! 🎯</h2>
    <p>Dear {{firstName}}, we found a new government scheme that matches your profile.</p>
    <div class="info-box">
      <div class="label">Scheme Name</div>
      <div class="value">{{schemeName}}</div>
    </div>
    <div class="info-box">
      <div class="label">Match Score</div>
      <div class="value">{{matchScore}}%</div>
    </div>
    <p>{{benefits}}</p>
    <a href="{{appUrl}}/schemes/{{schemeId}}" class="btn">View Scheme Details</a>
  `),
};

// ─── SEND FUNCTIONS ───────────────────────────────────────────

const APP_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export interface EmailPayload {
  to: string;
  template: keyof typeof TEMPLATES;
  data: Record<string, any>;
}

/**
 * Render an email template and send it.
 */
async function renderAndSend(payload: EmailPayload): Promise<{ sent: boolean; skipped: boolean }> {
  const transport = getTransporter();
  if (!transport) {
    console.log(`[Email] Skipped (no transport configured): ${payload.template} → ${payload.to}`);
    return { sent: false, skipped: true };
  }

  const template = TEMPLATES[payload.template];
  if (!template) {
    console.error(`[Email] Unknown template: ${payload.template}`);
    return { sent: false, skipped: true };
  }

  const year = new Date().getFullYear();
  const bodyHtml = template({ ...payload.data, appUrl: APP_URL });
  const html = BASE_TEMPLATE({ title: payload.template, body: bodyHtml, year });

  const subjectMap: Record<string, string> = {
    welcome: 'Welcome to SaralYojna! 🎉',
    applicationSubmitted: 'Application Submitted Successfully ✅',
    statusUpdate: `Application Status: ${payload.data.status || 'Updated'}`,
    eligibilityNotification: `New Scheme Match: ${payload.data.schemeName || 'Check Now'}`,
  };

  await transport.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: payload.to,
    subject: subjectMap[payload.template] || 'SaralYojna Notification',
    html,
  });

  console.log(`[Email] Sent: ${payload.template} → ${payload.to}`);
  return { sent: true, skipped: false };
}

/**
 * Queue an email for async delivery.
 */
export function queueEmail(payload: EmailPayload): void {
  enqueueJob('EMAIL_SEND', payload);
}

/**
 * Send an email immediately (blocking).
 */
export async function sendEmailNow(payload: EmailPayload): Promise<{ sent: boolean; skipped: boolean }> {
  try {
    return await renderAndSend(payload);
  } catch (error) {
    console.error(`[Email] Failed to send ${payload.template}:`, error);
    return { sent: false, skipped: false };
  }
}

/**
 * Simple text email (backward compatible).
 */
export const sendEmail = async (to: string, subject: string, text: string) => {
  const transport = getTransporter();
  if (!transport) return { skipped: true };

  await transport.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
  });

  return { skipped: false };
};

// ─── CONVENIENCE FUNCTIONS ────────────────────────────────────

export function sendWelcomeEmail(to: string, firstName: string): void {
  queueEmail({ to, template: 'welcome', data: { firstName } });
}

export function sendApplicationSubmittedEmail(
  to: string,
  firstName: string,
  schemeName: string,
  applicationId: string
): void {
  queueEmail({
    to,
    template: 'applicationSubmitted',
    data: { firstName, schemeName, applicationId },
  });
}

export function sendStatusUpdateEmail(
  to: string,
  firstName: string,
  schemeName: string,
  status: string,
  rejectionReason?: string
): void {
  const statusClass = status === 'APPROVED' ? 'approved' : status === 'REJECTED' ? 'rejected' : status === 'REVIEWED' ? 'reviewed' : 'pending';
  queueEmail({
    to,
    template: 'statusUpdate',
    data: { firstName, schemeName, status, statusClass, rejectionReason },
  });
}

export function sendEligibilityNotificationEmail(
  to: string,
  firstName: string,
  schemeName: string,
  schemeId: string,
  matchScore: number,
  benefits: string
): void {
  queueEmail({
    to,
    template: 'eligibilityNotification',
    data: { firstName, schemeName, schemeId, matchScore, benefits },
  });
}

// ─── QUEUE HANDLER REGISTRATION ───────────────────────────────

registerHandler('EMAIL_SEND', async (payload: EmailPayload) => {
  await renderAndSend(payload);
});
