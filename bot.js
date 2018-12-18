const Discord = require("discord.js");
const auth = require("./auth.json");
const { google } = require("googleapis");
const fs = require("fs");
const ytdl = require("ytdl-core");
var events = require("events").EventEmitter;
var emitter = new events.EventEmitter();

// Initialize Discord Bot
const youtube = google.youtube({
  version: "v3",
  auth: auth.youtube
});
function generateYTURL(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

let voiceChannel;

const fulaOrd = ["neger", "bög", "hej"];
let harFultOrd;
let voiceChannelID = "";
const playList = [];
var isPlaying = false;
function searchYT(query, message) {
  youtube.search.list(
    { part: "snippet", q: query, maxResults: 1, type: "video" },
    function(error, data) {
      const videoId = data.data.items[0].id.videoId;
      const items = data.data.items[0].id;
      console.log({ items });
      console.log({ videoId });
      playList.push(videoId);
      if (isPlaying == false) {
        playplayList(message);
        isPlaying = true;
      }
    }
  );
}
function isYTURL(url) {
  return url.includes("youtube.com");
}
async function playplayList(message) {
  /*bot.getAudioContext(voiceChannelID, function(error, stream) {
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
  });*/
  let song = "";
  if (isYTURL(playList[0])) {
    song = playList[0];
  } else {
    console.log("before generate " + playList[0]);
    song = generateYTURL(playList[0]);
  }
  console.log("after generate " + song);

  const connection = await bot.channels
    .get(message.member.voiceChannelID)
    .join();
  const ytdl = require("ytdl-core");
  const dispatcher = connection.playStream(ytdl(song, { filter: "audioonly" }));
  /*setTimeout(function() {
    dispatcher.pause();
  }, 5000);*/
  emitter.on("Pause", function() {
    dispatcher.pause();
  });
  emitter.on("skip", function() {
    dispatcher.destroy();
    playList.shift();
    playplayList(bot, voiceChannelID);
  });
  emitter.on("play", function() {
    dispatcher.resume();
  });
  dispatcher.on("finish", () => {
    playList.shift();
    playplayList(bot, voiceChannelID);
  });
}

const bot = new Discord.Client();
bot.login(auth.token);
bot.on("ready", function(evt) {
  console.log(Date.now());
  console.log("Connected");
  console.log("Logged in as: ");
  console.log(bot.username + " - (" + bot.id + ")");
});
bot.on("message", message => {
  fulaOrd.forEach(ord => {
    harFultOrd = message.content.includes(ord);
  });

  if (message.content.substring(0, 1) == "!") {
    let args = message.content.substring(1).split(" ");
    const cmd = args[0];
    args = args.splice(1);

    switch (cmd) {
      case "ping":
        message.channel.send("Pong!");
        break;
      case "tjo":
        message.channel.send("hej!");
        break;
      case "play":
        console.log("play args", args[0]);
        if (args[0] && isYTURL(args[0])) {
          playList.push(args[0]);
        } else {
          searchYT(args.join(" "), message);
        }
        if (isPlaying == false && isYTURL(args[0])) {
          playplayList(message);

          isPlaying = true;
        }
        message.channel.send("du lade till en låt i spellistan");
        break;
      case "resume":
        message.channel.send("du fortsatt uppspelningen");
        emitter.emit("play");
        break;
      case "pause":
        message.channel.send("du pausade uppspelningen");
        emitter.emit("Pause");

        break;
      case "join":
        voiceChannel = bot.channels.find("name", "Music");
        voiceChannel.join();
        message.channel.send("du bjöd in botten!");
        break;
      case "kick":
        voiceChannel.leave();
        break;
      case "skip":
        message.channel.send("du skippade låten!");
        emitter.emit("skip");

        break;

      // Just add any case commands if you want to..
    }
  }
});
