const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

const sendRecoveryEmail = async ({ email, name, link }) => {
    const passRecoveryMail = {
        from: `"Akademi" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Recuperación de contraseña',
        text: 
        `Hola ${name}!
        Se te ha enviado este link ${link} para que puedas recuperar tu contraseña.
        Este enlace caduca en 15m.`
    };

    try {
        await transporter.sendMail(passRecoveryMail);
    } catch (err) {
        throw new Error('Could not send email.');
    }
};

module.exports = sendRecoveryEmail;