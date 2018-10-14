const mongoose = require("mongoose");
const dotenv = require('dotenv');
const debug = require('debug')('app:database');

const logger = require('../logger/index');

debug('Connecting to the database');
dotenv.config();

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbURL = `mongodb+srv://${dbUser}:${dbPass}@${dbHost}/test?retryWrites=true`

mongoose
  .connect(
    dbURL, { useNewUrlParser: true }
  )
  .then(() => {
    logger.log(
      'info',
      `Successfully connected to ${dbHost} MongoDB cluster`,
      { 'user': dbUser }
    )
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
      logger.log('error',err.message, {'error': err});
		}
  });