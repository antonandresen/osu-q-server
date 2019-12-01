const verifyCommand = require("./verifyCommands");
const { playCommand, leaveCommand } = require("./playCommands");

const PREFIX = "!";

const handleCommand = async (message, user, userid) => {
  const args = message.split(" ");
  if (args.length <= 0) {
    return null;
  }

  const prefix = args[0][0];
  if (prefix !== PREFIX) {
    return null;
  }

  const command = args[0];
  switch (command) {
    case PREFIX + "help":
      const helpObj = {
        msg: `!verify - Get a verification code | !play - Start queueing for a game | !leave - Leave the queue`,
        action: ""
      };
      return helpObj;
    case PREFIX + "verify":
      const verifyObj = await verifyCommand(user, userid);
      return verifyObj;
    case PREFIX + "play":
      const playObj = await playCommand(user, userid);
      return playObj;
    case PREFIX + "leave":
      const leaveObj = leaveCommand(user);
      return leaveObj;
    default:
      return null;
  }
};

module.exports = handleCommand;
