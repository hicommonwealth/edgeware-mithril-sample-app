require('dotenv').config();

export const SERVER_URL =
  process.env.SERVER_URL || (process.env.NODE_ENV === 'production' ?
                             'https://sample.page' :
                             'http://localhost:8080');

export const DEFAULT_PORT = 8080;

export const SESSION_SECRET = process.env.SESSION_SECRET || 'my secret';
