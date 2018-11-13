const Discord = require("discord.io");
const auth = require("./auth.json");
// Initialize Discord Bot
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
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`

  const fulaOrd = ["neger", "bög", "hej"];
  console.log(fulaOrd);
  let harFultOrd;

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
    console.log(cmd);
    args = args.splice(1);

    switch (cmd) {
      // !ping
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
      case "badWord":
        console.log(args[0]);
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
