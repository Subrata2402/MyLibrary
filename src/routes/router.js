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

router.get("/", (req, res) => {
    if (req.cookies.jwt) {
        res.render("index", {isAuthenticated: req.cookies.jwt});
    } else {
        res.render("login", {isAuthenticated: req.cookies.jwt});
    }
});

router.get("/library", (req, res) => {
    if (req.cookies.jwt) {
        res.render("library", {isAuthenticated: req.cookies.jwt});
    } else {
        res.render("login", {isAuthenticated: req.cookies.jwt});
    }
});

router.get("/contact", (req, res) => {
    res.render("contact", {isAuthenticated: req.cookies.jwt});
});

router.get("/resume", (req, res) => {
    res.render("resume", {isAuthenticated: req.cookies.jwt});
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
        res.render("index", {isAuthenticated: req.cookies.jwt});
    }
    res.render("signup", {isAuthenticated: req.cookies.jwt});
});

router.get("/login", (req, res) => {
    if (req.cookies.jwt) {
        res.render("index", {isAuthenticated: req.cookies.jwt});
    }
    res.render("login", {isAuthenticated: req.cookies.jwt});
});

router.post("/signup", async (req, res) => {
    try {
        const name = req.body.username;
        const email = req.body.emailid;
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if (password === cpassword) {
            const registerUser = new Register({
                username: name,
                emailid: email,
                password: password,
                confirmpassword: cpassword,
            });
            const token = await registerUser.generateAuthToken();
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 30000),
                httpOnly: true,
            });
            const registered = await registerUser.save();
            res.status(201).render("index", {isAuthenticated: req.cookies.jwt});
        } else {
            res.send("Passwords are not matching");
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
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 86400000),
            httpOnly: true,
        });
        if (isMatch) {
            res.status(201).render("index", {isAuthenticated: true});
        } else {
            res.send("Invalid Login Details");
        }
    } catch (error) {
        res.status(400).send("Invalid Login Details");
    }
});

router.post("/contact", async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const mobile = req.body.mobile;
        const message = req.body.message;
        // console.log(name, mobile, email, message);
        res.status(201).render("contact", {isAuthenticated: req.cookies.jwt, message: "Your message has been sent successfully!", messageStatus: "Success!"});
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;