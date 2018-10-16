const mongoose = require('mongoose');
const dotenv = require('dotenv');
const debug = require('debug')('app:database');

const logger = require('../logger/index');

debug('Connecting to the database');
dotenv.config();

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbName = process.env.DB_NAME;
const dbURL = `mongodb+srv://${dbUser}:${dbPass}@${dbHost}/${dbName}?retryWrites=true`;

class Database {
  constructor() {
    this._connect()
  }
  _connect() {
    mongoose
      .connect(
        dbURL, { useNewUrlParser: true }
      )
      .then(() => {
        logger.log(
          'info',
          `Successfully connected to ${dbHost} MongoDB cluster`,
          { user: dbUser }
        );
      })
      .catch((err) => {
        if (err.message.code === 'ETIMEDOUT') {
          logger.log(
            'warn',
            'Attempting to re-establish database connection.'
          );
          mongoose.connect(dbURL, { useNewUrlParser: true });
        } else {
          logger.log(
            'error',
            'Error while attempting to connect to database:'
          );
          logger.log('error', err.message, { error: err });
        }
      });
  }
  _connection () {
    return mongoose.connection;
  }
};

module.exports = new Database()

