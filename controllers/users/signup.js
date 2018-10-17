const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../../models/users/index');
const logger = require('../../config/logger/index');

exports.signUp = (req, res, next) => {
    User.find({$or:[{ email: req.body.email }, { username: req.body.username }]})
      .exec()
      .then(user => {
          if (user.length >= 1) {
              res.status(409).json({
                  message: 'Invalid Username or Email'
              });
          } else {
              bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
                  if (err) {
                    res.status(500).json({
                      error: err.message,
                    });
                  } else {
                    const user = new User({
                      _id: new mongoose.Types.ObjectId,
                      email: req.body.email,
                      username: req.body.username,
                      name: {
                        first_name: req.body.firstName,
                        last_name: req.body.lastName,
                      },
                      password: hash          
                    });
                    user
                      .save()
                      .then(result => {
                          logger.log('info', result);
                          res.status(201).json({
                              message: 'A New User has been Created Successfully'
                          });
                      })
                      .catch(err => {
                          logger.log('error', err);
                          res.status(500).json({
                              message: 'There has been an error trying to save the user',
                              error: err
                          });
                      })
                  };
                });
              
          }
      });
  }