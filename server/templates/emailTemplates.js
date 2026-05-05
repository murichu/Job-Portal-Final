const BRAND_COLORS = {
  primary: "#5F6FFF",
  primaryLight: "#7A88FF",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  dark: "#2D3748",
  darkGray: "#4A5568",
  gray: "#718096",
  lightGray: "#F7FAFC",
  white: "#FFFFFF",
  purple: "#8B7FD8",
  purpleLight: "#A99BE8",
};

const currentYear = new Date().getFullYear();
const appUrl = process.env.CLIENT_URL || "#";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatDateTime = (value) => {
  if (!value) return "To be confirmed";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const createBaseTemplate = ({ title, preheader, content }) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${escapeHtml(title)}</title>
    <!--[if mso]><style>body,table,td{font-family:Arial,Helvetica,sans-serif!important;}</style><![endif]-->
  </head>
  <body style="margin:0;padding:0;background-color:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>
    <div style="display:none;max-height:0;overflow:hidden;">&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
    <center style="width:100%;background-color:#F3F4F6;padding:30px 15px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background:${BRAND_COLORS.white};border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.1);">
        ${content}
        ${footerSection()}
      </table>
    </center>
  </body>
  </html>
`;

const headerSection = ({ label, title, subtitle, color = "primary", icon = "💼" }) => {
  const gradients = {
    primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    success: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
    warning: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
    error: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
    blue: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
  };

  return `
    <tr>
      <td style="background:${gradients[color] || gradients.primary};padding:48px 30px;text-align:center;border-radius:16px 16px 0 0;">
        <div style="display:inline-block;background:rgba(255,255,255,0.2);padding:12px 24px;border-radius:30px;margin-bottom:22px;border:2px solid rgba(255,255,255,0.3);">
          <span style="color:#FFFFFF;font-size:16px;font-weight:600;letter-spacing:0.5px;">${icon} ${escapeHtml(label)}</span>
        </div>
        <h1 style="margin:0 0 12px;font-size:30px;font-weight:700;color:#FFFFFF;letter-spacing:-0.5px;">
          ${escapeHtml(title)}
        </h1>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.95);font-weight:500;">
          ${escapeHtml(subtitle)}
        </p>
      </td>
    </tr>
  `;
};

const footerSection = () => `
  <tr>
    <td style="background:${BRAND_COLORS.dark};padding:34px 30px;text-align:center;border-radius:0 0 16px 16px;">
      <p style="margin:0 0 10px;font-size:18px;font-weight:700;color:#FFFFFF;">💼 Job Portal</p>
      <p style="margin:0 0 22px;font-size:13px;color:#CBD5E0;line-height:1.6;">
        Connecting talent with the right opportunities.
      </p>
      <div style="padding:22px 0;border-top:1px solid rgba(255,255,255,0.1);border-bottom:1px solid rgba(255,255,255,0.1);">
        <a href="${appUrl}" style="color:#93C5FD;text-decoration:none;font-size:13px;margin:0 12px;font-weight:500;">Home</a>
        <a href="${appUrl}/jobs" style="color:#93C5FD;text-decoration:none;font-size:13px;margin:0 12px;font-weight:500;">Jobs</a>
        <a href="${appUrl}/contact" style="color:#93C5FD;text-decoration:none;font-size:13px;margin:0 12px;font-weight:500;">Contact</a>
      </div>
      <div style="padding-top:22px;">
        <p style="margin:0 0 8px;font-size:12px;color:#9CA3AF;">© ${currentYear} Job Portal. All rights reserved.</p>
        <p style="margin:0;font-size:11px;color:#6B7280;">This is an automated message. Please do not reply to this email.</p>
      </div>
    </td>
  </tr>
`;

const infoCard = ({ title, body, borderColor = BRAND_COLORS.primary, background = BRAND_COLORS.lightGray }) => `
  <div style="background:${background};border-left:5px solid ${borderColor};padding:22px 25px;border-radius:10px;margin-bottom:28px;">
    ${title ? `<p style="margin:0 0 8px;font-size:15px;color:${BRAND_COLORS.dark};font-weight:700;">${title}</p>` : ""}
    <div style="margin:0;font-size:14px;color:${BRAND_COLORS.darkGray};line-height:1.7;">${body}</div>
  </div>
`;

const ctaButton = ({ href, label, color = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }) => `
  <div style="text-align:center;margin:30px 0;">
    <a href="${href}" style="display:inline-block;background:${color};color:#FFFFFF;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;box-shadow:0 4px 6px rgba(102,126,234,0.3);">
      ${escapeHtml(label)}
    </a>
  </div>
`;

export const fraudAlertTemplate = ({ ip, reason }) => ({
  subject: "🚨 Suspicious M-Pesa Activity Detected",
  html: createBaseTemplate({
    title: "Suspicious M-Pesa Activity Detected",
    preheader: `Suspicious payment activity detected from ${ip || "an unknown IP"}`,
    content: `
      ${headerSection({
        label: "Security Alert",
        title: "Suspicious Activity Detected",
        subtitle: "A payment security check needs attention",
        color: "error",
        icon: "🚨",
      })}
      <tr>
        <td style="padding:42px 35px;background:#FFFFFF;">
          ${infoCard({
            title: "Alert Details",
            borderColor: BRAND_COLORS.error,
            background: "#FEE2E2",
            body: `
              <p style="margin:0 0 10px;"><strong>IP Address:</strong> ${escapeHtml(ip || "Unknown")}</p>
              <p style="margin:0;"><strong>Reason:</strong> ${escapeHtml(reason || "Suspicious activity detected")}</p>
            `,
          })}
          ${infoCard({
            title: "Recommended Action",
            borderColor: BRAND_COLORS.warning,
            background: "#FEF3C7",
            body: "Review the transaction, confirm the customer details, and only proceed once the payment looks legitimate.",
          })}
        </td>
      </tr>
    `,
  }),
});

export const invoicePaidTemplate = ({ amount }) => ({
  subject: "Payment Successful",
  html: createBaseTemplate({
    title: "Payment Successful",
    preheader: `We received your payment of KES ${amount}`,
    content: `
      ${headerSection({
        label: "Billing",
        title: "Payment Received",
        subtitle: "Your subscription payment was processed successfully",
        color: "success",
        icon: "✅",
      })}
      <tr>
        <td style="padding:42px 35px;background:#FFFFFF;">
          <p style="margin:0 0 24px;font-size:17px;color:${BRAND_COLORS.dark};font-weight:600;">Hello,</p>
          <p style="margin:0 0 28px;font-size:15px;color:${BRAND_COLORS.darkGray};line-height:1.7;">
            Thank you. We have received your payment and updated your billing record.
          </p>
          <div style="background:linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);border-radius:12px;padding:25px;border:2px solid ${BRAND_COLORS.success};margin-bottom:28px;text-align:center;">
            <p style="margin:0 0 8px;font-size:13px;color:#065F46;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Amount Paid</p>
            <p style="margin:0;font-size:28px;color:${BRAND_COLORS.dark};font-weight:800;">KES ${escapeHtml(amount)}</p>
          </div>
          ${ctaButton({ href: `${appUrl}/company/billing`, label: "View Billing" })}
        </td>
      </tr>
    `,
  }),
});

export const applicationStatusTemplate = ({ applicantName, jobTitle, status, companyName }) => ({
  subject: `Application update: ${jobTitle}`,
  html: createBaseTemplate({
    title: `Application update: ${jobTitle}`,
    preheader: `Your application for ${jobTitle} at ${companyName} is now ${status}`,
    content: `
      ${headerSection({
        label: "Application Update",
        title: "Your Application Has Been Updated",
        subtitle: "We will keep you informed about next steps",
        color: "primary",
        icon: "📋",
      })}
      <tr>
        <td style="padding:42px 35px;background:#FFFFFF;">
          <p style="margin:0 0 24px;font-size:18px;color:${BRAND_COLORS.dark};font-weight:600;">
            👋 Hello ${escapeHtml(applicantName || "Candidate")},
          </p>
          ${infoCard({
            title: "Application Status",
            body: `
              <p style="margin:0 0 10px;"><strong>Role:</strong> ${escapeHtml(jobTitle)}</p>
              <p style="margin:0 0 10px;"><strong>Company:</strong> ${escapeHtml(companyName)}</p>
              <p style="margin:0;"><strong>Status:</strong> <span style="color:${BRAND_COLORS.primary};font-weight:700;">${escapeHtml(status)}</span></p>
            `,
          })}
          ${infoCard({
            title: "What happens next?",
            borderColor: BRAND_COLORS.success,
            background: "#E0F2FE",
            body: "If the company needs additional information or schedules an interview, you will receive another update from Job Portal.",
          })}
          ${ctaButton({ href: `${appUrl}/applications`, label: "View My Applications" })}
        </td>
      </tr>
    `,
  }),
});

export const interviewInviteTemplate = ({
  applicantName,
  jobTitle,
  companyName,
  scheduledAt,
  mode,
  meetLink,
  location,
  calendarLink,
  notes = "",
}) => ({
  subject: `Interview invite: ${jobTitle}`,
  html: createBaseTemplate({
    title: `Interview invite: ${jobTitle}`,
    preheader: `You are invited to interview for ${jobTitle} at ${companyName}`,
    content: `
      ${headerSection({
        label: "Interview Invitation",
        title: "You Are Invited To Interview",
        subtitle: "Your application has moved to the next stage",
        color: "blue",
        icon: "🤝",
      })}
      <tr>
        <td style="padding:42px 35px;background:#FFFFFF;">
          <p style="margin:0 0 24px;font-size:18px;color:${BRAND_COLORS.dark};font-weight:600;">
            👋 Hello ${escapeHtml(applicantName || "Candidate")},
          </p>
          <p style="margin:0 0 28px;font-size:15px;color:${BRAND_COLORS.darkGray};line-height:1.7;">
            Congratulations. ${escapeHtml(companyName)} would like to interview you for <strong>${escapeHtml(jobTitle)}</strong>.
          </p>
          <div style="background:linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);border-radius:12px;padding:25px;border:2px solid #3B82F6;margin-bottom:28px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #93C5FD;">
                  <p style="margin:0;font-size:13px;color:#1E3A8A;font-weight:700;">Schedule</p>
                  <p style="margin:5px 0 0;font-size:15px;color:${BRAND_COLORS.dark};">${escapeHtml(formatDateTime(scheduledAt))}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #93C5FD;">
                  <p style="margin:0;font-size:13px;color:#1E3A8A;font-weight:700;">Interview Mode</p>
                  <p style="margin:5px 0 0;font-size:15px;color:${BRAND_COLORS.dark};">${escapeHtml(mode || "To be confirmed")}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;">
                  <p style="margin:0;font-size:13px;color:#1E3A8A;font-weight:700;">${mode === "virtual" ? "Meeting Link" : "Location"}</p>
                  <p style="margin:5px 0 0;font-size:15px;color:${BRAND_COLORS.dark};word-break:break-word;">
                    ${mode === "virtual" && meetLink ? `<a href="${meetLink}" style="color:${BRAND_COLORS.primary};">${escapeHtml(meetLink)}</a>` : escapeHtml(location || "To be confirmed")}
                  </p>
                </td>
              </tr>
            </table>
          </div>
          ${
            notes
              ? infoCard({
                  title: "Notes from the company",
                  borderColor: BRAND_COLORS.warning,
                  background: "#FEF3C7",
                  body: escapeHtml(notes),
                })
              : ""
          }
          ${calendarLink ? ctaButton({ href: calendarLink, label: "Add to Calendar" }) : ctaButton({ href: `${appUrl}/applications`, label: "View Application" })}
        </td>
      </tr>
    `,
  }),
});

export default {
  fraudAlertTemplate,
  invoicePaidTemplate,
  applicationStatusTemplate,
  interviewInviteTemplate,
};
