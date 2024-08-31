const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');

const jwt = require('jsonwebtoken');

const loginUser = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Generišite JWT token
        const token = jwt.sign(
            { username: user.username, role: user.role }, // Podaci koji idu u token
            'your_secret_key', // Tajni ključ za potpisivanje tokena
            { expiresIn: '1h' } // Vreme isteka tokena
        );

        return { ...user, token }; // Vratite korisnika zajedno sa tokenom
    } else {
        return null;
    }
};

// Učitaj korisnike iz JSON fajla
const loadUsers = () => {
    try {
        const data = fs.readFileSync(usersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Greška pri učitavanju korisnika:", err);
        return [];
    }
};

// Snimi korisnike u JSON fajl
const saveUsers = (users) => {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
        console.log("Korisnici su uspešno snimljeni.");
    } catch (err) {
        console.error("Greška pri snimanju korisnika:", err);
    }
};


// Funkcija za zakazivanje termina
const scheduleAppointment = (user, doctor, date, time) => {
    // Proverite da li lekar postoji u sistemu
    const users = loadUsers();
    const doctorUser = users.find(u => u.username === doctor && u.role === "Lekar");

    if (doctorUser) {
        const appointment = {
            doctor: doctorUser.username,
            date,
            time,
            status: "zakazano"
        };

        user.appointments.push(appointment);
        saveUsers(users); // Sačuvaj izmenjene podatke

        console.log("Termin uspešno zakazan:", appointment);
        return appointment;
    } else {
        console.error("Lekar nije pronađen.");
        return null;
    }
};

const appointmentsFilePath = path.join(__dirname, '../data/appointments.json');

// Učitaj termine iz JSON fajla
const loadAppointments = () => {
    try {
        const data = fs.readFileSync(appointmentsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Greška pri učitavanju termina:", err);
        return [];
    }
};

// Snimi termine u JSON fajl
const saveAppointments = (appointments) => {
    try {
        fs.writeFileSync(appointmentsFilePath, JSON.stringify(appointments, null, 2), 'utf-8');
        console.log("Termini su uspešno snimljeni.");
    } catch (err) {
        console.error("Greška pri snimanju termina:", err);
    }
};

// Funkcija za pronalaženje korisnika po korisničkom imenu
const getUserByUsername = (username) => {
    const users = loadUsers();
    return users.find(user => user.username === username);
};

// Funkcija za dobijanje termina pacijenta
const getAppointmentsByPatient = (patientUsername) => {
    const appointments = loadAppointments();
    return appointments.filter(appointment => appointment.patientUsername === patientUsername);
};

// Funkcija za dobijanje termina lekara
const getAppointmentsByDoctor = (doctorUsername) => {
    const appointments = loadAppointments();
    return appointments.filter(appointment => appointment.doctorUsername === doctorUsername);
};

// Funkcija za kreiranje termina
const createAppointment = (doctorUsername, date, time) => {
    const appointments = loadAppointments();
    
    const newAppointment = {
        id: appointments.length + 1, // Generiše novi ID
        patientUsername: null, // Pacijent nije dodeljen prilikom kreiranja
        doctorUsername,
        date,
        time,
        status: "slobodan"
    };

    appointments.push(newAppointment);
    saveAppointments(appointments);

    console.log("Novi termin kreiran:", newAppointment);
    return newAppointment;
};

// Funkcija za brisanje termina
const deleteAppointment = (id, doctorUsername) => {
    let appointments = loadAppointments();
    
    const appointmentIndex = appointments.findIndex(app => app.id === parseInt(id) && app.doctorUsername === doctorUsername);

    if (appointmentIndex > -1) {
        appointments.splice(appointmentIndex, 1); // Obriši termin
        saveAppointments(appointments);
        console.log("Termin uspešno obrisan:", id);
        return true;
    } else {
        console.error("Termin nije pronađen ili ne pripada lekaru.");
        return false;
    }
};

// Dodajte funkciju u export
module.exports = {
    loadUsers,
    saveUsers,
    loginUser,
    scheduleAppointment,
    loadAppointments,
    saveAppointments,
    getUserByUsername,
    getAppointmentsByPatient,
    getAppointmentsByDoctor,
    createAppointment,
    deleteAppointment
};