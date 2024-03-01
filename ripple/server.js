import express from 'express';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import { createServer } from 'node:http';

// the current x position of global canvas. Any new client will be appended to the right of the canvas
// TODO you can come up with a more sophisticated way to handle this and and also handle the removal of disconnected clients
let current_x = 0;
let countClient = 0;
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
    countClient++;

    // Hier sendet der Client um welche Nummer an Client es sich handelt
    socket.emit('clientNumber', countClient);
    console.log('countClient' + countClient);

    // forward the draw message to all clients except the sender
    socket.on('ripple', (msg) => {
        socket.broadcast.emit('ripple', msg);
    })

    // Hier empfängt der Server die Größe des Fensters 
    // Der Server rechnet auch aus, wie verschiebt das jeweilige Fenster auf dem großen Canvas, welcher sich über alle Bildschirme erstreckt, platziert ist.
    socket.on('dimensions', (dimensions) => {
        console.log('new window size: ' + dimensions.width + ' ' + dimensions.height);
        // Bei der ersten Verbindung is X immer 0. Dann ist X immer 0 + Bildschirmbreite01 + Bildschirmbreite02 etc.
        socket.emit('offset_x', current_x);
        current_x += dimensions.width;
        // TODO handle the case when the client window is resized
    });

    // TODO handle cases when the client disconnects
});


// start the webserver
let port = process.env.PORT || 8080;        // set our port
server.listen(port);
console.log('Magic happens on port ' + port);