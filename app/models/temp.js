// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var tempSchema = mongoose.Schema({
    _id              : String,  //event_id : one event should have one chatting group
    host             : {
           name   : String,
           id     : String,
           applicants : Number
    },               // host details:  this is for host
    applicants          : [{
            applicant_id : String,
            applicant_photo : String,
            applicant_name : String
     }], // the length of the memeber array is restricted by the event amout


});

// generating a hash
tempSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
tempSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Temp', tempSchema);
