// imports
const express = require("express");
const usersCtrl = require("./routes/usersCtrl");
const messagesCtrl = require("./routes/messagesCtrl");
const likesCtrl = require("./routes/likesCtrl");

// Router
exports.router = (function () {
  const apiRouter = express.Router();

  // Users routes
  apiRouter.route("/users/register/").post(usersCtrl.register);
  apiRouter.route("/users/login/").post(usersCtrl.login);
  apiRouter.route("/users/profil/").get(usersCtrl.getUserProfile);
  apiRouter.route("/users/profil/").put(usersCtrl.updateUserProfile);

  // Messages routes
  apiRouter.route("/messages/new/").post(messagesCtrl.createMessage);
  apiRouter.route("/messages/").get(messagesCtrl.listMessage);

  // Likes routes
  apiRouter.route("/messages/:messageId/vote/like").post(likesCtrl.likePost);
  apiRouter
    .route("/messages/:messageId/vote/dislike")
    .post(likesCtrl.dislikePost);

  return apiRouter;
})();
