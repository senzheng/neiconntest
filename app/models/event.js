var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var eventSchema = mongoose.Schema({
    _id             : String,  // Time + IP + UserID
    user            : {
        _id         : String,  // event host id and photo
        photo       : String,
        role        : String,
        name        : String,
        email       : String,   //host or attend
        reviews     : Number,
        rating      : Number
    },
    content         :{
        time        : Number,
        title       : String,
        category    : String,
        language    : String,
        venue       : String,
        provision   : String,
        about       : String,
        date        : String,
        duration    : Number, //number of hours
        price       : Number,
        total_attendees : Number,
        rule        : [
             String
            ],
         location   : {
                address       : String,
                lon           : String,
                lat           : String
         },
         photo      : [String] //the photo limit on 9 
    },
    category        : String   //status : Upcoming  History
});

// generating a hash
eventSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
eventSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Event', eventSchema);
