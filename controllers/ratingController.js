const { loadUsers, saveUsers } = require('./userController');
const { loadTherapies, saveTherapies } = require('./therapyController');

// Funkcija za ocenjivanje lekara
const rateDoctor = (doctorUsername, rating) => {
    const users = loadUsers();
    const doctor = users.find(user => user.username === doctorUsername && user.role === "Lekar");

    if (doctor) {
        doctor.rating = doctor.rating || { count: 0, total: 0 };
        doctor.rating.count += 1;
        doctor.rating.total += rating;
        saveUsers(users);
        return { success: true, message: "Ocena uspešno zabeležena." };
    } else {
        return { success: false, message: "Lekar nije pronađen." };
    }
};

// Funkcija za ocenjivanje terapije
const rateTherapy = (therapyId, rating) => {
    const therapies = loadTherapies();
    const therapy = therapies.find(therapy => therapy.id === therapyId);

    if (therapy) {
        therapy.rating = therapy.rating || { count: 0, total: 0 };
        therapy.rating.count += 1;
        therapy.rating.total += rating;
        saveTherapies(therapies);
        return { success: true, message: "Ocena uspešno zabeležena." };
    } else {
        return { success: false, message: "Terapija nije pronađena." };
    }
};

module.exports = {
    rateDoctor,
    rateTherapy
};
