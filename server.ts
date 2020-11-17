import express from 'express';
import webpack from 'webpack';
import session from 'express-session';
import webpackDevMiddleware from 'webpack-dev-middleware';
import WebSocket from 'ws';
import fs from 'fs';

import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import webpackHotMiddleware from 'webpack-hot-middleware';
import { redirectToHTTPS } from 'express-http-to-https';
import favicon from 'serve-favicon';

// import models from './server/database';
import { SESSION_SECRET } from './server/config';
import setupAppRoutes from './server/routes';
import setupServer from './server/server';
import devWebpackConfig from './webpack/webpack.config.dev.js';
import prodWebpackConfig from './webpack/webpack.config.prod.js';

// set up express async error handling hack
require('express-async-errors');

const app = express();

async function main() {
  const DEV = process.env.NODE_ENV !== 'production';
  const compiler = DEV ? webpack(devWebpackConfig) : webpack(prodWebpackConfig);

  const devMiddleware = DEV ? webpackDevMiddleware(compiler, {
    publicPath: '/build',
  }) : null;
  const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

  const sessionParser = session({
    secret: SESSION_SECRET,
    // store: new SequelizeStore({
    //   db: models.sequelize,
    //   tableName: 'Sessions',
    //   checkExpirationInterval: 15 * 60 * 1000, // Clean up expired sessions every 15 minutes
    //   expiration: 7 * 24 * 60 * 60 * 1000, // Set session expiration to 7 days
    // }),
    resave: false,
    saveUninitialized: true,
  });

  const setupMiddleware = () => {
    // redirect from sample.herokuapp.com to sample.page
    // TODO: update this to handle any redirects you need
    app.all(/.*/, (req, res, next) => {
      const host = req.header('host');
      if (host.match(/sample.herokuapp.com/i)) {
        res.redirect(301, `https://sample.page${req.url}`);
      } else {
        next();
      }
    });
    app.use(redirectToHTTPS([/localhost:(\d{4})/, /127.0.0.1:(\d{4})/], [], 301));
    // serve the compiled app
    if (DEV) {
      app.use(devMiddleware);
      app.use(webpackHotMiddleware(compiler));
    } else {
      app.use('/build', express.static('build'));
    }

    // serve static files
    app.use(favicon(`${__dirname}/favicon.ico`));
    app.use('/static', express.static('static'));

    // add other middlewares
    // app.use(logger('dev'));
    app.use(bodyParser.json({ limit: '1mb' }));
    app.use(bodyParser.urlencoded({ limit: '1mb', extended: false }));
    app.use(cookieParser());
    app.use(sessionParser);
    // app.use(passport.initialize());
    // app.use(passport.session());
    // app.use(prerenderNode.set('prerenderServiceUrl', 'http://localhost:3000'))\
    ;

    // store wss into request obj
    app.use((req: any, res, next) => {
      req.wss = wss;
      next();
    });
  };

  // load template for production server
  const templateFile = (() => {
    try {
      return fs.readFileSync('./build/index.html');
    } catch (e) {
      console.error(`Failed to read template file: ${e.message}`);
    }
  })();
  const sendFile = (res) => res.sendFile(`${__dirname}/build/index.html`);

  // TODO: setupPrerenderServer (if running in production)
  setupMiddleware();
  // TODO: setupPassport
  // TODO: setupAPI
  setupAppRoutes(app, devMiddleware, templateFile, sendFile);
  // TODO: setupErrorHandlers

  setupServer(app, wss, sessionParser);
}
main();
export default app;
