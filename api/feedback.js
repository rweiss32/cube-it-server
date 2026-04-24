const { Resend } = require('resend');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const TYPE_LABELS = {
  bug:      '🐛 באג',
  feature:  '💡 בקשת תכונה',
  feedback: '💬 משוב',
};

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { type = 'feedback', subject, description, gameState, screenshot } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ error: 'Missing subject or description' });
    }

    const typeLabel = TYPE_LABELS[type] || TYPE_LABELS.feedback;

    const gameStateHtml = gameState
      ? `<h3 style="margin-top:24px;color:#4ecca3">מצב המשחק</h3>
         <table border="1" cellpadding="8" cellspacing="0"
                style="border-collapse:collapse;font-family:monospace;font-size:14px;direction:rtl">
           ${Object.entries(gameState)
               .map(([k, v]) => `<tr>
                 <td style="background:#f5f5f5;font-weight:bold;padding:6px 12px">${k}</td>
                 <td style="padding:6px 12px">${String(v).replace(/</g, '&lt;')}</td>
               </tr>`)
               .join('')}
         </table>`
      : '';

    const screenshotHtml = screenshot
      ? `<h3 style="margin-top:24px;color:#4ecca3">צילום מסך</h3>
         <img src="${screenshot}"
              style="max-width:100%;border:1px solid #ddd;border-radius:8px;display:block" />`
      : '';

    const html = `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#1a1a2e">
        <div style="background:#4ecca3;padding:16px 24px;border-radius:12px 12px 0 0">
          <h2 style="margin:0;color:#fff;font-size:1.2rem">${typeLabel}</h2>
        </div>
        <div style="border:1px solid #e0e0e0;border-top:none;padding:20px 24px;border-radius:0 0 12px 12px">
          <h3 style="margin-top:0">${subject.replace(/</g, '&lt;')}</h3>
          <p style="white-space:pre-wrap;line-height:1.7">${description.replace(/</g, '&lt;')}</p>
          ${gameStateHtml}
          ${screenshotHtml}
        </div>
      </div>
    `;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'קוביאות <feedback@cube-it.co.il>',
      to: ['raviv.weiss@gmail.com'],
      subject: `[קוביאות] ${typeLabel}: ${subject}`,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Feedback error:', error);
    return res.status(500).json({ error: 'Failed to send feedback' });
  }
}
