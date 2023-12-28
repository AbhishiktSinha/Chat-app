const express = require('express');
const expressServer = express();

const http = require('http');
const httpServer = http.createServer(expressServer);

const socketIo = require('socket.io');
const ServerClass = socketIo.Server;

const io = new ServerClass(httpServer);

io.on('connection', (socket)=> {

    socket.on('chatmessage_sent', (data)=> {

        // console.log('message sent by a client:',socket.client);

        io.emit('chatmessage_recieved', data);
        // console.log('message radiated to all clients');
    });

    socket.on('systemmessage', (messageData)=> {
        io.emit('systemmessage', messageData);
    })
});


expressServer.use(express.static('UI'));
httpServer.listen('8080');