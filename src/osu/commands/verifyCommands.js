const OsuVerifier = require('../../models/OsuVerifier');
const User = require('../../models/User');

const verifyCommand = async (user, userid) => {
  const verifyCode = makeCode();
  const newOsuVerifier = {
    code: verifyCode,
    username: user,
  };

  const returnObj = {
    msg: '',
    action: '',
  };

  try {
    // look if user is already verified.
    const verifiedUser = await User.findOne({ osu_userid: userid });

    if (verifiedUser) {
      returnObj.msg = 'You are already verified.';
      return returnObj;
    }

    const alreadyExistingVerifier = await OsuVerifier.findOne({
      username: user,
    });

    if (alreadyExistingVerifier) {
      await OsuVerifier.findOneAndUpdate(
        { username: user },
        { $set: newOsuVerifier },
        { new: true },
      );

      returnObj.msg = `Your updated verification code is: ${verifyCode}`;
      return returnObj;
    } else {
      const newOsuVerifyModel = new OsuVerifier(newOsuVerifier);

      await newOsuVerifyModel.save();

      returnObj.msg = `Your verification code is: ${verifyCode}`;
      return returnObj;
    }
  } catch (err) {
    console.error(err);
    returnObj.msg = 'Something went wrong. Let AntoN know that his bot sucks!';
    return returnObj;
  }
};

function makeCode() {
  const length = 10;
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = verifyCommand;
