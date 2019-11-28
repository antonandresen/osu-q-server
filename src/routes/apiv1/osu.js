const express = require("express");
const { check, validationResult } = require("express-validator");

const auth = require("../../middleware/auth");
const OsuVerifier = require("../../models/OsuVerifier");
const OsuProfile = require("../../models/OsuProfile");
const User = require("../../models/User");

const { getIdByUsername } = require("../../osu/osubot");

const router = express.Router();

// @route   POST api/v1/osu/verify
// @desc    Verify osu! account
// @access  Private
router.post(
  "/verify",
  [
    auth,
    [
      check("code", "Verification code is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { code } = req.body;

    try {
      // Make sure its the correct verification code.
      const matchingVerifier = await OsuVerifier.findOne({
        code
      });

      if (!matchingVerifier) {
        return res.status(401).json({
          msg: "Invalid verification code"
        });
      }

      // Find user and verify it.
      const user = await User.findById(req.id).select("-password");
      user.isverified = true;

      const id = await getIdByUsername(matchingVerifier.username);
      user.osu_userid = id;

      const updatedUser = await user.save();

      // Remove pending verify code.
      await OsuVerifier.findOneAndRemove({
        code
      });

      // Add OsuProfile for verified user.
      const osuProfile = new OsuProfile({
        user: req.id
      });
      await osuProfile.save();

      return res.json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        msg: "Server error"
      });
    }
  }
);

// @route   GET api/v1/osu/profile
// @desc    Get User Profile
// @access  Private
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.id).select("-password");
    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Server error"
    });
  }
});

// @route   GET api/v1/osu/leaderboard
// @desc    Get Osu Leaderboard
// @access  Public
router.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await OsuProfile.find({}).sort("rating");
    return res.status(200).json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Server error"
    });
  }
});

module.exports = router;
