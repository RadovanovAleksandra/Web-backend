const { loadAppointments, saveAppointments } = require('./userController');

// Funkcija za zakazivanje termina
const scheduleAppointment = (patientUsername, doctor, date, time) => {
    const appointments = loadAppointments();
    
    const appointmentIndex = appointments.findIndex(app => 
        app.doctorUsername === doctor && 
        app.date === date && 
        app.time === time && 
        app.status === "slobodan"
    );

    if (appointmentIndex > -1) {
        appointments[appointmentIndex].patientUsername = patientUsername;
        appointments[appointmentIndex].status = "zakazano";

        saveAppointments(appointments);

        console.log("Termin uspešno zakazan:", appointments[appointmentIndex]);
        return appointments[appointmentIndex];
    } else {
        console.error("Termin nije pronađen ili nije slobodan.");
        return null;
    }
};

// Funkcija za dobijanje termina pacijenta
const getAppointmentsByPatient = (patientUsername) => {
    const appointments = loadAppointments();
    return appointments.filter(appointment => appointment.patientUsername === patientUsername);
};

// Export funkcija
module.exports = {
    scheduleAppointment,
    getAppointmentsByPatient
};
