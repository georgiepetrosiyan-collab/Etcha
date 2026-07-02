const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    f_name: {
        type: String,
        default: ""
    },
    headline: {
        type: String,
        default: ""
    },
    curr_company: {
        type: String,
        default: ""
    },
    curr_location: {
        type: String,
        default: ""
    },
    profilePic: {
        type: String,
        default: "https://res.cloudinary.com/mashhuudanny/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1747042975/1000_F_353110097_nbpmfn9iHlxef4EDIhXB1tdTD0lcWhG9_c6eolb.jpg"
    },
    cover_pic: {
        type: String,
        default: 'https://wallpaperaccess.com/full/6060285.png'
    },
    about: {
        type: String,
        default: ""
    },
    skills: {
        type: [String],
        default: [],
    },
    experience: [
        {
            designation: { type: String },
            company_name: { type: String },
            duration: { type: String },
            location: { type: String },
        }
    ],
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        }
    ],
    pending_friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        }
    ],
    applied_jobs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'job',
        }
    ],
}, { timestamps: true });

const userModel = mongoose.model('user', UserSchema);
module.exports = userModel;