const { google } = require("googleapis");
const ytdl = require("ytdl-core");
const auth = require("./auth.json");
var events = require("events").EventEmitter;
var emitter = new events.EventEmitter();

let voiceChannel;
let voiceChannelID = "";
const playList = [];
let isPlaying = false;

// Initialize Discord Bot
const youtube = google.youtube({
  version: "v3",
  auth: auth.youtube
});
function generateYTURL(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
function searchYT(query, message, bot) {
  youtube.search.list(
    { part: "snippet", q: query, maxResults: 1, type: "video" },
    function(error, data) {
      const videoId = data.data.items[0].id.videoId;
      const items = data.data.items[0].id;
      playList.push(videoId);
      if (isPlaying == false) {
        playPlayList(message, bot);
        isPlaying = true;
      }
    }
  );
}
function isYTURL(url) {
  return url.includes("youtube.com");
}
async function playPlayList(message, bot) {
  let song = "";
  if (isYTURL(playList[0])) {
    song = playList[0];
  } else {
    song = generateYTURL(playList[0]);
  }
  voiceChannelID = voiceChannelID
    ? voiceChannelID
    : message.member.voiceChannelID;
  const connection = await bot.channels.get(voiceChannelID).join();
  const dispatcher = connection.playStream(ytdl(song, { filter: "audioonly" }));
  emitter.on("Pause", function() {
    dispatcher.pause();
  });
  emitter.on("skip", function() {
    dispatcher.destroy();
    playList.shift();
    playPlayList(bot, voiceChannelID, bot);
  });
  emitter.on("play", function() {
    dispatcher.resume();
  });
  dispatcher.on("finish", () => {
    playList.shift();
    playPlayList(bot, voiceChannelID, bot);
  });
}
module.exports = {
  playPlayList,
  generateYTURL,
  searchYT,
  isYTURL,
  isPlaying
};
