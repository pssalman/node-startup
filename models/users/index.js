const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    email: { 
        type: String,
        trim: true,
		lowercase: true,
        required: true, 
        unique: true, 
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ 
    },
    username: { type: String, trim: true, required: true, unique: true, },
    name: {
        first_name: { type: String, trim: true },
        last_name: { type: String, trim: true },
    },
    password: { type: String, required: true, },
}, { 
    collection: 'users',
    timestamps: true,
    collation: { locale: 'en_US', strength: 1 } // will ignore case matches
});

// UserSchema.plugin(timestamps);
UserSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', UserSchema);