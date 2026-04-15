import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "EldEra <notifications@resend.dev>";
const DEV_OVERRIDE = process.env.EMAIL_DEV_OVERRIDE;

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
): Promise<void> => {
  const originalTo = to;
  const effectiveTo = DEV_OVERRIDE || to;
  const effectiveSubject = DEV_OVERRIDE
    ? `[DEV → ${originalTo}] ${subject}`
    : subject;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: effectiveTo,
      subject: effectiveSubject,
      html,
    });
    if (error) {
      console.error(`❌ Email rejected for ${effectiveTo}:`, error);
      return;
    }
    console.log(
      `✅ Email sent to ${effectiveTo}${DEV_OVERRIDE ? ` (orig=${originalTo})` : ""} (id=${data?.id}): ${subject}`,
    );
  } catch (err) {
    console.error(`❌ Email threw for ${effectiveTo}:`, err);
  }
};

export const sendSOSAlert = async (
  to: string,
  elderName: string,
  city: string,
  emergencyContact: string,
) => {
  return sendEmail(
    to,
    `🆘 URGENT: ${elderName} has triggered an SOS`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#dc2626;padding:20px;border-radius:12px;text-align:center;margin-bottom:24px">
        <h1 style="color:#fff;margin:0;font-size:28px">🆘 SOS ALERT</h1>
      </div>
      <h2 style="color:#111">${elderName} needs immediate help</h2>
      <p style="color:#555;font-size:16px">An SOS alert was just triggered by <strong>${elderName}</strong>.</p>
      <div style="background:#fef2f2;border:1px solid #fecaca;padding:16px;border-radius:8px;margin:20px 0">
        <p style="margin:0 0 8px;color:#991b1b"><strong>Location:</strong> ${city}</p>
        <p style="margin:0;color:#991b1b"><strong>Emergency Contact:</strong> ${emergencyContact}</p>
      </div>
      <p style="color:#555">Please check on ${elderName} immediately or call the emergency contact listed above.</p>
      <a href="https://elderaweb-production.up.railway.app/alerts" 
         style="display:inline-block;background:#dc2626;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:12px">
        View Alert in EldEra
      </a>
      <p style="color:#999;font-size:12px;margin-top:24px">This is an automated alert from EldEra Elderly Care Platform.</p>
    </div>
    `,
  );
};

export const sendBookingConfirmation = async (
  to: string,
  caregiverName: string,
  elderName: string,
  startTime: string,
  endTime: string,
  amount: number,
  status: "confirmed" | "cancelled",
) => {
  const isConfirmed = status === "confirmed";
  return sendEmail(
    to,
    `Booking ${isConfirmed ? "Confirmed" : "Cancelled"}: ${caregiverName} for ${elderName}`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:${isConfirmed ? "#16a34a" : "#dc2626"};padding:16px;border-radius:12px;margin-bottom:24px">
        <h2 style="color:#fff;margin:0">Booking ${isConfirmed ? "✅ Confirmed" : "❌ Cancelled"}</h2>
      </div>
      <p style="color:#555;font-size:16px">
        The booking for <strong>${caregiverName}</strong> to care for <strong>${elderName}</strong> has been <strong>${status}</strong>.
      </p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px;border-radius:8px;margin:20px 0">
        <p style="margin:0 0 8px;color:#374151"><strong>Caregiver:</strong> ${caregiverName}</p>
        <p style="margin:0 0 8px;color:#374151"><strong>Elder:</strong> ${elderName}</p>
        <p style="margin:0 0 8px;color:#374151"><strong>From:</strong> ${startTime}</p>
        <p style="margin:0 0 8px;color:#374151"><strong>To:</strong> ${endTime}</p>
        <p style="margin:0;color:#374151"><strong>Amount:</strong> ₹${amount.toFixed(0)}</p>
      </div>
      <a href="https://elderaweb-production.up.railway.app/dashboard"
         style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
        View in EldEra
      </a>
    </div>
    `,
  );
};

export const sendCaregiverBookingAlert = async (
  to: string,
  caregiverName: string,
  elderName: string,
  startTime: string,
  endTime: string,
  amount: number,
  notes: string,
) => {
  return sendEmail(
    to,
    `New Booking Request: Care for ${elderName}`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#2563eb;padding:16px;border-radius:12px;margin-bottom:24px">
        <h2 style="color:#fff;margin:0">🤝 New Booking Request</h2>
      </div>
      <p style="color:#555;font-size:16px">Hello <strong>${caregiverName}</strong>, you have a new booking request!</p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px;border-radius:8px;margin:20px 0">
        <p style="margin:0 0 8px;color:#374151"><strong>Elder:</strong> ${elderName}</p>
        <p style="margin:0 0 8px;color:#374151"><strong>From:</strong> ${startTime}</p>
        <p style="margin:0 0 8px;color:#374151"><strong>To:</strong> ${endTime}</p>
        <p style="margin:0 0 8px;color:#374151"><strong>You'll earn:</strong> ₹${amount.toFixed(0)}</p>
        ${notes ? `<p style="margin:0;color:#374151"><strong>Notes:</strong> ${notes}</p>` : ""}
      </div>
      <p style="color:#555">Log in to accept or reject this booking.</p>
      <a href="https://elderaweb-production.up.railway.app/dashboard"
         style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
        View Booking in EldEra
      </a>
    </div>
    `,
  );
};

export const sendMedicationReminder = async (
  to: string,
  elderName: string,
  medications: Array<{ name: string; dosage: string; time: string }>,
) => {
  const medList = medications
    .map(
      (m) =>
        `<li style="color:#374151;margin-bottom:8px"><strong>${m.name}</strong> — ${m.dosage} at ${m.time}</li>`,
    )
    .join("");

  return sendEmail(
    to,
    `💊 Medication Reminder for ${elderName}`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#7c3aed;padding:16px;border-radius:12px;margin-bottom:24px">
        <h2 style="color:#fff;margin:0">💊 Time for Medication</h2>
      </div>
      <p style="color:#555;font-size:16px">Hello <strong>${elderName}</strong>, it's time to take your medication:</p>
      <ul style="background:#f9fafb;border:1px solid #e5e7eb;padding:20px 20px 20px 36px;border-radius:8px;margin:20px 0">
        ${medList}
      </ul>
      <p style="color:#555">Please take your medication and log it in EldEra.</p>
      <a href="https://elderaweb-production.up.railway.app/medications"
         style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
        Log Medication
      </a>
    </div>
    `,
  );
};

export const sendWeeklyDigest = async (
  to: string,
  elderName: string,
  digest: string,
  avgMood: number,
  latestBP: string | null,
  medicationAdherence: number,
) => {
  return sendEmail(
    to,
    `📊 Weekly Health Report: ${elderName}`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#0f6e56;padding:16px;border-radius:12px;margin-bottom:24px">
        <h2 style="color:#fff;margin:0">📊 Weekly Health Report</h2>
        <p style="color:#9FE1CB;margin:4px 0 0;font-size:14px">${elderName}</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px">
        <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px;border-radius:8px;text-align:center">
          <p style="font-size:28px;font-weight:700;color:#2563eb;margin:0">${avgMood}/10</p>
          <p style="color:#6b7280;font-size:12px;margin:4px 0 0">Avg Mood</p>
        </div>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px;border-radius:8px;text-align:center">
          <p style="font-size:28px;font-weight:700;color:#16a34a;margin:0">${latestBP ?? "—"}</p>
          <p style="color:#6b7280;font-size:12px;margin:4px 0 0">Blood Pressure</p>
        </div>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px;border-radius:8px;text-align:center">
          <p style="font-size:28px;font-weight:700;color:#7c3aed;margin:0">${medicationAdherence}%</p>
          <p style="color:#6b7280;font-size:12px;margin:4px 0 0">Med Adherence</p>
        </div>
      </div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:16px;border-radius:8px;margin-bottom:20px">
        <h3 style="color:#166534;margin:0 0 8px">AI Health Summary</h3>
        <p style="color:#374151;margin:0;line-height:1.6">${digest}</p>
      </div>
      <a href="https://elderaweb-production.up.railway.app/dashboard"
         style="display:inline-block;background:#0f6e56;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
        View Full Report
      </a>
    </div>
    `,
  );
};
