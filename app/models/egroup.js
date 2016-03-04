// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var groupSchema = mongoose.Schema({
    _id              : String,  //event_id : one event should have one chatting group

    event            : {
            event_title   : String,
            event_picture : String,
            event_date    : String,
            event_time    : String,
            event_duation : Number,
            event_amount  : Number
    },                         // event details:  this is for event details 
    member          : [{
           member_id : String,
           member_photo : String
     }], // the length of the memeber array is restricted by the event amout


     // content should be localstorage, at this time it is for testing purpose
     contentStoage   : [{
            member_id : String,
            member_content    : String
     }]



});

// generating a hash
groupSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
groupSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Group', groupSchema);
