if (process.env.NODE_ENV !== "production") {    //if we are in development, require dotenv (this is the.env file). We aren't in development but in production once website is deployed.
    require('dotenv').config();
}

const express = require('express');          //tells it to use express (importing)
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');  // used to override method to use put and delete for crud
const ejsMate = require('ejs-mate');                //used to make ejs connect to each other
const session = require('express-session');          //used so sessions can be used in the app
const flash = require('connect-flash')              // used so flash can be used in app
const passport = require('passport');                 //for authentication of user
const LocalStrategy = require('passport-local');    //for authentication of user
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Campground = require('./models/campground');   //connects to campground.js in model folder
const Review = require('./models/review')
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize'); //used so when users write $ or . it is removed to stop them from hacking mongo and make commands.

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds');        //connect to router
const reviewRoutes = require('./routes/reviews');

const MongoStore = require('connect-mongo');

//const dbUrl = process.env.DB_URL;                               // connects to Atlas on mongodb cloud server
const dbUrl = process.env.DB_URL ||'mongodb://localhost:27017/yelp-camp'


mongoose.connect(dbUrl, {      //connects mongoose to mongoDB database, yelp-camp is the database name
//subsitute the dbUrl variable to variable in env shown above the variable to change database server to cloud server. This should only be done during deployment/in production instead of testing
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const db = mongoose.connection;                                         // checks if there is an error to database connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected')
});

const app = express();                       // execute express and save return value to variable


app.engine('ejs', ejsMate);                 // tells express to use this engine instead of default one (sec. 426)
app.set('view engine', 'ejs')               //tells app to use ejs, view engine makes express assume view templates are in views folder
app.set('views', path.join(__dirname, 'views')); //views can be seen in any folder

app.use(express.urlencoded({ extended: true }))  //parse request.body. app.use allows us to run code on every single request so express.urlencoded function is used on every request. Middleware
app.use(methodOverride('_method'));             //anything with _method can use another method. Middleware
app.use(express.static(path.join(__dirname, 'public')))               //can use the static files in public directory. Middleware
app.use(mongoSanitize({
    replaceWith: '_'
}))                        //uses mongoSanitize package

const secret = process.env.SECRET || 'secretexample'

const store = MongoStore.create({           //stores session on mongo instead of memory
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,           //update session once every  24 hrs
    crypto: {
        secret,
    }
});

store.on("error", function(e){
    console.log("session store error", e)
})
const sessionConfig = {                     //tells what the secret session object should have
    store,                                  //tells to store session data to mongo
    name:'wowow',                            //name of the cookie which can be seen in chrome/application 
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {                               //adds options to the cookie sent to user
        httpOnly: true,                     // security purpose. cookie won't be accessed through client side scripts and won't send cookie to third party. Usually set true by default
        //secure: true,                     // can only access website through https instead of http for more security
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,   // Date.now is in millisec. cookie disappears in a week
        maxAge: 1000 * 60 * 60 * 24 * 7                     // difference between expire and max-age is expire takes in a date while max-age takes in length of time
    }
}
app.use(session(sessionConfig))             //uses sessions and creates them base on sessionConfig. Sends cookie to the user and using that cookie we can connect it to the correct session in our server with data saved about the user
app.use(flash());                           //app can now use flash.
                        
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dso879c0q/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dso879c0q/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dso879c0q/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/dso879c0q/" ];
 
app.use(
    helmet.contentSecurityPolicy({ //activites all 11 middleware from helmet package
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dso879c0q/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            mediaSrc   : [ "https://res.cloudinary.com/dso879c0q/" ],
            childSrc   : [ "blob:" ]
        }
    })
);


app.use(passport.initialize());
app.use(passport.session());                //browser knows the user is logged in. If this isn't written, user must keep logging in in each page. Must be below app.use(session). Find more info in passport doc.
passport.use(new LocalStrategy(User.authenticate()));     //let passport package use localStrategy and use authenticate method on the user, which is in our model. Doesn't say anything in User.js about method b/c authenitcate method is from passport local mongoose which we required in it.
passport.serializeUser(User.serializeUser()); //tells passport how to serialize user (how do we store user in session?)
passport.deserializeUser(User.deserializeUser()); //opposite of above (unstore user). Both methods from passportLocalMongoose.

app.use((req, res, next) => {               //middleware that if there's a flash in the request object, will add it to the template and have access to it as a local variable
    res.locals.currentUser = req.user;           //these are global variables so have access to these variables in every template. By adding this line, can see who is logged in (used in navbar.ejs for login/logout button statement).
    res.locals.success = req.flash('success')   //if flash key in req. object has success as value, this will trigger. res.local.success will have access to our templates automatically.
    res.locals.error = req.flash('error')
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);       //connects to the routes in campgrounds.js
app.use('/campgrounds/:id/reviews', reviewRoutes)



app.get('/', (req, res) => {                //when main page is called, will use this
    res.render('home')                         //res.render connects to home ejs
})




app.all('*', (req, res, next) => {         //app.all means do this for every request. * means call this for every path
    next(new ExpressError('Page not Found', 404))                // this will only run if nothing else has matched above and nothing was responded from them
})                                                  //next will start the next middleware which will be app.use below

app.use((err, req, res, next) => {
    const { statusCode = 500, } = err; //500 and something went wrong are default values when they don't get any values
    if (!err.message) err.message = "Something went Wrong!!"
    res.status(statusCode).render('error', { err });
})


const port = process.env.PORT || 3000;

app.listen(port, () => {                     //connects to localhost 3000
    console.log(`Serving on port ${port}`)
})







