// shared/emailNotifier.js
// Single EmailJS template handles both test and lesson emails

const EMAIL_SERVICE_ID  = 'service_nlclozn';
const EMAIL_TEMPLATE_ID = 'test-notification'; // reuse existing template
const EMAILJS_PUBLIC_KEY = 'Vr6ccYqxOyf_7gNzO';

function buildTestEmailHTML({ student_name, test_name, section, professor_name, test_date, test_time, deadline_date, deadline_time }) {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f4f6fa;font-family:Arial,sans-serif;}
  .wrapper{max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
  .header{background:linear-gradient(135deg,#0a1628 0%,#1e4d8c 100%);padding:32px 32px 24px;text-align:center;}
  .logo{font-size:28px;font-weight:900;color:#c8a84b;letter-spacing:2px;}
  .sub{font-size:12px;color:rgba(255,255,255,0.5);letter-spacing:3px;text-transform:uppercase;margin-top:6px;}
  .badge{display:inline-block;background:rgba(200,168,75,0.15);border:1px solid rgba(200,168,75,0.3);color:#c8a84b;border-radius:20px;padding:6px 16px;font-size:12px;font-weight:600;margin-top:12px;}
  .body{padding:32px;}
  .box{background:linear-gradient(135deg,#0a1628,#1e4d8c);border-radius:12px;padding:20px 24px;margin:20px 0;text-align:center;}
  .box-label{font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;}
  .box-value{font-size:22px;font-weight:800;color:#c8a84b;}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0;}
  .card{background:#f8fafc;border:1px solid #e1e6ef;border-radius:10px;padding:14px 16px;}
  .card-label{font-size:10px;color:#8a98ae;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:6px;}
  .card-value{font-size:14px;color:#0a1628;font-weight:700;}
  .deadline{background:#fff8e1;border:1.5px solid #f59e0b;border-radius:10px;padding:14px 16px;margin:20px 0;display:flex;align-items:flex-start;gap:12px;}
  .dl-title{font-size:11px;color:#b45309;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:4px;}
  .dl-value{font-size:15px;color:#92400e;font-weight:800;}
  .footer{background:#f4f6fa;padding:20px 32px;text-align:center;border-top:1px solid #e1e6ef;}
  .footer p{font-size:12px;color:#8a98ae;margin:4px 0;}
  @media(max-width:480px){.grid{grid-template-columns:1fr;}.body{padding:20px;}}
</style></head>
<body><div style="background:#f4f6fa;padding:24px 12px;">
<div class="wrapper">
  <div class="header">
    <div class="logo">UMakFIT</div>
    <div class="sub">College of Human Kinetics</div>
    <div class="badge">📋 New Test Assigned</div>
  </div>
  <div class="body">
    <p style="font-size:16px;color:#374151;margin-bottom:8px;">Hi <strong>${student_name}</strong>,</p>
    <p style="color:#6b7280;font-size:14px;margin-bottom:0;">Your professor has scheduled a new fitness test. Please review the details below.</p>
    <div class="box">
      <div class="box-label">Fitness Test</div>
      <div class="box-value">${test_name}</div>
    </div>
    <div class="grid">
      <div class="card"><div class="card-label">📚 Section</div><div class="card-value">${section}</div></div>
      <div class="card"><div class="card-label">👨‍🏫 Professor</div><div class="card-value">${professor_name}</div></div>
      <div class="card"><div class="card-label">📅 Test Date</div><div class="card-value">${test_date}</div></div>
      <div class="card"><div class="card-label">⏰ Available From</div><div class="card-value">${test_time}</div></div>
    </div>
    <div class="deadline">
      <div style="font-size:20px;">⚠️</div>
      <div>
        <div class="dl-title">Submission Deadline</div>
        <div class="dl-value">${deadline_date} at ${deadline_time}</div>
      </div>
    </div>
    <p style="font-size:13px;color:#6b7280;margin-top:16px;">Log in to <strong>UMakFIT</strong> to take the test before the deadline!</p>
  </div>
  <div class="footer">
    <p><strong style="color:#0a1628;">University of Makati — College of Human Kinetics</strong></p>
    <p>JP Rizal Ext., West Rembo, Taguig City</p>
    <p style="margin-top:8px;font-size:11px;">This is an automated message from UMakFIT. Please do not reply.</p>
  </div>
</div></div></body></html>`;
}

function buildLessonEmailHTML({ student_name, lesson_title, lesson_type, section, professor_name, publish_date, description }) {
    const typeIcon  = lesson_type === 'Video Lesson' ? '🎬' : '📖';
    const typeColor = lesson_type === 'Video Lesson' ? '#dc2626' : '#2d6fc4';
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f4f6fa;font-family:Arial,sans-serif;}
  .wrapper{max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
  .header{background:linear-gradient(135deg,#0a1628 0%,#1e4d8c 100%);padding:32px 32px 24px;text-align:center;}
  .logo{font-size:28px;font-weight:900;color:#c8a84b;letter-spacing:2px;}
  .sub{font-size:12px;color:rgba(255,255,255,0.5);letter-spacing:3px;text-transform:uppercase;margin-top:6px;}
  .badge{display:inline-block;background:rgba(200,168,75,0.15);border:1px solid rgba(200,168,75,0.3);color:#c8a84b;border-radius:20px;padding:6px 16px;font-size:12px;font-weight:600;margin-top:12px;}
  .body{padding:32px;}
  .box{background:linear-gradient(135deg,#0a1628,#1e4d8c);border-radius:12px;padding:20px 24px;margin:20px 0;text-align:center;}
  .box-label{font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;}
  .box-value{font-size:20px;font-weight:800;color:#c8a84b;line-height:1.3;}
  .type-badge{display:inline-block;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;margin-top:10px;}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0;}
  .card{background:#f8fafc;border:1px solid #e1e6ef;border-radius:10px;padding:14px 16px;}
  .card-label{font-size:10px;color:#8a98ae;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:6px;}
  .card-value{font-size:14px;color:#0a1628;font-weight:700;}
  .desc-box{background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:10px;padding:14px 16px;margin:20px 0;}
  .footer{background:#f4f6fa;padding:20px 32px;text-align:center;border-top:1px solid #e1e6ef;}
  .footer p{font-size:12px;color:#8a98ae;margin:4px 0;}
  @media(max-width:480px){.grid{grid-template-columns:1fr;}.body{padding:20px;}}
</style></head>
<body><div style="background:#f4f6fa;padding:24px 12px;">
<div class="wrapper">
  <div class="header">
    <div class="logo">UMakFIT</div>
    <div class="sub">College of Human Kinetics</div>
    <div class="badge">${typeIcon} 📚 New Lesson Available</div>
  </div>
  <div class="body">
    <p style="font-size:16px;color:#374151;margin-bottom:8px;">Hi <strong>${student_name}</strong>,</p>
    <p style="color:#6b7280;font-size:14px;margin-bottom:0;">Your professor has published a new lesson. Check it out on UMakFIT!</p>
    <div class="box">
      <div class="box-label">📚 New Lesson</div>
      <div class="box-value">${lesson_title}</div>
      <div class="type-badge" style="background:rgba(255,255,255,0.15);color:white;">${typeIcon} ${lesson_type}</div>
    </div>
    <div class="grid">
      <div class="card"><div class="card-label">📚 Section</div><div class="card-value">${section}</div></div>
      <div class="card"><div class="card-label">👨‍🏫 Professor</div><div class="card-value">${professor_name}</div></div>
      <div class="card" style="grid-column:1/-1;"><div class="card-label">📅 Published On</div><div class="card-value">${publish_date}</div></div>
    </div>
    ${description ? `<div class="desc-box"><div style="font-size:11px;color:#0369a1;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">📝 Description</div><p style="font-size:13px;color:#374151;margin:0;line-height:1.6;">${description}</p></div>` : ''}
    <p style="font-size:13px;color:#6b7280;margin-top:16px;">Log in to <strong>UMakFIT</strong> to view the full lesson content.</p>
  </div>
  <div class="footer">
    <p><strong style="color:#0a1628;">University of Makati — College of Human Kinetics</strong></p>
    <p>JP Rizal Ext., West Rembo, Taguig City</p>
    <p style="margin-top:8px;font-size:11px;">This is an automated message from UMakFIT. Please do not reply.</p>
  </div>
</div></div></body></html>`;
}

export async function sendTestEmail({ to_email, student_name, test_name, section, professor_name, test_date, test_time, deadline_date, deadline_time }) {
    const html = buildTestEmailHTML({ student_name, test_name, section, professor_name, test_date, test_time, deadline_date, deadline_time });
    return emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, {
        to_email,
        subject: `📋 New Fitness Test Assigned: ${test_name} — ${section}`,
        html_content: html,
    });
}
function buildReminderEmailHTML({ student_name, test_name, section, professor_name, deadline_date, deadline_time, hours_left }) {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f4f6fa;font-family:Arial,sans-serif;}
  .wrapper{max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
  .header{background:linear-gradient(135deg,#7c2d12 0%,#b45309 100%);padding:32px 32px 24px;text-align:center;}
  .logo{font-size:28px;font-weight:900;color:#fef3c7;letter-spacing:2px;}
  .sub{font-size:12px;color:rgba(255,255,255,0.5);letter-spacing:3px;text-transform:uppercase;margin-top:6px;}
  .badge{display:inline-block;background:rgba(254,243,199,0.15);border:1px solid rgba(254,243,199,0.35);color:#fef3c7;border-radius:20px;padding:6px 16px;font-size:12px;font-weight:700;margin-top:12px;}
  .body{padding:32px;}
  .countdown{background:linear-gradient(135deg,#7c2d12,#b45309);border-radius:14px;padding:24px;margin:20px 0;text-align:center;}
  .countdown-label{font-size:11px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;}
  .countdown-value{font-size:48px;font-weight:900;color:#fef3c7;line-height:1;}
  .countdown-unit{font-size:14px;color:rgba(255,255,255,0.7);margin-top:4px;}
  .footer{background:#f4f6fa;padding:20px 32px;text-align:center;border-top:1px solid #e1e6ef;}
  .footer p{font-size:12px;color:#8a98ae;margin:4px 0;}
</style></head>
<body><div style="background:#f4f6fa;padding:24px 12px;">
<div class="wrapper">
  <div class="header">
    <div class="logo">UMakFIT</div>
    <div class="sub">College of Human Kinetics</div>
    <div class="badge">⏰ Deadline Reminder</div>
  </div>
  <div class="body">
    <p style="font-size:16px;color:#374151;margin-bottom:8px;">Hi <strong>${student_name}</strong>,</p>
    <p style="color:#6b7280;font-size:14px;margin-bottom:0;">This is a reminder that your fitness test deadline is approaching!</p>
    <div class="countdown">
      <div class="countdown-label">Time Remaining</div>
      <div class="countdown-value">${hours_left}</div>
      <div class="countdown-unit">hour${hours_left !== 1 ? 's' : ''} left</div>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td style="width:50%;padding-right:6px;">
          <div style="background:#f8fafc;border:1px solid #e1e6ef;border-radius:10px;padding:14px 16px;">
            <div style="font-size:10px;color:#8a98ae;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:5px;">🏃 Test</div>
            <div style="font-size:14px;color:#0a1628;font-weight:700;">${test_name}</div>
          </div>
        </td>
        <td style="width:50%;padding-left:6px;">
          <div style="background:#f8fafc;border:1px solid #e1e6ef;border-radius:10px;padding:14px 16px;">
            <div style="font-size:10px;color:#8a98ae;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:5px;">📚 Section</div>
            <div style="font-size:14px;color:#0a1628;font-weight:700;">${section}</div>
          </div>
        </td>
      </tr>
      <tr><td colspan="2" style="padding-top:10px;">
        <div style="background:#fff8e1;border:1.5px solid #f59e0b;border-radius:10px;padding:14px 16px;">
          <div style="font-size:10px;color:#b45309;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:5px;">⚠️ Deadline</div>
          <div style="font-size:15px;color:#92400e;font-weight:800;">${deadline_date} at ${deadline_time}</div>
        </div>
      </td></tr>
    </table>
    <p style="font-size:13px;color:#6b7280;margin-top:16px;">Log in to <strong>UMakFIT</strong> now and complete your test before the deadline!</p>
  </div>
  <div class="footer">
    <p><strong style="color:#0a1628;">University of Makati — College of Human Kinetics</strong></p>
    <p>JP Rizal Ext., West Rembo, Taguig City</p>
    <p style="margin-top:8px;font-size:11px;">This is an automated reminder from UMakFIT. Please do not reply.</p>
  </div>
</div></div></body></html>`;
}

export async function sendReminderEmail({ to_email, student_name, test_name, section, professor_name, deadline_date, deadline_time, hours_left }) {
    const html = buildReminderEmailHTML({ student_name, test_name, section, professor_name, deadline_date, deadline_time, hours_left });
    return emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, {
        to_email,
        subject: `⏰ Reminder: ${test_name} deadline in ${hours_left} hour${hours_left !== 1 ? 's' : ''}!`,
        html_content: html,
    });
}
export async function sendLessonEmail({ to_email, student_name, lesson_title, lesson_type, section, professor_name, publish_date, description }) {
    const html = buildLessonEmailHTML({ student_name, lesson_title, lesson_type, section, professor_name, publish_date, description });
    return emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, {
        to_email,
        subject: `📚 New Lesson Available: ${lesson_title} — ${section}`,
        html_content: html,
    });
    
}