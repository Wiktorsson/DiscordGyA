const { google } = require("googleapis");
const ytdl = require("ytdl-core");
const auth = require("./auth.json");

let voiceChannel;
let voiceChannelID = "";
const playList = [];
let isPlaying = false;
let ended = false;
const connect = require("./models/connect");

// Initialize Discord Bot
const youtube = google.youtube({
  version: "v3",
  auth: auth.youtube
});
function generateYTURL(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
function searchYT(query, message, bot, emitter) {
  youtube.search.list(
    { part: "snippet", q: query, maxResults: 1, type: "video" },
    function(error, data) {
      const videoId = data.data.items[0].id.videoId;
      const items = data.data.items[0].id;
      playList.push(videoId);
      if (!videoId) {
        message.channel.send("Hittade ingen låt");
      }
      if (isPlaying == false) {
        playPlayList(message, bot, emitter);
        isPlaying = true;
      }
    }
  );
}
function isYTURL(url) {
  return url.includes("youtube.com");
}
async function playPlayList(message, bot, emitter) {
  let song = "";
  if (playList[0]) {
    if (isYTURL(playList[0])) {
      song = playList[0];
    } else {
      song = generateYTURL(playList[0]);
    }
  } else {
    if (!ended) {
      ended = true;
      return message.channel.send("spellistan är tom lägg till nya");
    }
  }

  youtube.search.list(
    { part: "snippet", q: song, maxResults: 1, type: "video" },
    async function(error, data) {
      const db = await connect();
      const collection = db.collection("toplist");
      const dbsong = await collection.find({ ytURL: song }).toArray();
      message.channel.send(
        `just nu spelas ${data.data.items[0].snippet.title}`
      );
      if (dbsong.length) {
        collection.findOneAndUpdate(
          { ytURL: song },
          {
            $set: {
              ytURL: song,
              plays: dbsong[0].plays + 1,
              name: data.data.items[0].snippet.title
            }
          }
        );
      } else {
        collection.insertOne({
          ytURL: song,
          plays: 1,
          name: data.data.items[0].snippet.title
        });
      }
    }
  );
  voiceChannelID = voiceChannelID
    ? voiceChannelID
    : message.member.voiceChannelID;
  if (!voiceChannelID) {
    return message.channel.send("Du måste vara i samma channel som boten!");
  }
  const connection = await bot.channels.get(voiceChannelID).join();
  const dispatcher = connection.playStream(ytdl(song, { filter: "audioonly" }));
  emitter.on("Pause", function() {
    console.log("pause??");
    dispatcher.pause();
  });
  emitter.on("skip", function() {
    dispatcher.destroy();
    playList.shift();
    playPlayList(message, bot, emitter);
  });
  emitter.on("play", function() {
    dispatcher.resume();
  });
  dispatcher.on("end", () => {
    dispatcher.destroy();
    playList.shift();
    playPlayList(message, bot, emitter);
  });
}
module.exports = {
  playPlayList,
  generateYTURL,
  searchYT,
  isYTURL,
  isPlaying
};
