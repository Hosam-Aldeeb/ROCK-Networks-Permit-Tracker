var jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = (req, res, next) => {
  const token = req.cookies?.token;
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      res.redirect("/"); // Redirect to login page if not authenticated
    }
    if (user && user.type === "admin") {
      res.redirect("/admin-login");
    }
    return next();
  });
};

const adminAuth = (req, res, next) => {
  const token = req.cookies?.token;
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (user && user.type === "admin") {
      return next();
    }
    if (user && user.type === "user") {
      res.redirect("/");
    }
    res.redirect("/admin-login"); // Redirect to admin login page if not authenticated
  });
};

module.exports = { auth, adminAuth };
