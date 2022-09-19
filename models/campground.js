const mongoose = require('mongoose');
const { campgroundSchema } = require('../schemas');
const Review = require('./review');
const Schema = mongoose.Schema;   //mapping of keys 


const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {              // virtual info are not stored in mongo. Just made in the spot when needed
    return this.url.replace('/upload', '/upload/w_200');           //changes the images' pixel size to 200.
})

const opts = { toJSON: { virtuals: true } };            //will let virtual infos be in JSON so campground virtual information will be in the object
const CampgroundSchema = new Schema({       //create table column topics and type of variable 
    title: String,
    price: Number,
    images: [ImageSchema],                               //can upload multiple images
    geometry: {                                         //uploading coordinates in latittude and longitutde in database
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,        //reference to user
        ref: 'User'
    },
    reviews: [{                             //reviews is an array of object ID's schema types
        type: Schema.Types.ObjectId,
        ref: 'Review'                       //references review.js model
    }]
}, opts);                                   //to initiate opts variable made at the top.

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {              // pop up text and properties isnt included in campground object when looking at chrome source. This is b/c mongoose doesn't include virtuals when converting document to JSON
    return `<a href="/campgrounds/${this._id}">${this.title}</a><p>${this.description.substring(0,20)}...</p>`           //changes the images' pixel size to 200.
})


CampgroundSchema.post('findOneAndDelete', async function (doc) {            //midddleware that will delete connected reviews when campground is deleted. Post b/c pre cannot find the campground to delete( will delete then find campground which makes no sense). Post will save the data before its deleted for the middleware.
    if (doc) {                                                                //checks if there is any campground is found
        await Review.remove({                  // delete all reviews where their ID field is in our document that was just deleted in its reviews array
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema) //"Campground" must be singular and uppercased and mongoose will create a collection called campgrounds
                                                                //can be imported in other files

