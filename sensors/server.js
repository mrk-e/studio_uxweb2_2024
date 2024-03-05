import express from 'express';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import { createServer } from 'node:http';

// create a new express web server
let app = express();

// create a new socket.io server
const server = createServer(app);
const io = new Server(server);

// get the directory where server.js is located
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// serve the index.html as starting page
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "public", "index.html"))
});

// serve static files in the public folder
app.use(express.static('public'));

// a client has connected
io.on('connection', (socket) => {
    console.log('a client connected');

    // send a welcome message to the client
    socket.emit('msg', "welcome from the server");

    // forward the message to all clients except the sender
    socket.on('draw', (msg) => {
        socket.broadcast.emit('draw', msg);
    })
});


// start the webserver
let port = process.env.PORT || 8080;        // set our port
server.listen(port);
console.log('Magic happens on port ' + port);