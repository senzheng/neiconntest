// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;
var LinkedinStrategy = require('passport-linkedin-oauth2').Strategy;
//npm install passport-linkedin-oauth2

// load up the user model
var User       = require('../app/models/user');
var event      = require('../app/models/event');
var Message    = require('../app/models/message');

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // all is well, return user
                else
                    console.log(user);
                    return done(null, user);
            });
        });

    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            // if the user is not already logged in:
            if (!req.user) {
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        // create the user
                        var newUser            = new User();

                        newUser.local.email    = email;
                        newUser.local.password = newUser.generateHash(password);

                        newUser.save(function(err) {
                            if (err)
                                return done(err);

                            return done(null, newUser);
                        });
                    }

                });
            // if the user is logged in but has no local account...
            } else if ( !req.user.local.email ) {
                // ...presumably they're trying to connect a local account
                // BUT let's check if the email used to connect a local account is being used by another user
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    if (err)
                        return done(err);
                    
                    if (user) {
                        return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                        // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                    } else {
                        var user = req.user;
                        user.local.email = email;
                        user.local.password = user.generateHash(password);
                        user.save(function (err) {
                            if (err)
                                return done(err);
                            
                            return done(null,user);
                        });
                    }
                });
            } else {
                // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                return done(null, req.user);
            }

        });

    }));

    // =========================================================================
    // Linkedin ================================================================
    // =========================================================================
    
    passport.use(new LinkedinStrategy({

        clientID        : configAuth.linkedinAuth.clientID,
        clientSecret    : configAuth.linkedinAuth.clientSecret,
        callbackURL     : configAuth.linkedinAuth.callbackURL,
        scope: ['r_emailaddress', 'r_basicprofile'],
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {
         console.log(profile);
        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'linkedin.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.linkedin.token) {
                            user.linkedin.token = token;
                            user.linkedin.email = (profile.emails[0].value || '').toLowerCase();
                            user.save(function(err) {
                                if (err)
                                    return done(err);
                                    
                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        var newUser            = new User();

                        newUser.linkedin.id    = profile.id;
                        newUser.linkedin.token = token;
                        newUser.linkedin.email = (profile.emails[0].value || '').toLowerCase();
                        newUser.save(function(err) {
                            if (err)
                                return done(err);
                                
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session
                user.Linkedin.id    = profile.id;
                user.Linkedin.email = (profile.emails[0].value || '').toLowerCase();
               
                user.save(function(err) {
                    if (err)
                        return done(err);
                        
                    return done(null, user);
                });

            }
        });

    }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields   : ['id','name', 'gender','about','email', 'displayName','profileUrl','photos'],
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {
         console.log(profile);
        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                User.findOne({ '_id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                        console.log("asdf" + user);
                    if (user) {
                         console.log("asdff" + user);
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.facebook.token) {
                            user.facebook.token = token;
                            user._id = profile.id;
                            user.facebook.id    = profile.id;
                            user.facebook.token = token;
                            user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                            user.facebook.givenName = profile.name.givenName;
                            user.facebook.familyName = profile.name.familyName;
                            user.facebook.gender = profile.gender;
                            user.facebook.photo = profile.photos[0].value;
                            user.facebook.email = (profile.emails[0].value || '').toLowerCase();
                        }

                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        console.log("asdfff" + user);
                        var newUser            = new User();
                        var newEvent           = new event();
                        var newMessage         = new Message();
                        newUser._id = profile.id;
                        newUser.facebook.id    = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.facebook.givenName = profile.name.givenName;
                        newUser.facebook.familyName = profile.name.familyName;
                        newUser.facebook.gender = profile.gender;
                        newUser.facebook.photo = profile.photos[0].value;
                        newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();
                        newUser.neiconn.language = null;
                        newUser.neiconn.birth.day = null;
                        newUser.neiconn.birth.month = null;
                        newUser.neiconn.birth.year = null;
                        newUser.neiconn.phone = null;
                        newUser.neiconn.location = null;
                        newUser.neiconn.about = null;
                        newUser.neiconn.school = null;
                        newUser.neiconn.work = null;
                        newUser.neiconn.reviews = [];
                        newUser.neiconn.rating = [ 4.5, 4.5, 4.5, 4.5];
                        newUser.neiconn.ratingtotal = 4.5;
                        newUser.neiconn.firstName = profile.name.givenName;
                        newUser.neiconn.lastName = profile.name.familyName;


                        newMessage.inbox = [];
                        newMessage.outbox = [];
                        newMessage._id = profile.id;

                        newMessage.save(function(err){
                            if(err) throw err;

                            console.log("Message box is assigned!");
                        });
                        // event as below:

                        /*
                        newEvent._id = "00000000001";
                        newEvent.user._id = profile.id;
                        newEvent.user.photo = "images/owner1.jpg";
                        newEvent.user.role = "host",
                        newEvent.user.name = profile.name.givenName + ' ' + profile.name.familyName;
                        newEvent.content.title = "Grab Point",
                        newEvent.content.category = "Eat & Drink",
                        newEvent.content.date = "2016 3 4",
                        newEvent.content.duration = 4;
                        newEvent.content.rule[0] = "Be Happy";
                        newEvent.content.rule[1] = "Apporiate Clothing";
                        newEvent.content.rule[2] = "Be gentle";
                        newEvent.content.location.address = "2000 wolfe road , sunnyVale, CA, 95035";
                        newEvent.content.location.lon = "-122.013425";
                        newEvent.content.location.lat = "37.383731";
                        newEvent.content.photo = "images/sea.jpg";
                        newEvent.rating = 4.7;
                        newEvent.category = "upcoming";

                        newEvent.save(function (err) {
                            // body...
                            if (err)
                                return done(err);

                            return done(null, newEvent);
                        });
                       */
                        newUser.save(function(err) {
                            if (err)
                                return done(err);
                                
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                console.log("asdfffff" + user);
                var user            = req.user; // pull the user out of the session
                user._id            = profile.id;
                user.facebook.id    = profile.id;
                user.facebook.token = token;
                user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.givenName = profile.name.givenName;
                user.facebook.familyName = profile.name.familyName;
                user.facebook.gender = profile.gender;
                user.facebook.photo = profile.photos[0].value;
                user.facebook.email = (profile.emails[0].value || '').toLowerCase();
                
                
                return done(null, user);
            }
        });

    }));

    // =========================================================================
    // TWITTER =================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({

        consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, tokenSecret, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.twitter.token) {
                            user.twitter.token       = token;
                            user.twitter.username    = profile.username;
                            user.twitter.displayName = profile.displayName;

                            user.save(function(err) {
                                if (err)
                                    return done(err);
                                    
                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        var newUser                 = new User();

                        newUser.twitter.id          = profile.id;
                        newUser.twitter.token       = token;
                        newUser.twitter.username    = profile.username;
                        newUser.twitter.displayName = profile.displayName;

                        newUser.save(function(err) {
                            if (err)
                                return done(err);
                                
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user                 = req.user; // pull the user out of the session

                user.twitter.id          = profile.id;
                user.twitter.token       = token;
                user.twitter.username    = profile.username;
                user.twitter.displayName = profile.displayName;

                user.save(function(err) {
                    if (err)
                        return done(err);
                        
                    return done(null, user);
                });
            }

        });

    }));

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'google.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.google.token) {
                            user.google.token = token;
                            user.google.name  = profile.displayName;
                            user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                            user.save(function(err) {
                                if (err)
                                    return done(err);
                                    
                                return done(null, user);
                            });
                        }

                        return done(null, user);
                    } else {
                        var newUser          = new User();

                        newUser.google.id    = profile.id;
                        newUser.google.token = token;
                        newUser.google.name  = profile.displayName;
                        newUser.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                        newUser.save(function(err) {
                            if (err)
                                return done(err);
                                
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user               = req.user; // pull the user out of the session

                user.google.id    = profile.id;
                user.google.token = token;
                user.google.name  = profile.displayName;
                user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                user.save(function(err) {
                    if (err)
                        return done(err);
                        
                    return done(null, user);
                });

            }

        });

    }));

};
