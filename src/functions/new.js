const Register = require("../models/registers");
const jwt = require("jsonwebtoken");

const getActive = (path) => {
    const navbar = {
        index: "",
        library: "",
        contact: "",
        resume: "",
        about: "",
    };
    switch (path) {
        case "/":
            navbar.index = "active";
            return navbar;
        case "/library":
            navbar.library = "active";
            return navbar;
        case "/contact":
            navbar.contact = "active";
            return navbar;
        case "/resume":
            navbar.resume = "active";
            return navbar;
        case "/about":
            navbar.about = "active";
            return navbar;
    }
}

const superUser = async (jwtToken) => {
    const userId = jwt.verify(jwtToken, process.env.SECRET_KEY)._id;
    const superUser = await Register.findById(userId);
    return superUser.superuser;
}

module.exports = {
    getActive: getActive,
    superUser: superUser
};