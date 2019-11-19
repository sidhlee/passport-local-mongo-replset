const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const bcrypt = require("bcrypt");
const ObjectID = require("mongodb").ObjectID;

module.exports = (app, db) => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // cb passed into serializeUser is called
  // when done(null, user) is called during
  // deserialization.
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // cb passed into deserializeUser is called with every request.
  // It searches for serialized user (id) from the session
  // and retrieve user object from db, then attach it to req
  passport.deserializeUser((id, done) => {
    db.collection("users")
      .findOne({ _id: new ObjectID(id) })
      .then(user => done(null, user)) // if no matched user, passes null for user
      .catch(err => console.log(err));
  });

  passport.use(
    new LocalStrategy((username, password, done) => {
      db.collection("users")
        .findOne({ username: username })
        .then(user => {
          console.log(`User ${username} attempted to log in.`);
          if (!user) {
            console.log(`User ${username} is not found in database`);
            return done(null, false);
          }
          if (!bcrypt.compareSync(password, user.password))
            return done(null, false);
          console.log(`User ${username} authenticated successfully`);
          return done(null, user);
        })
        .catch(done); // pass err as 1st arg to done
    })
  );
};
