const fs = require('fs');
const path = require('path');
const { loadUsers, getUserByUsername } = require('./userController');

// Fajl za terapije
const therapiesFilePath = path.join(__dirname, '../data/therapies.json');

// Učitaj terapije iz JSON fajla
const loadTherapies = () => {
    try {
        const data = fs.readFileSync(therapiesFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Greška pri učitavanju terapija:", err);
        return [];
    }
};

// Snimi terapije u JSON fajl
const saveTherapies = (therapies) => {
    try {
        fs.writeFileSync(therapiesFilePath, JSON.stringify(therapies, null, 2), 'utf-8');
        console.log("Terapije su uspešno snimljene.");
    } catch (err) {
        console.error("Greška pri snimanju terapija:", err);
    }
};

// Funkcija za kreiranje terapije
const createTherapy = (doctorUsername, patientUsername, description) => {
    const therapies = loadTherapies();

    const newTherapy = {
        id: therapies.length + 1, // Generiše novi ID
        doctorUsername,
        patientUsername,
        description,
        date: new Date().toISOString()
    };

    therapies.push(newTherapy);
    saveTherapies(therapies);

    console.log("Nova terapija kreirana:", newTherapy);
    return newTherapy;
};

// Funkcija za pregled terapija pacijenta
const getTherapiesByPatient = (patientUsername) => {
    const therapies = loadTherapies();
    return therapies.filter(therapy => therapy.patientUsername === patientUsername);
};

// Funkcija za pregled terapija lekara
const getTherapiesByDoctor = (doctorUsername) => {
    const therapies = loadTherapies();
    return therapies.filter(therapy => therapy.doctorUsername === doctorUsername);
};

// Export funkcija
module.exports = {
    createTherapy,
    getTherapiesByPatient,
    getTherapiesByDoctor
};
