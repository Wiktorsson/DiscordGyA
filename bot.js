const Discord = require("discord.io");
const auth = require("./auth.json");
const { google } = require("googleapis");
const fs = require("fs");
const ytdl = require("ytdl-core");
// Initialize Discord Bot
const youtube = google.youtube({
  version: "v3",
  auth: auth.youtube
});
function generateYTURL(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

const fulaOrd = ["neger", "bög", "hej"];
let harFultOrd;
let voiceChannelID = "";
const playList = [];
var isPlaying = false;
function searchYT(query, bot, voiceChannelID) {
  youtube.search.list({ part: "snippet", q: query, maxResults: 1 }, function(
    error,
    data
  ) {
    const videoId = data.data.items[0].id.videoId;
    playList.push(videoId);
    if (isPlaying == false) {
      playplayList(bot, voiceChannelID);
      isPlaying = true;
    }
  });
}
function isYTURL(url) {
  return url.includes("youtube.com");
}
function playplayList(bot, voiceChannelID) {
  bot.getAudioContext(voiceChannelID, function(error, stream) {
    if (error) return console.error(error);
    let song = "";
    if (isYTURL(playList[0])) {
      song = playList[0];
    } else {
      song = generateYTURL(playList[0]);
    }
    ytdl(song, {
      filter: "audioonly"
    }).pipe(
      stream,
      { end: false }
    );

    stream.on("done", function() {
      playList.shift();
      playplayList(bot, voiceChannelID);
    });
  });
}
var bot = new Discord.Client({
  token: auth.token,
  autorun: true
});
bot.on("ready", function(evt) {
  console.log("Connected");
  console.log("Logged in as: ");
  console.log(bot.username + " - (" + bot.id + ")");
});
bot.on("message", function(user, userID, channelID, message, evt) {
  fulaOrd.forEach(ord => {
    harFultOrd = message.includes(ord);

    if (harFultOrd == true) {
      const opts = {
        channelID: channelID,
        messageID: evt.d.id
      };

      bot.deleteMessage(opts, (err, resp) => {
        console.log(err);
        console.log(resp);
      });
    }
  });

  if (message.substring(0, 1) == "!") {
    let args = message.substring(1).split(" ");
    const cmd = args[0];
    args = args.splice(1);

    switch (cmd) {
      case "ping":
        bot.sendMessage({
          to: channelID,
          message: "Pong!"
        });
        break;
      case "tjo":
        bot.sendMessage({
          to: channelID,
          message: "hej!"
        });
        break;
      case "play":
        if (args[0] && isYTURL(args[0])) {
          playList.push(args[0]);
        } else {
          searchYT(args.join(" "), bot, voiceChannelID);
        }
        if (isPlaying == false && isYTURL(args[0])) {
          playplayList(bot, voiceChannelID);
          isPlaying = true;
        }
        bot.sendMessage({
          to: channelID,
          message: "du lade till en låt i spellistan"
        });
        break;
      case "resume":
        bot.sendMessage({
          to: channelID,
          message: "du fortsatt uppspelningen"
        });
        break;
      case "stop":
        bot.sendMessage({
          to: channelID,
          message: "du stoppade uppspelningen!"
        });
        break;
      case "join":
        bot.joinVoiceChannel(args[0]);
        voiceChannelID = args[0];
        bot.sendMessage({
          to: channelID,
          message: "du bjöd in botten!"
        });
        break;
      case "kick":
        bot.leaveVoiceChannel(args[0]);
        bot.sendMessage({
          to: channelID,
          message: "botten blev sparkad!"
        });
        break;
      case "skip":
        bot.sendMessage({
          to: channelID,
          message: "du skippade låten!"
        });
        break;
      case "badWord":
        fulaOrd.push(args[0]);
        break;
      default:
        bot.sendMessage({
          to: channelID,
          message: evt.d.id
        });

      // Just add any case commands if you want to..
    }
  }
});
