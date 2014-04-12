var express = require('express');
var http = require('http');
var path = require('path');
var nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' });
var Sequelize = require("sequelize");
var socketio = require('socket.io');
var SerialPort = require("serialport");
SerialPort.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});

var routes = require('./routes');
var api = require('./routes/api');

var app = module.exports = express();
var server = http.createServer(app);

app.set('port', process.env.PORT || nconf.get('port'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon(__dirname + '/public/img/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser( nconf.get('cookieKey') ));
app.use(express.session({ secret: nconf.get('sessionKey'), maxAge: new Date(Date.now() + 3600000) }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

if (app.get('env') === 'development') {
  /*setTimeout(function() {
    setInterval(function() {
      var barcode = {
        left: '',
        right: '',
        event: Math.floor((Math.random()*2)+2)
      };
      var i = Math.floor((Math.random()*global.barcodes.length));
      barcode.left = global.barcodes[i].barcode;
      if (Math.random() < 0.1) barcode.left = 'none';
      journalWrite(barcode);
    }, 1*1000);
  }, 10000);*/
  app.use(express.errorHandler());
}

var io = socketio.listen(server);
io.sockets.on('connection', function() {
  console.log('socket.io client connected');
});

console.log( nconf.get('mysql').database );
global.sequelize = new Sequelize(nconf.get('mysql').database, nconf.get('mysql').user, nconf.get('mysql').password, {
  host: nconf.get('mysql').host,
  port: nconf.get('mysql').port,
  maxConcurrentQueries: 100,
  pool: { maxConnections: 5, maxIdleTime: 30 }
});
sequelize
  .authenticate()
  .complete(function(err) {
    if (!!err) {
      console.log('unable to connect to the database:', err);
    } else {
      console.log('mysql database сonnected');
      var sql = "SELECT barcode FROM workers";
      sequelize
        .query(sql, null, { raw: true })
        .success(function(result) {
          global.barcodes = result;
        });
    }
  });


var SerialPort = require("serialport").SerialPort;
if (nconf.get('comI')) {
  var serialPortI = new SerialPort(nconf.get('comI'), { baudrate: 9600 });
  serialPortI.on("open", function () {
    var barcode = { left: '', right: '', event: '' };
    serialPortI.on('data', function(data) {
      data = data.toString();
      if (data.charAt(0) == 'I') {
        barcode.left = data.substr(1);
        barcode.event = 2;
      } else if (data.charAt(0) == 'O') {
        barcode.left = data.substr(1);
        barcode.event = 3;
      } else {
        barcode.right = data.substr(0,6);
        journalWrite(barcode);
      }
    });
  });
}
if (nconf.get('comO')) {
  var serialPortO = new SerialPort(nconf.get('comO'), { baudrate: 9600 });
  serialPortO.on("open", function () {
    var barcode = { left: '', right: '', event: '' };
    serialPortO.on('data', function(data) {
      data = data.toString();
      if (data.charAt(0) == 'I') {
        barcode.left = data.substr(1);
        barcode.event = 2;
      } else if (data.charAt(0) == 'O') {
        barcode.left = data.substr(1);
        barcode.event = 3;
      } else {
        barcode.right = data.substr(0,6);
        journalWrite(barcode);
      }
    });
  });
}
function journalWrite(barcode) {
  var id = (barcode.left + barcode.right);
  var sql = "SELECT idWorker FROM workers WHERE barCode=? LIMIT 1";
  sequelize
    .query(sql, null, { raw: true }, [ id ])
    .success(function(result) {
      if (result.length > 0) {
        var record = {
          event: barcode.event,
          worker: result[0].idWorker,
          keeper: 11,
          edate: api.makeTimestamp( Date.now() )
        };
        var sql = "INSERT INTO journal SET ?";
        sequelize
          .query(sql, null, { raw: true }, [ record ])
          .success(function() {
            io.sockets.emit('pass');
          });
      } else {
        process.stdout.write('\x07');
        io.sockets.emit('beep');
      }
    });
}

app.get('/', routes.index);
app.get('/partials/:name', routes.partial);

app.get('/api/comers', api.comers);
app.get('/api/leavers', api.leavers);

app.get('*', routes.index);


server.listen(app.get('port'), function () {
  console.log('node.js server listening on port ' + app.get('port'));
});