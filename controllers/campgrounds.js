const Campground = require('../models/campground');   //connects to campground.js in model folder
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");  //connects to geocoding functions
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {        //main page listing all campgrounds. async tells us that the function is asynchronus. always returns promise
    const campgrounds = await Campground.find({});   //pause function until this line of code is complete 
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {      //page form to create new campground
    res.render('campgrounds/new')                      // has to be above /:id because if it's below, it's gonna look for object with id as "new"
}

module.exports.createCampground = async (req, res, next) => {      //page will post new data in database, validateCampground middleware will be used first before catchAsync to catch any errors from server side
    //if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)          //if somehow a blank or invalid form is accepted, this will notify the error
    const geoData = await geocoder.forwardGeocode({                    // uses location submitted by user in create campground form and converts to longitude/latitude
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground); //creates new object with the created data
    campground.geometry = geoData.body.features[0].geometry     //adds the ccampground coordinates into the campground object
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))          //adds url and filename to the campground from cloudinary
    campground.author = req.user._id;                       //saves author in campground
    await campground.save();                        //saves object to database
    console.log(campground)
    req.flash('success', 'Successfully made a new campground!') //create flash key in request object
    res.redirect(`/campgrounds/${campground._id}`)  // redirects to the page of new campground created
}

module.exports.showCampground = async (req, res) => {    // page for each campground and details about it
    const { id } = req.params;                       //deconstructs and finds the id value from request object
    const campground = await Campground.findById(id).populate({    //looks for campground with same Id then gets information for each review and author objects
        path: 'reviews',                                           //populates review                            
        populate: {
            path: 'author'                                         //populates the review's author  
        }
    }).populate('author')                                          //populates the campground owner/creator 
    if (!campground) {                                                        //if the campground can't be found, we will give an error flash
        req.flash('error', 'Cannot find that campground!')                  // flash will be error and will say "cannot find that campground"
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground })
}


module.exports.renderEditForm = async (req, res) => {    // page to edit the campground
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {                                                        //if the campground can't be found, we will give an error flash
        req.flash('error', 'Cannot find that campground!')                  // flash will be error and will say "cannot find that campground"
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {          // page will post the edited data in database
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });  //using id, it will update everything in object because of ...
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs);      //adds url and filename to the campground from cloudinary
    await campground.save();
    if (req.body.deleteImages) {           //if there are filenames in deleteImages array
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);        //for loop to delete all images in cloudinary
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })       //delete them from campground object
    }
    req.flash('success', 'Successfully updated campground!') //create flash key in request object
    res.redirect(`/campgrounds/${campground._id}`);        //redirect to the campground page
}

module.exports.deleteCampground = async (req, res) => {      //deletes campground in website and database
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!') //create flash key in request object
    res.redirect('/campgrounds');
}