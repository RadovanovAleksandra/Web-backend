const nodemailer = require('nodemailer');

// Konfiguracija email servisa
const transporter = nodemailer.createTransport({
    service: 'gmail', // ili drugi email servis
    auth: {
        user: 'your-email@gmail.com', // zamenite sa vašim email-om
        pass: 'your-password' // zamenite sa vašom šifrom
    }
});

// Funkcija za slanje email notifikacija
const sendEmailNotification = (to, subject, text) => {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to,
        subject,
        text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Greška pri slanju email-a:", error);
        } else {
            console.log("Email poslat:", info.response);
        }
    });
};

module.exports = {
    sendEmailNotification
};
