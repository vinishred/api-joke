// imports
const bcrypt = require("bcrypt");
const jwtUtils = require("../utils/jwt.utils");
const models = require("../models");

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

    // TODO verify pseudo length ; mail regex password etc.

    models.User.findOne({
      attributes: ["email"],
      where: {
        email: email,
      },
    })
      .then(function (userFound) {
        if (!userFound) {
          bcrypt.hash(password, 5, function (err, bcryptedPassword) {
            const newUser = models.User.create({
              email: email,
              username: username,
              password: bcryptedPassword,
              bio: bio,
              isAdmin: 0,
            })
              .then(function (newUser) {
                return res.status(201).json({
                  userId: newUser.id,
                });
              })
              .catch(function (err) {
                return res.status(500).json({
                  error: "cannot create user",
                });
              });
          });
        } else {
          return res.status(409).json({
            error: "user already exist",
          });
        }
      })
      .catch(function (err) {
        return res.status(500).json({
          error: "cannot verify user",
        });
      });
  },

  login: function (req, res) {
    // Params
    const email = req.body.email;
    const password = req.body.password;

    if (email === null || password === null) {
      return res.status(400).json({
        message: "Veuillez remplir tous les champs",
      });
    }

    // TODO verify pseudo length ; mail regex password etc.

    models.User.findOne({
      where: {
        email: email,
      },
    }).then(function (userFound) {
      if (userFound) {
        bcrypt.compare(
          password,
          userFound.password,
          function (errBycrypt, resBycrypt) {
            if (resBycrypt) {
              return res.status(201).json({
                userId: userFound.id,
                token: jwtUtils.generateTokenForUser(userFound),
              });
            } else {
              return res.status(403).json({
                error: "invalid password",
              });
            }
          }
        );
      } else {
        return res.status(404).json({
          error: "user not found",
        });
      }
    });
  },
};
