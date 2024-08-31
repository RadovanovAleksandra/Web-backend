const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const doctorController = require('../controllers/doctorController');
const patientController = require('../controllers/patientController');
const therapyController = require('../controllers/therapyController');
const reportController = require('../controllers/reportController');
const notificationController = require('../controllers/notificationController');
const searchController = require('../controllers/searchController');
const emailController = require('../controllers/emailController');
const ratingController = require('../controllers/ratingController');
const auditLogController = require('../controllers/auditLogController');
const appointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const jwt = require('jsonwebtoken');

// Funkcija za prijavu korisnika (ovde se obično pretražuju korisnici)
const loginUser = (username, password) => {
    // Primer hardkodovanog korisnika; ovo biste promenili na osnovu vašeg sistema
    const users = [
        { username: 'admin', password: 'admin_password', email: 'admin@example.com', jmbg: '1234567890123', role: 'Administrator' }
    ];

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Generišite JWT token
        const token = jwt.sign(
            { username: user.username, role: user.role }, 
            'your_secret_key', 
            { expiresIn: '1h' }
        );

        return { ...user, token }; // Vratite korisnika zajedno sa tokenom
    } else {
        return null;
    }
};

// Definišite rutu za prijavu
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = loginUser(username, password);

    if (user) {
        res.json({
            message: 'Prijava uspešna',
            user: {
                username: user.username,
                email: user.email,
                jmbg: user.jmbg,
                role: user.role,
                token: user.token // Dodajte token ovde
            }
        });
    } else {
        res.status(401).json({ message: 'Neispravno korisničko ime ili šifra' });
    }
});
// Ruta za prijavu korisnika
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = userController.loginUser(username, password);

    if (user) {
        auditLogController.logActivity(username, "Prijava u sistem");
        res.status(200).json({ message: "Prijava uspešna", user });
    } else {
        res.status(401).json({ message: "Neispravno korisničko ime ili šifra" });
    }
});

// Ruta za slanje notifikacija pacijentu
router.post('/notifications/patient', authenticate, authorize(['Administrator', 'Lekar']), (req, res) => {
    const { username, message } = req.body;
    const result = notificationController.notifyPatient(username, message);

    if (result.success) {
        auditLogController.logActivity(req.user.username, `Poslana notifikacija pacijentu: ${username}`);
        res.status(200).json({ message: result.message });
    } else {
        res.status(400).json({ message: result.message });
    }
});

// Ruta za slanje notifikacija lekaru
router.post('/notifications/doctor', authenticate, authorize(['Administrator']), (req, res) => {
    const { username, message } = req.body;
    const result = notificationController.notifyDoctor(username, message);

    if (result.success) {
        auditLogController.logActivity(req.user.username, `Poslana notifikacija lekaru: ${username}`);
        res.status(200).json({ message: result.message });
    } else {
        res.status(400).json({ message: result.message });
    }
});

// Ruta za promenu lozinke korisnika od strane administratora
router.put('/users/change-password', authenticate, authorize(['Administrator']), (req, res) => {
    const { username, newPassword } = req.body;
    const result = adminController.changePassword(username, newPassword);

    if (result.success) {
        auditLogController.logActivity(req.user.username, `Promenjena lozinka za korisnika: ${username}`);
        res.status(200).json({ message: result.message });
    } else {
        res.status(400).json({ message: result.message });
    }
});

// Ruta za resetovanje naloga od strane administratora
router.put('/users/reset-account', authenticate, authorize(['Administrator']), (req, res) => {
    const { username } = req.body;
    const result = adminController.resetAccount(username);

    if (result.success) {
        auditLogController.logActivity(req.user.username, `Resetovan nalog za korisnika: ${username}`);
        res.status(200).json({ message: result.message });
    } else {
        res.status(400).json({ message: result.message });
    }
});

// Ruta za pretragu korisnika
router.get('/search/users', authenticate, authorize(['Administrator', 'Lekar']), (req, res) => {
    const { query } = req.query;
    const results = searchController.searchUsers(query);
    auditLogController.logActivity(req.user.username, `Pretraga korisnika: ${query}`);
    res.status(200).json({ message: "Pretraga korisnika uspešna", results });
});

// Ruta za pretragu termina
router.get('/search/appointments', authenticate, authorize(['Administrator', 'Lekar']), (req, res) => {
    const { query } = req.query;
    const results = searchController.searchAppointments(query);
    auditLogController.logActivity(req.user.username, `Pretraga termina: ${query}`);
    res.status(200).json({ message: "Pretraga termina uspešna", results });
});

// Ruta za pretragu terapija
router.get('/search/therapies', authenticate, authorize(['Administrator', 'Lekar', 'Pacijent']), (req, res) => {
    const { query } = req.query;
    const results = searchController.searchTherapies(query);
    auditLogController.logActivity(req.user.username, `Pretraga terapija: ${query}`);
    res.status(200).json({ message: "Pretraga terapija uspešna", results });
});

// Ruta za slanje email notifikacije pacijentu
router.post('/notifications/email/patient', authenticate, authorize(['Administrator', 'Lekar']), (req, res) => {
    const { email, subject, message } = req.body;
    emailController.sendEmailNotification(email, subject, message);
    auditLogController.logActivity(req.user.username, `Poslan email pacijentu: ${email}`);
    res.status(200).json({ message: "Email notifikacija poslana pacijentu" });
});

// Ruta za slanje email notifikacije lekaru
router.post('/notifications/email/doctor', authenticate, authorize(['Administrator']), (req, res) => {
    const { email, subject, message } = req.body;
    emailController.sendEmailNotification(email, subject, message);
    auditLogController.logActivity(req.user.username, `Poslan email lekaru: ${email}`);
    res.status(200).json({ message: "Email notifikacija poslana lekaru" });
});

// Ruta za filtriranje i sortiranje pacijenata za administratore
router.get('/patients/filter', authenticate, authorize(['Administrator']), (req, res) => {
    const filters = {
        jmbg: req.query.jmbg,
        name: req.query.name,
        surname: req.query.surname,
        dateOfBirth: req.query.dateOfBirth,
        email: req.query.email
    };
    const sortBy = req.query.sortBy;
    const results = adminController.filterAndSortPatients(filters, sortBy);

    auditLogController.logActivity(req.user.username, `Filtriranje i sortiranje pacijenata`);
    res.status(200).json({ message: "Filtriranje i sortiranje pacijenata uspešno", results });
});


// Zaštićene rute koje zahtevaju autentifikaciju i odgovarajuću autorizaciju

// Administrator rute

// Kreiranje pacijenta od strane administratora
router.post('/patients/create', authenticate, authorize(['Administrator']), (req, res) => {
    const { patientData } = req.body;
    const newPatient = adminController.createPatient(patientData);

    if (newPatient) {
        auditLogController.logActivity(req.user.username, `Kreiran pacijent: ${patientData.username}`);
        res.status(200).json({ message: "Pacijent uspešno kreiran", newPatient });
    } else {
        res.status(400).json({ message: "Pacijent nije mogao biti kreiran" });
    }
});

// Ažuriranje podataka o pacijentu od strane administratora
router.put('/patients/update/:username', authenticate, authorize(['Administrator']), (req, res) => {
    const { patientData } = req.body;
    const { username } = req.params;
    const updatedPatient = adminController.updatePatient(username, patientData);

    if (updatedPatient) {
        auditLogController.logActivity(req.user.username, `Ažuriran pacijent: ${username}`);
        res.status(200).json({ message: "Pacijent uspešno ažuriran", updatedPatient });
    } else {
        res.status(400).json({ message: "Pacijent nije mogao biti ažuriran" });
    }
});

// Brisanje pacijenta od strane administratora
router.delete('/patients/delete/:username', authenticate, authorize(['Administrator']), (req, res) => {
    const { username } = req.params;
    const success = adminController.deletePatient(username);

    if (success) {
        auditLogController.logActivity(req.user.username, `Obrisan pacijent: ${username}`);
        res.status(200).json({ message: "Pacijent uspešno obrisan" });
    } else {
        res.status(400).json({ message: "Pacijent nije mogao biti obrisan" });
    }
});

// Pregled svih pacijenata od strane administratora
router.get('/patients', authenticate, authorize(['Administrator']), (req, res) => {
    const patients = adminController.getAllPatients();
    auditLogController.logActivity(req.user.username, "Pregled svih pacijenata");
    res.status(200).json({ message: "Pregled pacijenata uspešan", patients });
});

// Ruta za generisanje izveštaja o terminima
router.get('/reports/appointments', authenticate, authorize(['Administrator']), (req, res) => {
    const report = reportController.generateAppointmentsReport();
    auditLogController.logActivity(req.user.username, "Generisanje izveštaja o terminima");
    res.status(200).json({ message: "Izveštaj o terminima generisan uspešno", report });
});

// Ruta za generisanje izveštaja o terapijama
router.get('/reports/therapies', authenticate, authorize(['Administrator']), (req, res) => {
    const report = reportController.generateTherapiesReport();
    auditLogController.logActivity(req.user.username, "Generisanje izveštaja o terapijama");
    res.status(200).json({ message: "Izveštaj o terapijama generisan uspešno", report });
});

// Ruta za generisanje izveštaja o korisnicima
router.get('/reports/users', authenticate, authorize(['Administrator']), (req, res) => {
    const report = reportController.generateUsersReport();
    auditLogController.logActivity(req.user.username, "Generisanje izveštaja o korisnicima");
    res.status(200).json({ message: "Izveštaj o korisnicima generisan uspešno", report });
});

// Lekar rute

// Kreiranje termina od strane lekara
router.post('/appointments/create', authenticate, authorize(['Lekar']), (req, res) => {
    const { doctorUsername, date, time } = req.body;
    const appointment = doctorController.createAppointment(doctorUsername, date, time);

    if (appointment) {
        auditLogController.logActivity(req.user.username, `Kreiran termin za doktora: ${doctorUsername}`);
        res.status(200).json({ message: "Termin uspešno kreiran", appointment });
    } else {
        res.status(400).json({ message: "Termin nije mogao biti kreiran" });
    }
});

// Brisanje termina od strane lekara
router.delete('/appointments/delete/:id', authenticate, authorize(['Lekar']), (req, res) => {
    const { id } = req.params;
    const { doctorUsername } = req.body;
    const success = doctorController.deleteAppointment(id, doctorUsername);

    if (success) {
        auditLogController.logActivity(req.user.username, `Obrisan termin: ${id} od strane doktora: ${doctorUsername}`);
        res.status(200).json({ message: "Termin uspešno obrisan" });
    } else {
        res.status(400).json({ message: "Termin nije mogao biti obrisan" });
    }
});

// Pregled termina lekara
router.get('/appointments/doctor/:username', authenticate, authorize(['Lekar']), (req, res) => {
    const { username } = req.params;
    const appointments = doctorController.getAppointmentsByDoctor(username);
    auditLogController.logActivity(req.user.username, `Pregled termina doktora: ${username}`);
    res.status(200).json({ message: "Pregled termina uspešan", appointments });
});

// Pacijent rute

// Zakazivanje termina od strane pacijenta
router.post('/appointments', authenticate, authorize(['Pacijent']), (req, res) => {
    const { username, doctor, date, time } = req.body;
    const appointment = patientController.scheduleAppointment(username, doctor, date, time);

    if (appointment) {
        auditLogController.logActivity(req.user.username, `Pacijent ${username} zakazao termin kod doktora: ${doctor}`);
        res.status(200).json({ message: "Termin uspešno zakazan", appointment });
    } else {
        res.status(400).json({ message: "Termin nije mogao biti zakazan" });
    }
});

// Pregled termina pacijenta
router.get('/appointments/patient/:username', authenticate, authorize(['Pacijent']), (req, res) => {
    const { username } = req.params;
    const appointments = patientController.getAppointmentsByPatient(username);
    auditLogController.logActivity(req.user.username, `Pregled termina pacijenta: ${username}`);
    res.status(200).json({ message: "Pregled termina uspešan", appointments });
});

// Ruta za ocenjivanje lekara od strane pacijenta
router.post('/ratings/doctor', authenticate, authorize(['Pacijent']), (req, res) => {
    const { doctorUsername, rating } = req.body;
    const result = ratingController.rateDoctor(doctorUsername, rating);

    if (result.success) {
        auditLogController.logActivity(req.user.username, `Pacijent ocenio doktora: ${doctorUsername} sa ocenom: ${rating}`);
        res.status(200).json({ message: result.message });
    } else {
        res.status(400).json({ message: result.message });
    }
});

// Ruta za ocenjivanje terapije od strane pacijenta
router.post('/ratings/therapy', authenticate, authorize(['Pacijent']), (req, res) => {
    const { therapyId, rating } = req.body;
    const result = ratingController.rateTherapy(therapyId, rating);

    if (result.success) {
        auditLogController.logActivity(req.user.username, `Pacijent ocenio terapiju: ${therapyId} sa ocenom: ${rating}`);
        res.status(200).json({ message: result.message });
    } else {
        res.status(400).json({ message: result.message });
    }
});

// Ruta za filtriranje i sortiranje termina za pacijente
router.get('/appointments/patient/:username/filter', authenticate, authorize(['Pacijent']), (req, res) => {
    const { username } = req.params;
    const filters = {
        doctorUsername: req.query.doctorUsername,
        status: req.query.status,
        date: req.query.date
    };
    const sortBy = req.query.sortBy;
    const results = appointmentController.filterAndSortAppointments(filters, sortBy, 'Pacijent');

    auditLogController.logActivity(req.user.username, `Filtriranje i sortiranje termina za pacijenta: ${username}`);
    res.status(200).json({ message: "Filtriranje i sortiranje termina uspešno", results });
});

// Ruta za filtriranje i sortiranje termina za lekare
router.get('/appointments/doctor/:username/filter', authenticate, authorize(['Lekar']), (req, res) => {
    const { username } = req.params;
    const filters = {
        patientUsername: req.query.patientUsername,
        status: req.query.status,
        date: req.query.date
    };
    const sortBy = req.query.sortBy;
    const results = appointmentController.filterAndSortAppointments(filters, sortBy, 'Lekar');

    auditLogController.logActivity(req.user.username, `Filtriranje i sortiranje termina za doktora: ${username}`);
    res.status(200).json({ message: "Filtriranje i sortiranje termina uspešno", results });
});



// Terapije rute

// Kreiranje terapije od strane lekara
router.post('/therapies/create', authenticate, authorize(['Lekar']), (req, res) => {
    const { doctorUsername, patientUsername, description } = req.body;
    const therapy = therapyController.createTherapy(doctorUsername, patientUsername, description);

    if (therapy) {
        auditLogController.logActivity(req.user.username, `Kreirana terapija za pacijenta: ${patientUsername} od strane doktora: ${doctorUsername}`);
        res.status(200).json({ message: "Terapija uspešno kreirana", therapy });
    } else {
        res.status(400).json({ message: "Terapija nije mogla biti kreirana" });
    }
});

// Pregled terapija pacijenta
router.get('/therapies/patient/:username', authenticate, authorize(['Pacijent']), (req, res) => {
    const { username } = req.params;
    const therapies = therapyController.getTherapiesByPatient(username);
    auditLogController.logActivity(req.user.username, `Pregled terapija pacijenta: ${username}`);
    res.status(200).json({ message: "Pregled terapija uspešan", therapies });
});

// Pregled terapija lekara
router.get('/therapies/doctor/:username', authenticate, authorize(['Lekar']), (req, res) => {
    const { username } = req.params;
    const therapies = therapyController.getTherapiesByDoctor(username);
    auditLogController.logActivity(req.user.username, `Pregled terapija lekara: ${username}`);
    res.status(200).json({ message: "Pregled terapija uspešan", therapies });
});

module.exports = router;
