// imports
const bcrypt = require("bcrypt");
const jwtUtils = require("../utils/jwt.utils");
const models = require("../models");
const asyncLib = require("async");

// constantes
const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX =
  /^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/\-])(?=.*\d)(?=.*[A-Z]).{8,50}$/;

// routes
module.exports = {
  register: function (req, res) {
    // Params
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const bio = req.body.bio;

    if (email === null || username === null || password === null) {
      return res.status(400).json({
        message: "Veuillez remplir tous les champs",
      });
    }

    // Verify pseudo length
    if (username.length <= 4 || username.length > 20) {
      return res.status(400).json({
        message: "Le pseudo doit contenir entre 5 et 20 caractères",
      });
    }

    // Verifiy mail regex
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        message: "Le format du mail n'est pas valide",
      });
    }

    // Verify password
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message:
          "Le password doit contenir entre 8 et 20 caractères, une majuscule, un chiffre et un caractère spécial.",
      });
    }

    // fonctions en cascade pour enregistrer un nouvel utilisateur
    asyncLib.waterfall(
      [
        function (done) {
          models.User.findOne({
            attributes: ["email"],
            where: {
              email: email,
            },
          })
            .then(function (userFound) {
              done(null, userFound);
            })
            .catch(function (err) {
              return res.status(500).json({
                error: "unable to verify user",
              });
            });
        },

        function (userFound, done) {
          if (!userFound) {
            bcrypt.hash(password, 5, function (err, bcryptedPassword) {
              done(null, userFound, bcryptedPassword);
            });
          } else {
            return res.status(409).json({
              error: "user already exist",
            });
          }
        },
        function (userFound, bcryptedPassword, done) {
          const newUser = models.User.create({
            email: email,
            username: username,
            password: bcryptedPassword,
            bio: bio,
            isAdmin: 0,
          })
            .then(function (newUser) {
              done(newUser);
            })
            .catch(function (err) {
              return res.status(500).json({
                error: "cannot create user",
              });
            });
        },
      ],
      function (newUser) {
        if (newUser) {
          return res.status(201).json({
            userId: newUser.id,
          });
        } else {
          return res.status(500).json({
            error: "cannot add user",
          });
        }
      }
    );
  },

  // fonctions en cascades pour connecter un utilisateur
  login: function (req, res) {
    // Params
    const email = req.body.email;
    const password = req.body.password;

    if (email === null || password === null) {
      return res.status(400).json({
        message: "Veuillez remplir tous les champs",
      });
    }

    asyncLib.waterfall(
      [
        function (done) {
          models.User.findOne({
            where: { email: email },
          })
            .then(function (userFound) {
              done(null, userFound);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "unable to verify user" });
            });
        },
        function (userFound, done) {
          if (userFound) {
            bcrypt.compare(
              password,
              userFound.password,
              function (errBycrypt, resBycrypt) {
                done(null, userFound, resBycrypt);
              }
            );
          } else {
            return res.status(404).json({ error: "user not exist in DB" });
          }
        },
        function (userFound, resBycrypt, done) {
          if (resBycrypt) {
            done(userFound);
          } else {
            return res.status(403).json({ error: "invalid password" });
          }
        },
      ],
      function (userFound) {
        if (userFound) {
          return res.status(201).json({
            userId: userFound.id,
            token: jwtUtils.generateTokenForUser(userFound),
          });
        } else {
          return res.status(500).json({ error: "cannot log on user" });
        }
      }
    );
  },

  // Fonction récupérer le profil de notre utilisateur
  getUserProfile: function (req, res) {
    // Getting auth header
    const headerAuth = req.headers["authorization"];
    const userId = jwtUtils.getUserId(headerAuth);

    if (userId < 0) return res.status(400).json({ error: "wrong token" });

    models.User.findOne({
      attributes: ["id", "email", "username", "bio"],
      where: { id: userId },
    })
      .then(function (user) {
        if (user) {
          res.status(201).json(user);
        } else {
          res.status(404).json({ error: "user not found" });
        }
      })
      .catch(function (err) {
        res.status(500).json({ error: "cannot fetch user" });
      });
  },

  // Fonction modifier le profil de notre utilisateur
  updateUserProfile: function (req, res) {
    // Getting auth header
    const headerAuth = req.headers["authorization"];
    const userId = jwtUtils.getUserId(headerAuth);

    // Params
    var bio = req.body.bio;

    asyncLib.waterfall(
      [
        function (done) {
          models.User.findOne({
            attributes: ["id", "bio"],
            where: { id: userId },
          })
            .then(function (userFound) {
              done(null, userFound);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "unable to verify user" });
            });
        },
        function (userFound, done) {
          if (userFound) {
            userFound
              .update({
                bio: bio || userFound.bio,
              })
              .then(function () {
                done(userFound);
              })
              .catch(function (err) {
                res.status(500).json({ error: "cannot update user" });
              });
          } else {
            res.status(404).json({ error: "user not found" });
          }
        },
      ],
      function (userFound) {
        if (userFound) {
          return res.status(201).json(userFound);
        } else {
          return res.status(500).json({ error: "cannot update user profile" });
        }
      }
    );
  },
};
