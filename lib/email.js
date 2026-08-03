// Sends transactional email via Resend. No-ops safely if RESEND_API_KEY isn't
// set, so the app still works (leads still save) even before email is wired up.
// From-address defaults to Resend's shared onboarding sender, which works
// without domain verification for testing; set EMAIL_FROM to your own verified
// domain for production so mail doesn't land in spam.
export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping email to", to);
    return { skipped: true };
  }
  if (!to) return { skipped: true };

  const from = process.env.EMAIL_FROM || "Knollside <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Resend send failed:", res.status, detail);
      return { error: true };
    }
    return { ok: true };
  } catch (err) {
    console.error("Resend send threw:", err);
    return { error: true };
  }
}

function money(n) {
  return `$${Math.round(n).toLocaleString()}`;
}

export function businessLeadEmail({ businessName, lead, low, high }) {
  const addons = (lead.addons_selected || [])
    .map((a) => `<li>${a.name}${a.qty > 1 ? ` × ${a.qty}` : ""}</li>`)
    .join("");
  return {
    subject: `New estimate request from ${lead.customer_name}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px">
        <h2 style="color:#211F1B">New lead for ${businessName}</h2>
        <p><strong>${lead.customer_name}</strong> just requested an estimate.</p>
        <table style="font-size:14px;color:#333">
          <tr><td style="padding:2px 8px 2px 0">Email:</td><td>${lead.customer_email}</td></tr>
          ${lead.customer_phone ? `<tr><td style="padding:2px 8px 2px 0">Phone:</td><td>${lead.customer_phone}</td></tr>` : ""}
          <tr><td style="padding:2px 8px 2px 0">Item:</td><td>${lead.item_name || ""}${lead.quantity ? `, ${lead.quantity}` : ""}${lead.option_name ? ` · ${lead.option_name}` : ""}</td></tr>
          <tr><td style="padding:2px 8px 2px 0">Estimate:</td><td><strong>${money(low)}–${money(high)}</strong></td></tr>
        </table>
        ${addons ? `<p style="font-size:14px">Add-ons:</p><ul style="font-size:14px">${addons}</ul>` : ""}
        ${lead.comments ? `<p style="font-size:14px;border-left:3px solid #DDD3BF;padding-left:10px;color:#555"><em>"${lead.comments}"</em></p>` : ""}
        <p style="font-size:13px;color:#999">Log in to your Knollside dashboard to follow up.</p>
      </div>`,
  };
}

export function customerConfirmationEmail({ businessName, lead, low, high }) {
  return {
    subject: `Your estimate from ${businessName}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px">
        <h2 style="color:#211F1B">Thanks, ${lead.customer_name.split(" ")[0] || "there"}!</h2>
        <p>Here's the estimate you requested from <strong>${businessName}</strong>:</p>
        <div style="background:#211F1B;color:#F7F3EA;padding:20px;border-radius:12px;font-family:ui-monospace,monospace">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#BDB49F">
            ${lead.item_name || ""}${lead.quantity ? ` · ${lead.quantity}` : ""}
          </div>
          <div style="font-size:28px;font-weight:600;margin-top:6px">${money(low)}–${money(high)}</div>
        </div>
        <p style="font-size:13px;color:#777;margin-top:14px">
          This is an estimate only, subject to final confirmation. ${businessName} will follow up with you shortly.
        </p>
      </div>`,
  };
}
