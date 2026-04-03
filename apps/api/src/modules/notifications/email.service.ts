import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  const { data, error } = await resend.emails.send({
    from: 'EldEra <noreply@eldera.app>',
    to,
    subject,
    html,
  })

  if (error) throw new Error(error.message)
  return data
}

export const sendWeeklyDigestEmail = async (
  to: string,
  elderName: string,
  digest: string
) => {
  return sendEmail(
    to,
    `Weekly Health Update — ${elderName}`,
    `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">EldEra Weekly Health Digest</h2>
      <p>Here is the weekly health summary for <strong>${elderName}</strong>:</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0;">${digest}</p>
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        Log in to EldEra to see more details and manage care.
      </p>
    </div>
    `
  )
}

export const sendAlertEmail = async (
  to: string,
  elderName: string,
  alertMessage: string
) => {
  return sendEmail(
    to,
    `Alert: ${elderName} needs attention`,
    `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">EldEra Alert</h2>
      <p>An alert has been triggered for <strong>${elderName}</strong>:</p>
      <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 4px; margin: 16px 0;">
        <p style="margin: 0;">${alertMessage}</p>
      </div>
      <p>Please check on your family member immediately.</p>
    </div>
    `
  )
}