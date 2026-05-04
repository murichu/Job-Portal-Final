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
