const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    fields: {
        password: {
            type: String,
            required: false, // Passwords not required when user sign up with Google
        },
        phone:{
            type: String,
            required: false,   // Not required when user sign up with Google
            
        },
        name: {
            type: String,
            required: false, // Not required when user sign up with Google
        },
    },
    signupwithgoogle: {
        type: Boolean,
        required: true,
        default: false, // Default to false, true if user signs up with Google
    },
    iv:{
        type: String,
        require: true,
    },
    userSurvey: [
        {
            question: String,
            answer: String
        }
    ],
    }, {
    timestamps: true, // Only beacuse monday.com is data-driven application
});

const User = mongoose.model('User', userSchema);
module.exports = User;
