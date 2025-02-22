const express = require("express");
const server = express();

//banco de dados
const db = require("./database/db.js");

server.use(express.static("front"));

// habilitar o uso do req.body
server.use(express.urlencoded({ extended: true }));

// template engine
const nunjucks = require("nunjucks");
nunjucks.configure("src/html", {
    express: server,
    noCache: true
});

server.get("/", (req, res) => {
    return res.render("index.html");
});

server.get("/create-point", (req, res) => {
    return res.render("create-point.html");
});

server.post("/savepoint", (req, res) => {

    const query = `
        INSERT INTO places (
            image, 
            name, 
            address, 
            address2, 
            state, 
            city, 
            items
        ) VALUES (?,?,?,?,?,?,?);
    `;

    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ];

    function afterInsertData(err) {
        if (err) {
            console.log(err);
            return res.send("Erro de cadastro");
        }

        console.log("Cadastrado com sucesso!");
        console.log(this);
        return res.render("create-point.html", {saved: true});
    }

    db.run(query, values, afterInsertData);

});

server.get("/search-results", (req, res) => {
    //pegar os dados do banco
    const search = req.query.search;
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function (err, rows) {
        if (err) {
            return console.log(err);
        }

        const total = rows.length;

        return res.render("search-results.html", { places: rows, total: total });
    })
});

//ligar o servidor
server.listen(3000);