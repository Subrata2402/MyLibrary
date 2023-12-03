const express = require('express');
const path = require('path');
const hbs = require('hbs');
require('dotenv').config();

require('./db/conn');
const router = require('./routes/router');
const libraryRouter = require('./routes/libraryRouter');

const app = express();
app.use(router);
app.use(libraryRouter);
const port = process.env.PORT;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.static(static_path));
app.set('view engine', 'hbs');
app.set('views', template_path);
hbs.registerPartials(partials_path);
hbs.registerHelper("math", function(lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);

    return {
        "+": lvalue + rvalue
    }[operator];
});

// router.get('*', (req, res) => {
//     res.render("404", {isAuthenticated: req.cookies.jwt});
// });

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});