var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var log4js = require('log4js');

var badWords = ['horny', 'smoochin', 'cybersex', 'jesse hartloff', 'hartloff', 'n word'];

log4js.configure({
  appenders: { chatlog: { type: 'file', filename: 'chat.log' } },
  categories: { default: { appenders: ['chatlog'], level: 'trace' } }
});
var logger = log4js.getLogger('chatlog');
logger.info("hello?")

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('disconnect', function(){
    console.log(socket.nickname + ' disconnected');
    io.emit('chat message', socket.nickname + " has left the chat")
    logger.info(socket.nickname + " LEFT")
  });
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    msg = censorText(msg, badWords, socket.nickname)
    if (msg in badWords) { logger.fatal('[BAD WORD ' + msg + ' FROM ' + socket.nickname + ' MADE IT THROUGH CENSORS. FATAL ERROR]') }
    io.emit('chat message', socket.nickname + ': ' + msg);
    logger.info(socket.nickname + ": " + msg)
  });
});

io.on('connection', function(socket) {
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

http.listen(3000, function(){
  console.log('listening on *:3000');
  logger.debug("SERVER UP ON PORT 3000")
});