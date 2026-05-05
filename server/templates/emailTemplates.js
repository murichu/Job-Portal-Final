export const fraudAlertTemplate = ({ ip, reason }) => ({
  subject: "🚨 Suspicious M-Pesa Activity Detected",
  html: `
    <h2>Suspicious Activity Detected</h2>
    <p><strong>IP:</strong> ${ip}</p>
    <p><strong>Reason:</strong> ${reason}</p>
  `,
});

export const invoicePaidTemplate = ({ amount }) => ({
  subject: "Payment Successful",
  html: `
    <h2>Payment Received</h2>
    <p>We have received your payment of <strong>KES ${amount}</strong>.</p>
  `,
});

export const applicationStatusTemplate = ({ applicantName, jobTitle, status, companyName }) => ({
  subject: `Application update: ${jobTitle}`,
  html: `
    <h2>Hello ${applicantName || "Candidate"},</h2>
    <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> is now <strong>${status}</strong>.</p>
    <p>We will keep you informed about next steps.</p>
  `,
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
  html: `
    <h2>Hello ${applicantName || "Candidate"},</h2>
    <p>You are invited to interview for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
    <p><strong>Schedule:</strong> ${new Date(scheduledAt).toLocaleString()}</p>
    ${mode === "virtual"
      ? `<p><strong>Google Meet link:</strong> <a href="${meetLink}">${meetLink}</a></p>`
      : `<p><strong>Interview location:</strong> ${location}</p>`}
    ${calendarLink ? `<p><a href="${calendarLink}">Add to Google Calendar</a></p>` : ""}
    ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
  `,
});
