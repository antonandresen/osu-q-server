const Banchojs = require("bancho.js");

const handleCommand = require("./commands/handleCommand");
const {
  addPlayerToQueue,
  removePlayerFromQueue,
  queueSize,
  popFromQueue
} = require("./playing/playQueue");
const { ADD_TO_QUEUE, REMOVE_FROM_QUEUE } = require("./commandActions");

const OsuProfile = require("../models/OsuProfile");
const User = require("../models/User");

let client = null;
let antonBanchoUser = null;

const connectOsuBot = async () => {
  client = new Banchojs.BanchoClient({
    username: process.env.OSU_USERNAME,
    password: process.env.OSU_PASSWORD,
    apiKey: process.env.OSU_API_KEY
  });

  try {
    await client.connect();
    console.log("osu!bot Connected...");

    // Join #osu
    const osuChannel = client.getChannel("#osu");
    await osuChannel.join();

    // Fetch API data for bot user. (AntoN).
    antonBanchoUser = client.getSelf();
    await antonBanchoUser.fetchFromAPI();

    client.on("PM", async message => {
      if (message.user.ircUsername === "AntoN") {
        return; // Was sent by bot.
      }

      console.log(`${message.user.ircUsername}: ${message.message}`);

      const res = await handleCommand(
        message.message,
        message.user.ircUsername,
        await getIdByUsername(message.user.ircUsername)
      );

      if (res !== null) {
        // Check action
        switch (res.action) {
          case ADD_TO_QUEUE:
            const msg = await addPlayerToQueue(
              message.user.ircUsername,
              await getIdByUsername(message.user.ircUsername)
            );
            await message.user.sendMessage(msg);
            // If we have 2 or more players in the queue we start a game.
            if (queueSize() >= 2) {
              const p1 = popFromQueue();
              if (p1 === undefined) return;
              const p2 = popFromQueue();
              if (p2 === undefined) {
                // Put p1 back in queue!
                await addPlayerToQueue(
                  p1.username,
                  await getIdByUsername(p1.username)
                );
                return;
              }
              await client
                .getUser(p1.username)
                .sendMessage("A game has been found!"); //@TODO: send to both players.
              await client
                .getUser(p2.username)
                .sendMessage("A game has been found!");
              await startGame(p1.username, p2.username);
              return;
            }
            return;
          case REMOVE_FROM_QUEUE:
            msg = removePlayerFromQueue(message.user.ircUsername);
            await message.user.sendMessage(msg);
            return;
          default:
            break;
        }
        // Send msg back to user.
        await message.user.sendMessage(res.msg);
      }
    });
  } catch (err) {
    console.error(err);
  }
};

const getUsernameById = async userId => {
  const user = await client.getUserById(userId);
  return user.ircUsername;
};

const getIdByUsername = async username => {
  const user = client.getUser(username);
  await user.fetchFromAPI(); // populate id field (among others)
  return user.id;
};

const startGame = async (p1, p2) => {
  const beatmaps = [2002605, 1894677, 1253622, 1609590, 1915062]; //Short: 1361620
  let lobby;
  let channel;
  try {
    channel = await client.createLobby(
      "osu-q Match " +
        Math.random()
          .toString(36)
          .substring(8)
    );
    lobby = channel.lobby;
    const password = Math.random()
      .toString(36)
      .substring(8);

    // Set lobby settings
    await Promise.all([
      lobby.setPassword(password),
      lobby.setMap(beatmaps[0]),
      lobby.setSize(2)
    ]);

    // Invite both players
    await Promise.all([lobby.invitePlayer(p1), lobby.invitePlayer(p2)]);
  } catch (err) {
    console.error(err);
  }

  // Subscrbe to events
  lobby.on("allPlayersReady", async () => {
    // Make sure both players have joined.
    // Start the match.
    if (
      (lobby.slots[0].user.ircUsername === p1 ||
        lobby.slots[0].user.ircUsername === p2) &&
      (lobby.slots[1].user.ircUsername === p1 ||
        lobby.slots[1].user.ircUsername === p2)
    ) {
      //@TODO: Bruh?
      const timeTilStart = 5;
      await lobby.startMatch([timeTilStart]); //@TODO: Array?
    }
  });
  lobby.on("matchFinished", async scores => {
    // scores --> array (score -> num, pass -> bool, player -> BLP)
    console.log("scores", scores);

    const winnerUN = scores[0].player.user.ircUsername;
    const looserUN = scores[1].player.user.ircUsername;

    try {
      const winnerID = await getIdByUsername(winnerUN);
      const looserID = await getIdByUsername(looserUN);

      // Winner
      const winnerUser = await User.findOne({
        osu_userid: winnerID
      });
      const winnerProfile = await OsuProfile.findOne({
        user: winnerUser._id
      });
      // Looser
      const looserUser = await User.findOne({
        osu_userid: looserID
      });
      const looserProfile = await OsuProfile.findOne({
        user: looserUser._id
      });

      // Adjust stats (rating static for now).
      winnerProfile.rating += 20;
      winnerProfile.wins += 1;
      const matchHistoryW = {
        opponent: looserID,
        is_winner: true,
        maps_played: [
          {
            map_id: beatmaps[0],
            is_map_winner: true
          }
        ]
      };
      if (winnerProfile.match_history === undefined) {
        winnerProfile.match_history = [matchHistoryW];
      } else {
        winnerProfile.match_history.push(matchHistoryW);
      }

      looserProfile.rating -= 20;
      looserProfile.losses += 1;
      const matchHistoryL = {
        opponent: winnerID,
        is_winner: false,
        maps_played: [
          {
            map_id: beatmaps[0],
            is_map_winner: false
          }
        ]
      };
      if (looserProfile.match_history === undefined) {
        looserProfile.match_history = [matchHistoryL];
      } else {
        looserProfile.match_history.push(matchHistoryL);
      }

      await Promise.all([looserProfile.save(), winnerProfile.save()]);

      await channel.sendMessage(
        `${winnerUN} won the game! Both of you can now leave the game.`
      );

      setTimeout(async () => {
        await lobby.closeLobby();
      }, 10000);
    } catch (err) {
      console.error(err);
      setTimeout(async () => {
        await lobby.closeLobby();
      }, 10000);
    }
  });
  lobby.on("playerJoined", async ({ player, slot, team }) => {
    await channel.sendMessage(
      `Welcome ${player.user.ircUsername}! When you and your opponent is ready, the match will start :)`
    );
  });
};

process.on("SIGINT", async () => {
  console.log("osu! bot disconnecting...");
  await client.disconnect();
});

module.exports = {
  connectOsuBot,
  getUsernameById,
  getIdByUsername,
  startGame,
  osuClient: client
};
