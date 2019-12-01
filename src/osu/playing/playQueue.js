const OsuProile = require("../../models/OsuProfile");
const User = require("../../models/User");

const queue = [];

const addPlayerToQueue = async (user, userid) => {
  const playerUser = await User.findOne({ osu_userid: userid });
  const osuProfile = await OsuProile.findOne({ user: playerUser._id });

  // Make sure user isnt already in queue
  const player = queue.find(usr => usr.username === user);
  if (player) {
    return "You are already in queue.";
  }

  // Add player to queue
  queue.push({
    username: user,
    rating: osuProfile.rating
  });
  console.log("printing queue:", queue);

  return "You are now in queue for a game.";
};

const queueSize = () => {
  return queue.length;
};

const removePlayerFromQueue = username => {
  const index = queue.findIndex(obj => obj.username === username);
  if (index > -1) {
    queue.splice(index, 1);
    return true;
  }
  return false;
};

const popFromQueue = () => {
  return queue.pop();
};

module.exports = {
  addPlayerToQueue,
  removePlayerFromQueue,
  queueSize,
  popFromQueue
};
