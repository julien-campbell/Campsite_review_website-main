const User = require('../models/user');

module.exports.renderRegister = (req, res) => {      //brings to a page where user can register
    res.render('users/register')
}

module.exports.register = async (req, res, next) => {       //posts registration form into database
    try {                                                   // checks if theres any error. If there is, will go to catch
        const { email, username, password } = req.body;    //creates variables for the input made by user when registering
        const user = new User({ email, username })         //creates new object called user and adds user and email to it.
        const registeredUser = await User.register(user, password); //just creates the object and stores in data but does not log them in yet. hashes password and user and stores it in new user object
        req.login(registeredUser, err => {                  //logs in user after registering
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {                                           //error is shown in flash instead of a new error page. Error message looks nicer than before because it gets it from passportLocalM0ngoose
        req.flash('error', e.message);
        res.direct('register');
    }
}

module.exports.renderLogin = (req, res) => {            //renders login page for user to login
    res.render('users/login')
}

module.exports.login = (req, res) => {           //passport.authenticate middleware authenticates user through 'local'(local user object made. can authenticate through twitter or google as well.) failureFlash creates a flash message when authentication fails. redirects to /login if it fails. Will go to next line if authentication passes.
    req.flash('success', 'Welcome Back!')
    const redirectUrl = req.session.returnTo || '/campgrounds'          //redirects you to the page you were at before logging in or campground
    delete req.session.returnTo;                                        //deletes the saved returning page in session
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {                    //logs out user
    req.logout(req.user, err => {
        if (err) return next(err);
        req.flash('success', 'Goodbye!')
        res.redirect('/campgrounds');
    });
}