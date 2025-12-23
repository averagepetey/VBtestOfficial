import { loadUploads } from './watcher';

type UploadEntry = {
  id: string;
  client_name: string;
  client_email: string;
  design_name: string;
  upload_path: string;
  dst_path: string | null;
  status: 'pending' | 'processing' | 'ready' | 'error';
  created_at: string;
  updated_at: string;
};

/**
 * Send email notifications to clients when their DST files are ready
 * 
 * This uses nodemailer. To use:
 * 1. Install: npm install nodemailer @types/nodemailer
 * 2. Set environment variables:
 *    - EMAIL_USER=your-email@gmail.com
 *    - EMAIL_PASS=your-app-password
 *    - BASE_URL=http://localhost:3000 (or your domain)
 */

async function sendEmailNotification(upload: UploadEntry) {
  // This is a template - uncomment and configure when ready
  /*
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const downloadUrl = `${process.env.BASE_URL}/download/${upload.id}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: upload.client_email,
    subject: `Your DST file is ready: ${upload.design_name}`,
    html: `
      <h2>Your DST file is ready!</h2>
      <p>Hello ${upload.client_name},</p>
      <p>Your design "${upload.design_name}" has been successfully converted to DST format.</p>
      <p><a href="${downloadUrl}">Download your DST file</a></p>
      <p>Thank you for using our service!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`  ✅ Email sent to ${upload.client_email}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to send email:`, error);
    return false;
  }
  */
  
  // For now, just log the notification
  console.log(`  📧 Would send email to ${upload.client_email} for ${upload.design_name}`);
  console.log(`     Download link: /download/${upload.id}`);
  return true;
}

function notifyReadyClients() {
  const uploads = loadUploads();
  const ready = uploads.filter((u) => u.status === 'ready' && u.dst_path);
  
  if (!ready.length) {
    console.log('✅ No ready files to notify');
    return;
  }

  console.log(`\n📧 Notifying ${ready.length} client(s)...\n`);

  ready.forEach(async (upload) => {
    console.log(`Notifying: ${upload.client_name} (${upload.client_email})`);
    await sendEmailNotification(upload);
  });

  console.log('\n✅ Notifications complete\n');
}

// Export for use in other scripts
export { notifyReadyClients, sendEmailNotification };

// If run directly, execute notifications
if (require.main === module) {
  notifyReadyClients();
}
