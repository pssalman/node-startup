const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../../models/users/index');
const logger = require('../../config/logger/index');

exports.login = (req, res, next) => {
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
}