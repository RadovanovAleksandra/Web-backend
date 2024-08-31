const { loadAppointments } = require('./userController');

// Funkcija za filtriranje i sortiranje termina
const filterAndSortAppointments = (filters, sortBy, role) => {
    let appointments = loadAppointments();

    // Primeni filtere
    if (filters.doctorUsername) {
        appointments = appointments.filter(app => app.doctorUsername === filters.doctorUsername);
    }
    if (filters.patientUsername) {
        appointments = appointments.filter(app => app.patientUsername === filters.patientUsername);
    }
    if (filters.status) {
        appointments = appointments.filter(app => app.status === filters.status);
    }
    if (filters.date) {
        appointments = appointments.filter(app => new Date(app.date).toISOString().slice(0, 10) === filters.date);
    }

    // Sortiranje
    if (sortBy) {
        const [key, order] = sortBy.split('_');
        appointments.sort((a, b) => {
            if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return appointments;
};

module.exports = {
    filterAndSortAppointments
};
