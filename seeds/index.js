//run this file separately from node anytime we want to change our database

const mongoose = require('mongoose');
const cities = require('./cities');                     //imports cities
const { places, descriptors } = require('./seedHelpers');   //deconstructs and import from seedHelpers
const Campground = require('../models/campground');   //connects to campground.js in model folder

mongoose.connect('mongodb://localhost:27017/yelp-camp', {      //connects mongoose to mongoDB database, yelp-camp is the database name
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const db = mongoose.connection;                                         // checks if there is an error to database connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected')
});

const sample = array => array[Math.floor(Math.random() * array.length)]; //picks a random listed item in the array

const seedDB = async () => {
    await Campground.deleteMany({});        //delete everything in database
    for (let i = 0; i < 100; i++) {          // loop creates 50 random camp grounds in random locations
        const random1000 = Math.floor(Math.random() * 1000);    //creates random number to pick in array for location
        const price = Math.floor(Math.random() * 30) + 10;    //creates random number for price
        const camp = new Campground({
            author: '62ba07952c933654ec83f9ec',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,    //creates random location
            title: `${sample(descriptors)} ${sample(places)}`,                      //creates random campground name
            description: "This is a campground. Beggers cannot be Choosers.",
            price,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [

                {
                    url: 'https://res.cloudinary.com/dso879c0q/image/upload/v1657058627/YelpCamp/cy008qfg1ektochflefg.jpg',
                    filename: 'YelpCamp/yj7m4osi2w69tarjmbra',
                },
                {
                    url: 'https://res.cloudinary.com/dso879c0q/image/upload/v1657058627/YelpCamp/o9ha1uvq5nikcwn4jfdt.jpg',
                    filename: 'YelpCamp/cy008qfg1ektochflefg',
                }
            ]
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close();        //closes seed to database connection
});