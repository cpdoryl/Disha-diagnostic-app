import express from 'express';
import path from 'path';
import nodemailer from 'nodemailer';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Contact API
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, phone, schoolName, role, students, message } = req.body;
      
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: process.env.SMTP_USER || '"Disha Diagnostic System" <noreply@disha.edu>',
        to: 'rylneuroacademy@gmail.com',
        subject: `New School Contact Request: ${schoolName}`,
        text: `
New Contact Request from Disha Platform:

Name: ${name}
Email: ${email}
Phone: ${phone}
School Name: ${schoolName}
Role: ${role}
Students: ${students}

Message / Requirements:
${message}
        `,
      };

      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
         await transporter.sendMail(mailOptions);
      } else {
         console.warn('SMTP_USER and SMTP_PASS are not set. Skipping actual email send. Email content:', mailOptions);
      }

      res.status(200).json({ success: true, message: 'Contact request received' });
    } catch (error: any) {
      console.error('Contact API error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
