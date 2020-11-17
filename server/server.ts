import WebSocket from 'ws';
import http from 'http';
import express from 'express';
import { Express } from 'express-serve-static-core';
import { DEFAULT_PORT } from './config';
// import setupWebsocketServer from './socket';

const setupServer = (app: Express, wss: WebSocket.Server, sessionParser: express.RequestHandler) => {
  const port = process.env.PORT || DEFAULT_PORT;
  app.set('port', port);
  const server = http.createServer(app);

  const onError = (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }
    switch (error.code) {
      case 'EACCES':
        console.error('Port requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error('Port is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  };

  const onListen = () => {
    const addr = server.address();
    if (typeof addr === 'string') {
      console.log(`Listening on ${addr}`);
    } else {
      console.log(`Listening on port ${addr.port}`);
    }
  };

  // TODO: you could set up a websocket server here
  // setupWebsocketServer(wss, server, sessionParser, true);

  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListen);
};

export default setupServer;
