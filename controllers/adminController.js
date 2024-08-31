const fs = require('fs');
const path = require('path');
const { loadUsers, saveUsers, getUserByUsername } = require('./userController');

// Funkcija za kreiranje pacijenta
const createPatient = (patientData) => {
    const users = loadUsers();
    
    // Proveri da li korisničko ime ili JMBG već postoje
    const existingUser = users.find(user => user.username === patientData.username || user.jmbg === patientData.jmbg);
    if (existingUser) {
        console.error("Korisničko ime ili JMBG već postoje.");
        return null;
    }

    const newPatient = {
        username: patientData.username,
        password: patientData.password, // U realnom sistemu ovo bi trebalo biti heširano
        role: "Pacijent",
        name: patientData.name,
        jmbg: patientData.jmbg,
        email: patientData.email,
        appointments: []
    };

    users.push(newPatient);
    saveUsers(users);

    console.log("Novi pacijent kreiran:", newPatient);
    return newPatient;
};

// Funkcija za ažuriranje pacijenta
const updatePatient = (username, patientData) => {
    let users = loadUsers();
    const userIndex = users.findIndex(user => user.username === username && user.role === "Pacijent");

    if (userIndex > -1) {
        // Ažuriraj podatke pacijenta, osim korisničkog imena i JMBG-a
        users[userIndex] = {
            ...users[userIndex],
            password: patientData.password || users[userIndex].password,
            name: patientData.name || users[userIndex].name,
            email: patientData.email || users[userIndex].email
        };
        
        saveUsers(users);
        console.log("Pacijent uspešno ažuriran:", users[userIndex]);
        return users[userIndex];
    } else {
        console.error("Pacijent nije pronađen.");
        return null;
    }
};

// Funkcija za brisanje pacijenta
const deletePatient = (username) => {
    let users = loadUsers();
    const userIndex = users.findIndex(user => user.username === username && user.role === "Pacijent");

    if (userIndex > -1) {
        const deletedUser = users.splice(userIndex, 1); // Obriši pacijenta
        saveUsers(users);
        console.log("Pacijent uspešno obrisan:", deletedUser);
        return true;
    } else {
        console.error("Pacijent nije pronađen.");
        return false;
    }
};

// Funkcija za pregled svih pacijenata
const getAllPatients = () => {
    const users = loadUsers();
    return users.filter(user => user.role === "Pacijent");
};

// Funkcija za promenu lozinke korisnika
const changePassword = (username, newPassword) => {
    const users = loadUsers();
    const user = users.find(user => user.username === username);

    if (user) {
        user.password = newPassword; // U realnom sistemu lozinka bi bila heširana
        saveUsers(users);
        return { success: true, message: "Lozinka uspešno promenjena." };
    } else {
        return { success: false, message: "Korisnik nije pronađen." };
    }
};

// Funkcija za resetovanje naloga
const resetAccount = (username) => {
    const users = loadUsers();
    const userIndex = users.findIndex(user => user.username === username);

    if (userIndex > -1) {
        users[userIndex].password = "defaultpassword"; // Reset lozinke na podrazumevanu
        saveUsers(users);
        return { success: true, message: "Nalog uspešno resetovan." };
    } else {
        return { success: false, message: "Korisnik nije pronađen." };
    }
};

// Funkcija za filtriranje i sortiranje pacijenata
const filterAndSortPatients = (filters, sortBy) => {
    let users = loadUsers();

    // Filtriraj samo pacijente
    let patients = users.filter(user => user.role === 'Pacijent');

    // Primeni filtere
    if (filters.jmbg) {
        patients = patients.filter(patient => patient.jmbg.includes(filters.jmbg));
    }
    if (filters.name) {
        patients = patients.filter(patient => patient.name.toLowerCase().includes(filters.name.toLowerCase()));
    }
    if (filters.surname) {
        patients = patients.filter(patient => patient.surname.toLowerCase().includes(filters.surname.toLowerCase()));
    }
    if (filters.dateOfBirth) {
        patients = patients.filter(patient => new Date(patient.dateOfBirth).toISOString().slice(0, 10) === filters.dateOfBirth);
    }
    if (filters.email) {
        patients = patients.filter(patient => patient.email.toLowerCase().includes(filters.email.toLowerCase()));
    }

    // Sortiranje
    if (sortBy) {
        const [key, order] = sortBy.split('_');
        patients.sort((a, b) => {
            if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return patients;
};

module.exports = {
    createPatient,
    updatePatient,
    deletePatient,
    getAllPatients,
    changePassword,
    resetAccount,
    filterAndSortPatients
};