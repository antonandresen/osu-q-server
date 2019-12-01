const User = require("../../models/User");
const { ADD_TO_QUEUE, REMOVE_FROM_QUEUE } = require("../commandActions");

const playCommand = async (user, userid) => {
  const returnObj = {
    msg: "",
    action: ""
  };
  // Make sure player is verified.
  const verifiedUsers = await User.findOne({ osu_userid: userid });

  if (!verifiedUsers) {
    returnObj.msg = "You have to verify your account before playing.";
    return returnObj;
  }

  returnObj.action = ADD_TO_QUEUE;
  return returnObj;
};

const leaveCommand = user => {
  const returnObj = {
    msg: "",
    action: REMOVE_FROM_QUEUE
  };
  return returnObj;
};

module.exports = {
  playCommand,
  leaveCommand
};
