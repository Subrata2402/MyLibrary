const express = require("express");
const router = new express.Router();
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("../middleware/auth");
require("dotenv").config();

require("../db/conn");
const Register = require("../models/registers");

router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(cookieParser());

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

router.get("/", (req, res) => {
    if (req.cookies.jwt) {
        res.render("index", {isAuthenticated: req.cookies.jwt, active: getActive(req.path)});
    } else {
        res.render("login", {isAuthenticated: req.cookies.jwt, active: getActive(req.path)});
    }
});

router.get("/library", (req, res) => {
    if (req.cookies.jwt) {
        res.render("library", {isAuthenticated: req.cookies.jwt, active: getActive(req.path)});
    } else {
        res.render("login", {isAuthenticated: req.cookies.jwt});
    }
});

router.get("/contact", (req, res) => {
    res.render("contact", {isAuthenticated: req.cookies.jwt, active: getActive(req.path)});
});

router.get("/resume", (req, res) => {
    res.render("resume", {isAuthenticated: req.cookies.jwt, active: getActive(req.path)});
});

router.get("/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((currentElement) => {
            return currentElement.token !== req.token;
        });
        res.clearCookie("jwt");
        await req.user.save();
        res.render("login", {message: "Logged out successfully!", messageStatus: "Success!"});
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get("/signup", (req, res) => {
    if (req.cookies.jwt) {
        res.render("index", {isAuthenticated: req.cookies.jwt, active: getActive("/")});
    }
    res.render("signup", {isAuthenticated: req.cookies.jwt});
});

router.get("/about", (req, res) => {
    res.render("about", {isAuthenticated: req.cookies.jwt, active: getActive(req.path)});
});

router.get("/certificates", (req, res) => {
    res.render("certificates", {isAuthenticated: req.cookies.jwt, active: getActive(req.path)});
});

router.get("/login", (req, res) => {
    if (req.cookies.jwt) {
        res.render("index", {isAuthenticated: req.cookies.jwt, active: getActive("/")});
    }
    res.render("login", {isAuthenticated: req.cookies.jwt});
});

router.post("/signup", async (req, res) => {
    try {
        const name = req.body.username;
        const email = req.body.emailid;
        const password = req.body.password;
        const cpassword = req.body.cpassword;
        if (password === cpassword) {
            const registerUser = new Register({
                name: name,
                email: email,
                password: password,
            });
            const token = await registerUser.generateAuthToken();
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 86400000),
                httpOnly: true,
            });
            await registerUser.save();
            res.status(201).render("index", {isAuthenticated: req.cookies.jwt, active: getActive("/"), message: "Registered successfully!", messageStatus: "Success!"});
        } else {
            res.status(400).render("signup", {isAuthenticated: req.cookies.jwt, message: "Passwords do not match!", messageStatus: "Error!"});
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post("/login", async (req, res) => {
    try {
        const email = req.body.emailid;
        const password = req.body.password;
        const userEmail = await Register.findOne({ emailid: email });
        const isMatch = await bcrypt.compare(password, userEmail.password);
        const token = await userEmail.generateAuthToken();
        if (isMatch) {
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 86400000),
                httpOnly: true,
            });
            res.status(201).render("index", {isAuthenticated: true, active: getActive("/"), message: "Logged in successfully!", messageStatus: "Success!"});
        } else {
            res.status(201).render("login", {isAuthenticated: req.cookies.jwt, message: "Invalid Login Details", messageStatus: "Error!"});
        }
    } catch (error) {
        res.status(400).send("Invalid Login Details\n\n" + error);
    }
});

router.post("/contact", async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const mobile = req.body.mobile;
        const message = req.body.message;
        // console.log(name, mobile, email, message);
        res.status(201).render("contact", {isAuthenticated: req.cookies.jwt, message: "Your message has been sent successfully!", messageStatus: "Success!", active: getActive(req.path)});
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;