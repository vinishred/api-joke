// imports du module express
const express = require("express");
const bodyParser = require("body-parser");
const apiRouter = require("./apiRouter").router;

// initialisation du serveur express
const server = express();

// Configuration du module body-parser
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// Configuration des routes avec les deux paramètres: req pour request et res pour response
server.get("/", function (req, res) {
  // On met en place l'en-tête de ma réponse HTTP en précisant la langue et le type de contenu
  res.setHeader("Content-Type", "text/html");
  res.status(200).send("<h1>Bonjour et bienvenue sur mon super serveur !</h1>");
});

// Configuration des routes
server.use("/api", apiRouter);

// Lancement du serveur sur le port 8080
server.listen(8080, function () {
  console.log("Serveur démarré sur le port 8080");
});
