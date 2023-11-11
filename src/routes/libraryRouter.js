const express = require("express");
const router = new express.Router();
require("dotenv").config();

require("../db/conn");
const Question = require("../models/questions");

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.get("/addq", (req, res) => {
    if (req.cookies.jwt) {
        res.render("addq", {isAuthenticated: req.cookies.jwt});
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

router.get("/questions", async (req, res) => {
    if (req.cookies.jwt) {
        if (!req.query.topic) return res.render("library", {isAuthenticated: req.cookies.jwt});
        const questions = await Question.find({topic: req.query.topic});
        res.render("questions", {isAuthenticated: req.cookies.jwt, questions: questions});
    } else {
        res.render("login", {isAuthenticated: req.cookies.jwt});
    }
});

router.post("/addq", async (req, res) => {
    // console.log(req.body);
    try {
        const topic = req.body.topic;
        const question = req.body.question;
        const answer = req.body.answer;
        const questionData = new Question({
            topic: topic,
            question: question,
            answer: answer,
        });
        await questionData.save();
        res.status(201).render("addq", {isAuthenticated: req.cookies.jwt, message: "Question added successfully.", messageStatus: "Success!"});
    } catch (error) {
        // console.log(error);
        res.status(401).send(error);
    }
});

module.exports = router;