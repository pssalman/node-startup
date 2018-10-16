const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ 
    },
    username: { type: String, required: true, unique: true, },
    name: {
        first_name: { type: String, },
        last_name: { type: String, },
    },
    password: { type: String, required: true, },
});

module.exports = mongoose.model('User', userSchema);