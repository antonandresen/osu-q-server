const User = require('../../models/User');
const { ADD_TO_QUEUE } = require('../commandActions');

const playCommand = async (user, userid) => {
  const returnObj = {
    msg: '',
    action: '',
  };
  // Make sure player is verified.
  const verifiedUsers = await User.findOne({ osu_userid: userid });

  if (!verifiedUsers) {
    returnObj.msg = 'You have to verify your account before playing.';
    return returnObj;
  }

  returnObj.action = ADD_TO_QUEUE;
  return returnObj;
};

module.exports = playCommand;
