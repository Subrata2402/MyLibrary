const express = require("express");
const router = new express.Router();
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("../middleware/auth");
const func = require("../functions/new");
require("dotenv").config();

require("../db/conn");
const Register = require("../models/registers");

router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(cookieParser());

router.get("/", async (req, res) => {
    if (req.cookies.jwt) {
        const superUser = await func.superUser(req.cookies.jwt);
        res.render("index", {isAuthenticated: req.cookies.jwt, active: func.getActive(req.path), superUser: superUser});
    } else {
        res.render("login", {isAuthenticated: req.cookies.jwt, active: func.getActive(req.path)});
    }
});

router.get("/contact", async (req, res) => {
    const superUser = await func.superUser(req.cookies.jwt);
    res.render("contact", {isAuthenticated: req.cookies.jwt, active: func.getActive(req.path), superUser: superUser});
});

router.get("/resume", async (req, res) => {
    const superUser = await func.superUser(req.cookies.jwt);
    res.render("resume", {isAuthenticated: req.cookies.jwt, active: func.getActive(req.path), superUser: superUser});
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

router.get("/signup", async (req, res) => {
    if (req.cookies.jwt) {
        const superUser = await func.superUser(req.cookies.jwt);
        res.render("index", {isAuthenticated: req.cookies.jwt, active: func.getActive("/"), superUser: superUser});
    }
    res.render("signup", {isAuthenticated: req.cookies.jwt});
});

router.get("/about", async (req, res) => {
    const superUser = await func.superUser(req.cookies.jwt);
    res.render("about", {isAuthenticated: req.cookies.jwt, active: func.getActive(req.path), superUser: superUser});
});

router.get("/certificates", async (req, res) => {
    const superUser = await func.superUser(req.cookies.jwt);
    res.render("certificates", {isAuthenticated: req.cookies.jwt, active: func.getActive(req.path), superUser: superUser});
});

router.get("/login", async (req, res) => {
    if (req.cookies.jwt) {
        const superUser = await func.superUser(req.cookies.jwt);
        res.render("index", {isAuthenticated: req.cookies.jwt, active: func.getActive("/"), superUser: superUser});
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
            // Generate auth token and redirect
            const token = await registerUser.generateAuthToken();
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 86400000),
                httpOnly: true,
            });
            // Save data to the database
            await registerUser.save();
            res.status(201).render("index", {isAuthenticated: req.cookies.jwt, active: func.getActive("/"), message: "Registered successfully!", messageStatus: "Success!"});
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
        const userEmail = await Register.findOne({ email: email });
        const isMatch = await bcrypt.compare(password, userEmail.password);
        if (isMatch) {
            const token = await userEmail.generateAuthToken();
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 86400000),
                httpOnly: true,
            });
            const superUser = await func.superUser(token);
            res.status(201).render("index", {isAuthenticated: true, active: func.getActive("/"), message: "Logged in successfully!", messageStatus: "Success!", superUser: superUser});
        } else {
            res.status(201).render("login", {isAuthenticated: req.cookies.jwt, message: "Invalid Login Details", messageStatus: "Error!"});
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post("/contact", async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const mobile = req.body.mobile;
        const message = req.body.message;
        const superUser = await func.superUser(req.cookies.jwt);
        res.status(201).render("contact", {isAuthenticated: req.cookies.jwt, message: "Your message has been sent successfully!", messageStatus: "Success!", active: func.getActive(req.path), superUser: superUser});
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;