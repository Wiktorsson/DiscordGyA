const yt = require('./youtube.js');

function ping(message) {
  message.channel.send('Pong!');
}
function tjo(message) {
  message.channel.send('tja!');
}
function play(message, args, bot, emitter) {
  if (args[0] && yt.isYTURL(args[0])) {
    yt.playPlayList.push(args[0]);
  } else {
    yt.searchYT(args.join(' '), message, bot, emitter);
  }
  if (yt.isPlaying == false && yt.isYTURL(args[0])) {
    yt.playPlayList(message, bot, emitter);

    yt.isPlaying = true;
  }
  message.channel.send('du lade till en låt i spellistan');
}
function join(message, bot) {
  voiceChannel = bot.channels.find('name', 'Music');
  voiceChannel.join();
  message.channel.send('du bjöd in botten!');
}
function skip(message, emitter) {
  message.channel.send('du skippade låten!');
  emitter.emit('skip');
}
function resume(message, emitter) {
  message.channel.send('du fortsatt uppspelningen');
  emitter.emit('play');
}
function pause(message, emitter) {
  message.channel.send('du pausade uppspelningen');
  emitter.emit('Pause');
}
function leave(message) {
  voiceChannel.leave();
}
module.exports = {
  ping,
  tjo,
  play,
  join,
  resume,
  pause,
  leave,
  skip,
};
