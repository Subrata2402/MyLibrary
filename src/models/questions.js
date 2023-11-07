const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true,
        unique: true
    },
});

const Question = new mongoose.model('Question', questionSchema);
module.exports = Question;