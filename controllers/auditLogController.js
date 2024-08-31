const fs = require('fs');
const path = require('path');

// Putanja do fajla sa logovima
const logFilePath = path.join(__dirname, '../data/audit_logs.json');

// Funkcija za logovanje aktivnosti
const logActivity = (username, activity) => {
    const logs = loadLogs();
    const newLog = {
        timestamp: new Date().toISOString(),
        username,
        activity
    };

    logs.push(newLog);
    saveLogs(logs);
    console.log(`Aktivnost zabeležena: ${username} - ${activity}`);
};

// Učitaj logove iz JSON fajla
const loadLogs = () => {
    try {
        const data = fs.readFileSync(logFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Greška pri učitavanju logova:", err);
        return [];
    }
};

// Snimi logove u JSON fajl
const saveLogs = (logs) => {
    try {
        fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2), 'utf-8');
        console.log("Logovi su uspešno snimljeni.");
    } catch (err) {
        console.error("Greška pri snimanju logova:", err);
    }
};

module.exports = {
    logActivity
};
