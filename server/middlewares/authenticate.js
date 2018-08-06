var authenticate = (req, res, next) => {
  if(!req.user) {
    return res.redirect('/auth/login');
  }
  return next();
};

module.exports = authenticate
