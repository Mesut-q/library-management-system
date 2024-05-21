const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const session = require('express-session');

const app = express();

const route = require("./index");
app.use(express.static(path.join(__dirname, "css")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use((req, res, next) => {
    const publicUrls = ['/login', '/register', '/']; // Public URLs
    if (publicUrls.includes(req.path) || req.session.userId) {
        // The URL is public or the user is logged in or sending a login request
        next(); // Continue the request
    } else {
        res.redirect('/login'); // Redirect to the login page if the user is not logged in
    }
});

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "deneme",
    database: "bmps"
});




db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
        return;
    }
    console.log("Connected to the MySQL database.");
});

// Make MySQL connection globally available
app.set("db", db);




app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", route);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));



app.listen(8000, function() {
    console.log("Server is listening on port 8000...");
});
