const { loadAppointments } = require('./userController');
const { loadTherapies } = require('./therapyController');
const { loadUsers } = require('./userController');

// Funkcija za generisanje izveštaja o terminima
const generateAppointmentsReport = () => {
    const appointments = loadAppointments();
    const totalAppointments = appointments.length;
    const scheduledAppointments = appointments.filter(app => app.status === "zakazano").length;
    const freeAppointments = appointments.filter(app => app.status === "slobodan").length;

    return {
        totalAppointments,
        scheduledAppointments,
        freeAppointments
    };
};

// Funkcija za generisanje izveštaja o terapijama
const generateTherapiesReport = () => {
    const therapies = loadTherapies();
    const totalTherapies = therapies.length;
    
    return {
        totalTherapies
    };
};

// Funkcija za generisanje izveštaja o korisnicima
const generateUsersReport = () => {
    const users = loadUsers();
    const totalUsers = users.length;
    const patients = users.filter(user => user.role === "Pacijent").length;
    const doctors = users.filter(user => user.role === "Lekar").length;
    const admins = users.filter(user => user.role === "Administrator").length;

    return {
        totalUsers,
        patients,
        doctors,
        admins
    };
};

module.exports = {
    generateAppointmentsReport,
    generateTherapiesReport,
    generateUsersReport
};
