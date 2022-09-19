const mongoose = require('mongoose')
const Schema = mongoose.Schema;   //mapping of keys 

const reviewSchema = new Schema({
    body: String,
    rating: Number,         //no reference to campground because ppl will look at campground first then its review
    author: {
        type: Schema.Types.ObjectId,        //reference to user
        ref: 'User'
    },
});

module.exports = mongoose.model("Review", reviewSchema); 