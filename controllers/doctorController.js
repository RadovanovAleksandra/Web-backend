const fs = require('fs');
const path = require('path');
const { loadAppointments, saveAppointments, getUserByUsername } = require('./userController');

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
        const deletedAppointment = appointments.splice(appointmentIndex, 1); // Obriši termin
        saveAppointments(appointments);
        console.log("Termin uspešno obrisan:", deletedAppointment);
        return true;
    } else {
        console.error("Termin nije pronađen ili ne pripada lekaru.");
        return false;
    }
};

// Funkcija za dobijanje termina lekara
const getAppointmentsByDoctor = (doctorUsername) => {
    const appointments = loadAppointments();
    return appointments.filter(appointment => appointment.doctorUsername === doctorUsername);
};

// Export funkcija
module.exports = {
    createAppointment,
    deleteAppointment,
    getAppointmentsByDoctor
};
