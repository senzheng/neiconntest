var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');


var messageSchema = mongoose.Schema({
    _id              : String,  //user_id
    inbox            : [{
          sender_id  : String,
          sender_name : String,
          content     : String,
          timestamp   : { type :Date , default : Date.now }
    }],
    outbox           :[{
          reciever_id : String,
          reciever_name : String,
          content       : String,
          timestamp   : { type :Date , default : Date.now }
     }]
    
});

// generating a hash
messageSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
messageSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Message', messageSchema);
