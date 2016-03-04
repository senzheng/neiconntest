// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    _id              : String,
    local            : {
        email        : String,
        password     : String
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String,
        gender       : String,
        photo        : String,
        familyName   : String,
        givenName    : String,

    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    linkedin         : {
        id           : String,
        token        : String,
        email        : String
    },
    neiconn          :{
        language     : String,
        school       : String,
        work         : String,
        about        : String,
        firstName    : String,
        lastName     : String,
        birth        : {
                        year: String,
                        month: String,
                        day: String
                       }, 
        phone        : String,
        location     : String,
        recommend    : [String],
        age          : { type:Number ,  min: 16 , max: 100},
        enrollDate   : { type:Date , default: Date.now},
        reviews      : [{ 
                         reviewer: String, // the image
                         category: String, // the category
                         content : String, // the content
                       }],

        rating       : [
                         {type : String, value: Number}
                       ],
        ratingtotal : Number

    },


});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
