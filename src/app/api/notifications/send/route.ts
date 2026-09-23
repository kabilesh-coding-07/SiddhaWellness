import { NextResponse } from 'next/server';

export interface NotificationRecord {
    id: string;
    type: 'APPOINTMENT_CONFIRMED' | 'BOOKING_RECEIVED' | 'APPOINTMENT_CANCELLED' | 'APPOINTMENT_REJECTED';
    title: string;
    message: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    doctorName: string;
    doctorSpecialty?: string;
    date: string;
    time: string;
    notes?: string;
    channel: {
        sms: boolean;
        smsStatus: 'SENT' | 'SIMULATED' | 'FAILED';
        email: boolean;
        emailStatus: 'SENT' | 'SIMULATED' | 'FAILED';
    };
    timestamp: string;
    read: boolean;
}

let notificationStore: NotificationRecord[] = [
    {
        id: 'notif_init_1',
        type: 'APPOINTMENT_CONFIRMED',
        title: 'Appointment Confirmed',
        message: 'Your consultation with Dr. Kavitha Rajan on Wed, 30 Sept at 06:00 PM has been confirmed.',
        patientName: 'Kabilesh',
        patientEmail: 'kabileshcoding07@gmail.com',
        patientPhone: '+91 98765 43210',
        doctorName: 'Dr. Kavitha Rajan',
        doctorSpecialty: 'Varmam & Pain Management',
        date: '2026-09-30',
        time: '06:00 PM',
        notes: 'Confirmed appointment. Prescribed preliminary herbal consultation.',
        channel: {
            sms: true,
            smsStatus: 'SENT',
            email: true,
            emailStatus: 'SENT',
        },
        timestamp: new Date().toISOString(),
        read: false,
    }
];

function generateEmailHtml(record: Partial<NotificationRecord>): string {
    const isConfirmed = record.type === 'APPOINTMENT_CONFIRMED';
    const isCancelled = record.type === 'APPOINTMENT_CANCELLED' || record.type === 'APPOINTMENT_REJECTED';
    const statusColor = isConfirmed ? '#059669' : isCancelled ? '#dc2626' : '#d97706';
    const statusBadge = isConfirmed ? 'CONFIRMED' : isCancelled ? 'CANCELLED' : 'REQUEST RECEIVED';
    const title = isConfirmed
        ? 'Consultation Confirmed by Doctor'
        : isCancelled
        ? 'Appointment Status Update: Cancelled'
        : 'Appointment Request Received';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0f0d; color: #f0fdf4; margin: 0; padding: 20px; }
    .container { max-width: 580px; margin: 0 auto; background: #111a16; border: 1px solid rgba(4,120,87,0.3); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #047857, #065f46); padding: 28px; text-align: center; }
    .logo { font-size: 26px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px; }
    .content { padding: 32px 24px; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}44; margin-bottom: 16px; }
    .card { background: rgba(4,120,87,0.08); border: 1px solid rgba(4,120,87,0.2); border-radius: 12px; padding: 20px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(4,120,87,0.1); font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .label { color: #6b8f7e; font-weight: 500; }
    .value { color: #f0fdf4; font-weight: 600; text-align: right; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b8f7e; border-top: 1px solid rgba(4,120,87,0.15); }
    .btn { display: inline-block; background: #059669; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌿 SiddhaWellness.in</div>
      <p style="margin: 6px 0 0; color: #d1fae5; font-size: 14px;">Holistic Siddha Healthcare & Consultations</p>
    </div>
    <div class="content">
      <span class="badge">${statusBadge}</span>
      <h2 style="margin: 0 0 8px; color: #f0fdf4; font-size: 20px;">${title}</h2>
      <p style="color: #a7c4b8; font-size: 14px; line-height: 1.5; margin: 0 0 16px;">
        Dear <strong>${record.patientName || 'Patient'}</strong>,
        ${isConfirmed
            ? 'Your Siddha medical consultation appointment has been accepted and confirmed by the doctor. Please find your schedule and clinical details below.'
            : isCancelled
            ? 'Your appointment has been cancelled. If this was unexpected, please contact the clinic or book an alternative slot.'
            : 'We have received your appointment booking request. The doctor is reviewing your consultation slot.'}
      </p>
      
      <div class="card">
        <div class="row"><span class="label">Consulting Doctor:</span><span class="value">${record.doctorName || 'Dr. Kavitha Rajan'}</span></div>
        <div class="row"><span class="label">Specialty:</span><span class="value">${record.doctorSpecialty || 'Siddha Specialist'}</span></div>
        <div class="row"><span class="label">Date:</span><span class="value">📅 ${record.date || ''}</span></div>
        <div class="row"><span class="label">Time:</span><span class="value">⏰ ${record.time || ''}</span></div>
        ${record.notes ? `<div class="row"><span class="label">Doctor Notes:</span><span class="value">${record.notes}</span></div>` : ''}
      </div>

      <div style="text-align: center;">
        <a href="https://siddhawellness.vercel.app/dashboard/appointments" class="btn">View in Patient Dashboard →</a>
      </div>
    </div>
    <div class="footer">
      SiddhaWellness Clinic · Traditional Tamil Medical Practice · Helpline: +91 98765 43210
    </div>
  </div>
</body>
</html>
`;
}

function generateSmsText(record: Partial<NotificationRecord>): string {
    const isConfirmed = record.type === 'APPOINTMENT_CONFIRMED';
    const isCancelled = record.type === 'APPOINTMENT_CANCELLED' || record.type === 'APPOINTMENT_REJECTED';

    if (isConfirmed) {
        return `🌿 SiddhaWellness: Hello ${record.patientName || 'Patient'}, your appointment with ${record.doctorName || 'Dr. Kavitha Rajan'} on ${record.date} at ${record.time} is CONFIRMED! Please arrive 10 mins early. Details: https://siddhawellness.vercel.app/dashboard/appointments`;
    }
    if (isCancelled) {
        return `🌿 SiddhaWellness: Hello ${record.patientName || 'Patient'}, your appointment on ${record.date} at ${record.time} has been CANCELLED. You can book a new slot at: https://siddhawellness.vercel.app/dashboard/book`;
    }
    return `🌿 SiddhaWellness: Hello ${record.patientName || 'Patient'}, your appointment request for ${record.date} at ${record.time} with ${record.doctorName || 'Dr. Kavitha Rajan'} has been received and is pending confirmation.`;
}

export async function GET() {
    return NextResponse.json({
        success: true,
        notifications: notificationStore,
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            type = 'APPOINTMENT_CONFIRMED',
            patientName = 'Kabilesh',
            patientEmail = 'kabileshcoding07@gmail.com',
            patientPhone = '+91 98765 43210',
            doctorName = 'Dr. Kavitha Rajan',
            doctorSpecialty = 'Varmam & Pain Management',
            date = new Date().toISOString().split('T')[0],
            time = '10:00 AM',
            notes = '',
        } = body;

        const smsText = generateSmsText({ type, patientName, doctorName, date, time });
        const emailHtml = generateEmailHtml({ type, patientName, doctorName, doctorSpecialty, date, time, notes });

        let smsStatus: 'SENT' | 'SIMULATED' | 'FAILED' = 'SIMULATED';
        let emailStatus: 'SENT' | 'SIMULATED' | 'FAILED' = 'SIMULATED';

        // 1. External Email Dispatch via Resend if RESEND_API_KEY is configured
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey && patientEmail) {
            try {
                const res = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from: 'SiddhaWellness <appointments@siddhawellness.in>',
                        to: [patientEmail],
                        subject: type === 'APPOINTMENT_CONFIRMED'
                            ? `Appointment Confirmed: ${doctorName} on ${date}`
                            : type === 'APPOINTMENT_CANCELLED' || type === 'APPOINTMENT_REJECTED'
                            ? `Appointment Cancelled: ${date}`
                            : `Appointment Request Received: ${date}`,
                        html: emailHtml,
                    }),
                });
                if (res.ok) {
                    emailStatus = 'SENT';
                }
            } catch {
                emailStatus = 'SIMULATED';
            }
        }

        // 2. External SMS Dispatch via Twilio if TWILIO credentials are configured
        const twilioSid = process.env.TWILIO_ACCOUNT_SID;
        const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
        const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

        if (twilioSid && twilioAuth && twilioFrom && patientPhone) {
            try {
                const params = new URLSearchParams({
                    To: patientPhone,
                    From: twilioFrom,
                    Body: smsText,
                });
                const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64'),
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString(),
                });
                if (res.ok) {
                    smsStatus = 'SENT';
                }
            } catch {
                smsStatus = 'SIMULATED';
            }
        }

        const title = type === 'APPOINTMENT_CONFIRMED'
            ? 'Appointment Confirmed 🎉'
            : type === 'APPOINTMENT_CANCELLED' || type === 'APPOINTMENT_REJECTED'
            ? 'Appointment Cancelled ⚠️'
            : 'Booking Request Received 📋';

        const record: NotificationRecord = {
            id: 'notif_' + Date.now(),
            type,
            title,
            message: smsText,
            patientName,
            patientEmail,
            patientPhone,
            doctorName,
            doctorSpecialty,
            date,
            time,
            notes,
            channel: {
                sms: Boolean(patientPhone),
                smsStatus,
                email: Boolean(patientEmail),
                emailStatus,
            },
            timestamp: new Date().toISOString(),
            read: false,
        };

        // Prepend to notification store
        notificationStore = [record, ...notificationStore.slice(0, 49)];

        return NextResponse.json({
            success: true,
            notification: record,
            smsText,
            delivery: {
                smsTo: patientPhone,
                smsStatus,
                emailTo: patientEmail,
                emailStatus,
            },
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
