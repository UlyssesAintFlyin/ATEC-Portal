const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

async function sendEmail(to, subject, text) {
    try {
        await transporter.sendMail({
            from: `"ATEC AXIOM" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        });
        return true;
    } catch (error) {
        console.error('Email Delivery Error:', error);
        return false;
    }
}

module.exports = { sendEmail };