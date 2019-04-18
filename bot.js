const yt = require("./youtube.js");
const Discord = require("discord.js");
const auth = require("./auth.json");
const coms = require("./kommandon.js");
const bot = new Discord.Client();
var events = require("events").EventEmitter;
var emitter = new events.EventEmitter();
bot.login(auth.token);
bot.on("ready", function() {});
bot.on("message", message => {
  if (message.content.substring(0, 1) == "!") {
    let args = message.content.substring(1).split(" ");
    const cmd = args[0];
    args = args.splice(1);

    try {
      switch (cmd.toLowerCase()) {
        case "ping":
          coms.ping(message);
          break;
        case "tjo":
          coms.tjo(message);
          break;
        case "play":
          coms.play(message, args, bot, emitter);
          break;
        case "resume":
          coms.resume(message, emitter);
          break;
        case "pause":
          coms.pause(message, emitter);

          break;
        case "join":
          coms.join(message, bot);
          break;
        case "kick":
          coms.leave(message);
          break;
        case "skip":
          coms.skip(message, emitter);

          break;
      }
    } catch (error) {
      console.log(error);
      message.channel.send("oops det fungerar inte");
    }
  }
});
