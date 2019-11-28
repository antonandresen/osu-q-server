const User = require('../models/User');

module.exports = async function(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user.isadmin) {
      return res
        .status(401)
        .json({ msg: 'User not admin, authorization denied' });
    }
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
