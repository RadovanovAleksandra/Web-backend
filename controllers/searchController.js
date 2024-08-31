const { loadUsers } = require('./userController');
const { loadAppointments } = require('./userController');
const { loadTherapies } = require('./therapyController');

// Pretraga korisnika po imenu ili korisničkom imenu
const searchUsers = (query) => {
    const users = loadUsers();
    return users.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) || 
        user.name.toLowerCase().includes(query.toLowerCase())
    );
};

// Pretraga termina po imenu doktora ili pacijenta
const searchAppointments = (query) => {
    const appointments = loadAppointments();
    return appointments.filter(appointment => 
        appointment.doctorUsername.toLowerCase().includes(query.toLowerCase()) || 
        (appointment.patientUsername && appointment.patientUsername.toLowerCase().includes(query.toLowerCase()))
    );
};

// Pretraga terapija po opisu
const searchTherapies = (query) => {
    const therapies = loadTherapies();
    return therapies.filter(therapy => 
        therapy.description.toLowerCase().includes(query.toLowerCase())
    );
};

module.exports = {
    searchUsers,
    searchAppointments,
    searchTherapies
};
