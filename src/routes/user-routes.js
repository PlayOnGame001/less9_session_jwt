import { Router } from "express";
import { createUser } from "../middlewares/user-middleware.js";
import { users } from "../data/users.js";
import path from "node:path";
import multer from "multer";

const storage = multer.diskStorage ({
    destination: "photos/",
    filename: (req, file, cb) => {
      cb(null, req.body.login + path.extname(file.originalname));
    },
});

const configMulter = multer ({storage: storage});

const userRoutes = Router();

userRoutes
  .route("/signup")
  .get((req, res) => res.render("form_register"))
  .post(configMulter.single("file"), createUser, (req, res) => {
    console.log(req.file);

    req.session.user = {
      login: req.body.login,
      email: req.body.email,
    };
    res.redirect("/");
});


userRoutes
  .route("/signup")
  .get((req, res) => res.render("form_auth"))
  .post(createUser, (req, res) => {
    req.session.user = {
      login: req.body.login,
      email: req.body.email,
    };
    res.redirect("/");
});

userRoutes.get("/signin", (req, res) => res.render("form_auth"));
userRoutes.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(); 
  }
  res.redirect("/");
});

userRoutes.get("/list", (req, res) => {
  res.render("user_list", { users });
});

export default userRoutes;
