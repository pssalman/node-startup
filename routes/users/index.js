const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const logger = require('../../config/logger/index');
const User = require('../../models/users/index');

const saltRounds = 10;

router.post('/signup', (req, res, next) => {
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
});

router.post('/login', (req, res, next) => {
    User.find({$or:[{ email: req.body.email }, { username: req.body.username }]})
    .exec()
    .then(user => {
        if (user.length < 1) {
            res.status(401).json({
                message: 'Unauthorized Login Attempt'
            });
        } else {
          bcrypt.compare(req.body.password, user[0].password, (err, result) => {
              if (err) {
                return res.status(401).json({
                    message: 'Unauthorized Login Attempt'
                });
              }
              if (result) {
                const token = jwt.sign(
                    {
                        email: user[0].email,
                        username: user[0].username,
                        userId: user[0]._id
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn: '1h'
                    }
                );
                return res.status(200).json({
                    message: 'Successfully Authenticated',
                    token: token
                }); 
              }
              res.status(401).json({
                message: 'Unauthorized Login Attempt'
              });

          });
        }
    })
    .catch(err => {
        logger.log('error', err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;
