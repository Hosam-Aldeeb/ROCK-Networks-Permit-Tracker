var jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.cookies?.token;
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      res.redirect("/"); // Redirect to login page if not authenticated
    }
    return next();
  });
};

module.exports = auth;
