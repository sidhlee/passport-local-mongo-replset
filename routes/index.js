const passport = require("passport");
const bcrypt = require("bcrypt");

module.exports = (app, db) => {
  // redirect user to root if not authenticated
  const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/");
  };

  app.route("/").get((req, res) => {
    res.render(process.cwd() + "/views/pug/", {
      renderedFrom: "Pug",
      authLib: "Passport.js",
      showLogin: true,
      showSignUp: true
    });
  });

  app
    .route("/login")
    .post(
      passport.authenticate("local", { failureRedirect: "/" }),
      (req, res) => {
        console.log("user logged in successfully");
        res.redirect("/profile");
      }
    );

  app.route("/profile").get(ensureAuthenticated, (req, res) => {
    res.render(process.cwd() + "/views/pug/profile", {
      username: req.user.username
    });
  });

  app.route("/signup").post(
    (req, res, next) => {
      const hash = bcrypt.hashSync(req.body.password, 8);
      db.collection("users")
        .findOne({ username: req.body.username })
        .then(user => {
          if (user) {
            console.log("User already exists in db");
            res.redirect("/");
          } else {
            db.collection("users")
              .insertOne({
                username: req.body.username,
                password: hash
              })
              .then(user => {
                console.log(`User ${user.username} added to db`);
                next();
              })
              .catch(e => {
                console.log(e);
                res.redirect("/");
              });
          }
        })
        .catch(next);
    },
    passport.authenticate("local", { failureRedirect: "/" }),
    (req, res, next) => {
      res.redirect("/profile");
    }
  );

  app.route("/logout").get((req, res) => {
    req.logout();
    console.log("user logged out");
    res.redirect("/");
  });

  app.use((req, res, next) => {
    res
      .status(404)
      .type("text")
      .send("404 Not Found");
  });
};
