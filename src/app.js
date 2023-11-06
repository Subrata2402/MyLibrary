const express = require('express');
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcryptjs');
require('dotenv').config();

require('./db/conn');
const Register = require('./models/registers');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const port = process.env.PORT;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.static(static_path));
app.set('view engine', 'hbs');
app.set('views', template_path);
hbs.registerPartials(partials_path);

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/signup', async (req, res) => {
    try {
        const name = req.body.username;
        const email = req.body.emailid;
        const password = req.body.password;
        const cpassword = req.body.cpassword;
        if (password === cpassword) {
            const registerDetails = new Register({
                name: name,
                email: email,
                password: password
            });

            const token = await registerDetails.generateAuthToken();
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 30000),
                httpOnly: true
            });
            await registerDetails.save();
            res.status(201).render('index');
        } else {
            res.send("Password not matching");
        }
    } catch (error) {
        res.status(400).send(error);
    }
})

app.post('/login', async (req, res) => {
    try {
        const userid = req.body.userid;
        const password = req.body.password;
        const userData = await Register.findOne({ email: userid });
        const isMatch = await bcrypt.compare(password, userData.password);
        if (isMatch) {
            const token = await userData.generateAuthToken();
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 30000),
                httpOnly: true
            });
            res.status(201).render('index');
        } else {
            res.send("Invalid Login Details");
        }
    } catch (error) {
        
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});