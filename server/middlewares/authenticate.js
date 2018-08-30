var authenticate = (req, res, next) => {
  if(req.user) {
    return next();
  }
  req.flash('error', { msg: 'Please login to view this page' });
  res.redirect('/auth/login');
};

module.exports = authenticate;
