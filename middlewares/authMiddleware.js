const userController = require('../controllers/userController');

// Middleware za proveru da li je korisnik prijavljen
const authenticate = (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(401).json({ message: "Autentifikacija zahteva korisničko ime i šifru." });
    }

    const user = userController.loginUser(username, password);

    if (!user) {
        return res.status(401).json({ message: "Neispravno korisničko ime ili šifra." });
    }

    console.log(`Korisnik ${username} prijavljen u sistem.`);
    req.user = user; // Dodaj korisnika u zahtev za kasniju upotrebu
    next();
};

// Middleware za proveru korisničke uloge
const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Pristup zabranjen. Nemate odgovarajuće privilegije." });
        }
        next();
    };
};

module.exports = {
    authenticate,
    authorize
};
