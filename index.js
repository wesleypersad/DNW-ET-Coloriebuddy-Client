// get dotenv variables
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mysql = require("mysql2");

// use port 5000 or port assigned by local environment for the server
const port = process.env.PORT || 5000;
const host = process.env.DB_HOST;
const portdb = process.env.DB_PORT;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;

const path = require("path");

app.use(express.static(path.join(__dirname, '/public')));

app.use(bodyParser.urlencoded({
    extended: true
}));

// connect to database
const db = mysql.createConnection({
    host: host,
    user: user,
    port: portdb,
    password: password,
    database: database
});

// connect to database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log("Connected to database");
});

global.db = db;

require("./routes/main")(app);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.listen(port, () => console.log(`App for mid-term listening on port ${port}!`));
