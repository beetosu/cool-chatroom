var express = require('express');
const socketIO = require('socket.io');
var log4js = require('log4js');
const path = require('path');


const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

var badWords = ['horny', 'smoochin', 'cybersex', 'jesse hartloff', 'hartloff', 'n word'];

log4js.configure({
  appenders: { chatlog: { type: 'file', filename: 'chat.log' } },
  categories: { default: { appenders: ['chatlog'], level: 'trace' } }
});
var logger = log4js.getLogger('chatlog');
logger.info("hello?")

io.on('connection', (socket) => {
  socket.on('disconnect', function(){
    console.log(socket.nickname + ' disconnected');
    io.emit('chat message', socket.nickname + " has left the chat")
    logger.info(socket.nickname + " LEFT")
  });
});

io.on('connection', (socket) => {
  socket.on('chat message', function(msg){
    msg = censorText(msg, badWords, socket.nickname)
    if (msg in badWords) { logger.fatal('[BAD WORD ' + msg + ' FROM ' + socket.nickname + ' MADE IT THROUGH CENSORS. FATAL ERROR]') }
    io.emit('chat message', socket.nickname + ': ' + msg);
    logger.info(socket.nickname + ": " + msg)
  });
});

io.on('connection', (socket) => {
  socket.on('send-nickname', function(nick) {
      socket.nickname = nick;
      console.log(socket.nickname + ' connected');
      io.emit('chat message', socket.nickname + " has entered the chat!")
      logger.info(socket.nickname + " JOINED")
  });
});

function censorText(string, filters, user) {
  string.toLowerCase()
  var regex = new RegExp(filters.join("|"), "gi");
  return string.replace(regex, function (match) {
      logger.warn(user + " SAID NAUGHTY WORD " + string)
      return "[CENSORED]";
  });

}