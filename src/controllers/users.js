const JWT = require("jsonwebtoken");

const User = require("../models/User");

signToken = user => {
  return JWT.sign(
    {
      iss: "AntoN",
      sub: user._id,
      iat: new Date().getTime(),
      exp: new Date().setDate(new Date().getDate() + 1) // 1 day ahead
    },
    process.env.JWT_SECRET
  );
};

module.exports = {
  signUp: async (req, res, next) => {
    const { email, password } = req.value.body;

    // Check if there is a user with the same email
    const foundUser = await User.findOne({ "local.email": email });
    if (foundUser) {
      return res.status(403).json({ msg: "Email already in use" });
    }

    // Create a new user.
    const newUser = new User({
      method: "local",
      local: {
        email,
        password
      }
    });
    await newUser.save();

    // Generate token.
    const token = signToken(newUser);

    // Respond with token
    res.status(200).json({ token });
  },

  signIn: async (req, res, next) => {
    // Generate token.
    const token = signToken(req.user);
    res.status(200).json({ token });
  },

  googleOAuth: async (req, res, next) => {
    const token = signToken(req.user);
    res.status(200).json({ token });
  },

  facebookOAuth: async (req, res, next) => {
    const token = signToken(req.user);
    res.status(200).json({ token });
  },

  secret: async (req, res, next) => {
    res.json({ secret: "resource" });
  }
};
