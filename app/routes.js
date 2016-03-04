 var User       = require('../app/models/user');
 var Event      = require('../app/models/event');
 var Group      = require('../app/models/egroup');
 var Temp       = require('../app/models/temp');
 var Message    = require('../app/models/message');


var nodemailer = require("nodemailer");


var smtpTransport = nodemailer.createTransport({
   service : "Gmail",
   auth : {
       user: "sen.zheng@neiconn.com",
       pass: "xethcotnleacuewx"
   }
});
 var multer  =   require('multer');
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now()+file.originalname);
  }
});
var upload = multer({ storage : storage}).single('userPhoto');

function showResult(result) {
    document.getElementById('latitude').value = result.geometry.location.lat();
    document.getElementById('longitude').value = result.geometry.location.lng();
}

function getLatitudeLongitude(callback, address) {
    // If adress is not supplied, use default value 'Ferrol, Galicia, Spain'
    address = address || 'Ferrol, Galicia, Spain';
    // Initialize the Geocoder
    geocoder = new google.maps.Geocoder();
    if (geocoder) {
        geocoder.geocode({
            'address': address
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                callback(results[0]);
            }
        });
    }
}

function getEvent(event, id){
    for(var i = 0; i < event.length; i++){
        if(event[i]._id == id){
            return event[i];
        }
    }

    return null;
}


function check_join(applicants, id){
    for(var i = 0; i < applicants.length; i++){
        if(applicants[i].applicant_id == id){
            return true;
        }
    }

    return false;
}

module.exports = function(app, passport) {
   
// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('main.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/applications',isLoggedIn ,function(req, res){

            Temp.find({"host.id" : req.user._id},{},function(err, temp){
                res.render("applications.ejs", {
                        user: req.user,
                        temps: temp
                    });
            })
        
    });
   

   app.post('/result', function(req,res){
       
      Event.find({},{},function (err, events){
        console.log(events);
        req.session.events = events;
        res.render('search-result.ejs',{
            event : events
        });
       
      })

   });

   app.post('/event', isLoggedIn_event,function(req,res){
       
     console.log(req.body.id);
     var id = req.body.id;
     var events = getEvent(req.session.events, id);
      res.render('event.ejs',{
            event : events,
            user  : req.user
        });
   });
    
   app.get('/chat', isLoggedIn ,function(req,res){
      res.render('chat.ejs', {
        user : req.user
      });
   })

   app.post('/apply', isLoggedIn, function(req, res){
       console.log(req.body);
       console.log(req.user._id);

       Temp.findById(req.body.event_id , function(err, list){
          if(err) throw err;
           
         if(list.host.id == req.user._id){
            res.send("You can't Join This Event");
         }else if(list.applicants.length >= list.host.applicants){
            res.send("Sorry The Number is fully");
         }else if(check_join(list.applicants, req.user._id)){
            res.send("You have already applied this event!")
         }else {

           list.applicants.push({"applicant_id" : req.user._id, "applicant_photo" : req.user.facebook.photo, "applicant_name" : req.user.neiconn.firstname});
           list.save(function(err){
            if(err) throw err;

            console.log('apply successfully');
               smtpTransport.sendMail({
                        from: "Neiconn <sen.zheng@neiconn.com>", // sender address
                        to: " < " + req.user.facebook.email + ">", // comma separated list of receivers
                        subject: "Request Confirm", // Subject line
                        //text: "Hello world ✔",
                        html: "<h3>The event host has already received your request. Please be patient! Give the host little more time to process your request.</h3>"// plaintext body
                        }, function(error, response){
                   if(error){
                       console.log(error);
                   }else{
                       console.log("Message sent");
                   }
                });


               smtpTransport.sendMail({
                        from: "Neiconn <sen.zheng@neiconn.com>", // sender address
                        to: " < " + req.body.event_host+ ">", // comma separated list of receivers
                        subject: "Request Confirm", // Subject line
                        //text: "Hello world ✔",
                        html: "<h3>"+ req.user.facebook.givenName +" wants to join the event:"+ req.body.event_name +"</h3>" // plaintext body
                        }, function(error, response){
                   if(error){
                       console.log(error);
                   }else{
                       console.log("Message sent");
                   }
                });
            res.redirect("/mypage");
          });
         }



       });
   });
   app.get('/getGroup', isLoggedIn,function(req, res){
        Group.find({"member.member_id" : req.user._id },{}, function (err, group){
            res.end(JSON.stringify(group));
        })
   });

    //Upload user info
    app.get('/editprofile', isLoggedIn, function(req, res) {
        res.render('profile-edit.ejs',{
            user : req.user
        });
    });

    app.post('/accept' ,isLoggedIn, function(req,res){

    });

    app.post('/sendMessage', isLoggedIn, function(req, res) {
        Message.findById(req.body.sender_id, function (err, messager){
           if (err) throw err;

           messager.outbox.push({"reciever_id" : req.body.reciever_id, "reciever_name" : req.body.reciever_name, "content" : req.body.content});
           messager.save(function (err) {
                if(err) throw err;

                console.log("Message saved!");
           });
        });

        Message.findById(req.body.reciever_id, function (err, messager){
          messager.inbox.push({"sender_id" : req.body.sender_id, "sender_name" : req.body.sender_name, "content" : req.body.content});
          messager.save(function (err) {
                if(err) throw err;

                console.log("Message sent!");
           });
        })

          
        res.redirect('/event');
    });


    app.post('/update_user', isLoggedIn, function(req, res){
        

        var id = req.body.id;
        
        User.findById(id, function(err, user) {
            if (err) throw err;
             console.log(user);
             user.neiconn.work = req.body.work;
             user.neiconn.birth.month = req.body.month;
             user.neiconn.birth.year  = req.body.year;
             user.neiconn.birth.day = req.body.day;
             user.neiconn.phone = req.body.phone;
             user.neiconn.location = req.body.location;
             user.neiconn.school = req.body.school;
             user.neiconn.about = req.body.about;
             user.neiconn.language = req.body.language;
            
             user.save(function(err){
                if (err) throw err;
                
                console.log('user successfully updated!');
                res.redirect("/mypage");
             });
        });

       
    });
    
    //get event
    
    app.post('/createevent', isLoggedIn, function(req, res){
        
        
        var id = req.body.id;
        

        Event.findById(id, function(err, event) {
            if(err) throw err;

            if(event){
                res.send("Sorry! Please create a valid activity");
            }else {

             var newEvent  = new Event();
             var newTemp   = new Temp();
             var newGroup  = new Group();
             console.log(newEvent);
             newEvent._id = Date.now();
             newEvent.category = "upcoming";
             newEvent.content.time = req.body.time;
             newEvent.content.duration  = req.body.duration;
             newEvent.content.date = req.body.date;
             newEvent.content.category = req.body.category;
             newEvent.content.title = req.body.title;
             newEvent.content.photo[0] = "images/sea.jpg";
             newEvent.content.price = req.body.price;
             newEvent.content.total_attendees = req.body.total_attendees;
             newEvent.user.email = req.body.email;
             newEvent.content.about = req.body.about;
             newEvent.content.rule[0] = req.body.rule;
             newEvent.content.location.address = req.body.address;
             newEvent.content.location.lat = req.body.lat;
             newEvent.content.location.lon = req.body.lon;
             newEvent.content.language = req.body.language;
             newEvent.content.venue = req.body.venue;
             newEvent.content.provision = req.body.provision;
             newEvent.user.reviews = req.body.reviews;
             newEvent.user.rating = req.body.rating;
             newEvent.user.name = req.body.name;
             newEvent.user.role = "host"; //host must
             newEvent.user.photo = req.body.photo,
             newEvent.user._id = id;
             
             newGroup._id = newEvent._id;
             newGroup.event.event_picture = newEvent.content.photo[0];
             newGroup.event.event_date = newEvent.content.date;
             newGroup.event.event_time = newEvent.content.time;
             newGroup.event.event_duration = newEvent.content.duration;
             newGroup.event.event_amount = newEvent.content.total_attendees;
             newGroup.event.event_title  = newEvent.content.title;
             newGroup.member.push({"member_id" : newEvent.user._id, "member_photo": newEvent.user.photo});
             newGroup.contentStoage.push({"member_id" : newEvent.user._id, "member_content": "welcome to join this group"});

             newTemp._id = newEvent._id;
             newTemp.host.name = newEvent.user.name;
             newTemp.host.id   = newEvent.user._id;
             newTemp.host.applicants = 2 * newEvent.content.total_attendees;
             newTemp.applicants = [];
             
             newTemp.save(function(err){
                if(err) throw err;
                console.log('applicants queue created');
             });


             newGroup.save(function(err){
                if(err) throw err;

                console.log('group created!');
             });

             newEvent.save(function(err){
                if (err) throw err;
                
                console.log('user successfully updated!');
                res.redirect("/mypage");
             });
            }

        });

       
    });
   
    app.post('/api/photo',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
    

    console.log(req.file.filename);
        
    });
});

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        app.get('/home', function (req, res) {

            res.render('home.ejs', {message: req.flash('open Home') });
            // body...
        })

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/mypage',
                failureRedirect : '/'
            }));




// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/mypage',
                failureRedirect : '/'
            }));


// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/');
        });
    });


// General Pages
    app.get('/main', function (req, res) {

            res.render('main.ejs');
            // body...
        });

    app.get('/mypage', isLoggedIn, function(req, res) {
        res.render('mypage.ejs', {
            user : req.user
        });
    });
   
    app.get('/post_event', isLoggedIn, function(req, res) {
        res.render('post_event.ejs', {
            user : req.user
        });
    });
};



// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.send("Please sign up and log in");
}

function isLoggedIn_event(req, res, next) {
    if (req.isAuthenticated())
        return next();

    console.log(req.body.id);
     var id = req.body.id;
     var events = getEvent(req.session.events, id);
      res.render('event.ejs',{
            event : events,
            user  : null
        });
}
