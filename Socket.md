# Socket connections

- Visit for documentation www.socket.io
- socket.io has to be configured on both server side and client side.
- By default, Socket.IO use the WebSocket server provided by the ws package.

## process

### Server side installation

- https://socket.io/docs/v4/server-installation/
- npm install socket.io
  - npm install --save-optional bufferutil utf-8-validate (Explore the use case in socket.io website)
- create a http server in root file (app.js)
- now modify the listener to the above server instead of express app
- create a 'initialize' function on server
- create io from the socket
  - const io = socket(server);
  - you also need to handle cors error similar to the express app
- initialize the socket using the server

#### client side installation

- https://socket.io/docs/v4/client-installation/
  - npm install socket.io-client
