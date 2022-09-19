const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true                            //unique email for each user
    }
});
UserSchema.plugin(passportLocalMongoose);       //will add username and password (both with hash and salt) to userSchema and make sure they are unique(no duplicates) and additional methods from package

module.exports = mongoose.model('User', UserSchema)
