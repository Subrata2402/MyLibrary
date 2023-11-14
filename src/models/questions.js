const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    author_id: {
        type: String,
        required: true
    },
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
        required: true
    },
    time: {
        type: String,
        default: new Date(Date.now()).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })
    }
});

const Question = new mongoose.model('Question', questionSchema);
module.exports = Question;