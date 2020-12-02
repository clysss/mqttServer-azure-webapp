const BASE_TOPIC='/mytopic/';
const MQTT_USERNAME='xxx';
const MQTT_PASSWORD='xxx';
const WS_PATH='/pppp';

var express = require('express');
var app = express();
var aedes = require('aedes')();

aedes.authenticate = function (client, username, password, callback) {
    if (!password || !username) {
      console.log('Auth failed (No cred) ['+client.id+ '] ' + username + ' : '+ password);
      const error = new Error('No credentials provided');
      error.returnCode = 4;
      return callback(error, null);
    }
    if ((username==MQTT_USERNAME) && (password.toString()==MQTT_PASSWORD)) {
      console.log('Auth OK: ['+client.id+ '] ' + username+' : '+ password);
      return callback(null, true);
    }
    console.log('AuthFail: ['+client.id+ '] ' + username+' : '+ password);
    const error = new Error('Wrong credentials');
    error.returnCode = 4;
    return callback(error, null);
}
  
aedes.authorizeSubscribe = function (client, sub, callback) {
    if (sub.topic.substr(0,BASE_TOPIC.length) != BASE_TOPIC) {
        console.log('Subscrp: BAD TOPIC [' + client + '] >> : ' + sub.topic);
        return callback(new Error('wrong topic'));
    }
    callback(null, sub);
}

aedes.authorizePublish = function (client, sub, callback) {
    if (sub.topic.substr(0,BASE_TOPIC.length) != BASE_TOPIC) {
        console.log('Publish: BAD TOPIC [' + client + '] >> : ' + sub.topic);
        return callback(new Error('wrong topic'));
    }
    callback(null, sub);
}


const httpServer = require('http').createServer(app);
const ws = require('websocket-stream');
const port =process.env.PORT||8000;

console.log('>>>>>>>>>>>>>>>>>>>>>>>>1>>>>>');
ws.createServer({ server: httpServer, path : WS_PATH }, aedes.handle);

httpServer.listen(port, function () {
  console.log('Aedes  : MQTT started on port ', port);
})


 aedes.on('subscribe', function (subscriptions, client) {
    console.log('Subscrp: [' + (client ? client.id : client) +
            '] >> : ' + subscriptions.map(s => s.topic).join('\n'));
  })

  aedes.on('unsubscribe', function (subscriptions, client) {
    console.log('Unsubsc: [' + (client ? client.id : client) +
            '] >> : ' + subscriptions.map(s => s.topic).join('\n'));
  })

  aedes.on('client', function (client) {
    console.log('clConn : [' + (client ? client.id : client) + ']');
  })

  // fired when a client disconnects
  aedes.on('clientDisconnect', function (client) {
    console.log('clDisco: [' + (client ? client.id : client) + ']');
  })

  // fired when a message is published
  aedes.on('publish', async function (packet, client) {
    console.log('Publish: [' + (client ? client.id : 'BROKER_' + aedes.id) + '] >> ' + packet.topic+ ' :: '+packet.payload.toString());
  })


console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

