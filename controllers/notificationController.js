const { getUserByUsername } = require('./userController');

// Funkcija za slanje notifikacija pacijentu
const notifyPatient = (username, message) => {
    const user = getUserByUsername(username);
    if (user && user.role === "Pacijent") {
        console.log(`Notifikacija poslana pacijentu ${username}: ${message}`);
        return { success: true, message: `Notifikacija poslana pacijentu ${username}` };
    } else {
        return { success: false, message: "Korisnik nije pronađen ili nije pacijent." };
    }
};

// Funkcija za slanje notifikacija lekaru
const notifyDoctor = (username, message) => {
    const user = getUserByUsername(username);
    if (user && user.role === "Lekar") {
        console.log(`Notifikacija poslana lekaru ${username}: ${message}`);
        return { success: true, message: `Notifikacija poslana lekaru ${username}` };
    } else {
        return { success: false, message: "Korisnik nije pronađen ili nije lekar." };
    }
};

module.exports = {
    notifyPatient,
    notifyDoctor
};
