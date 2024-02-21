const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const apiRouter = require("./apiRouter").router;

const app = express();

// Middleware pour autoriser les requêtes CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Configuration du module body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Servir les fichiers statiques de l'interface utilisateur depuis le dossier 'UI'
app.use(express.static(path.join(__dirname, "../UI")));

// Configuration des routes avec les deux paramètres: req pour request et res pour response
app.get("/", function (req, res) {
  // On met en place l'en-tête de ma réponse HTTP en précisant la langue et le type de contenu
  res.setHeader("Content-Type", "text/html");
  res.status(200).send("<h1>Bonjour et bienvenue sur mon super serveur !</h1>");
});

// Configuration des routes
app.use("/api", apiRouter);

// Lancement du serveur sur le port 8080
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
