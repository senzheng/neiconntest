// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'        : '234036336936602', // your App ID
        'clientSecret'    : 'f756796a2460dd523e37c1f409e136fc', // your App Secret
        'callbackURL'     : 'http://www.neiconn.com/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'        : 'your-consumer-key-here',
        'consumerSecret'     : 'your-client-secret-here',
        'callbackURL'        : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'         : 'your-secret-clientID-here',
        'clientSecret'     : 'your-client-secret-here',
        'callbackURL'      : 'http://localhost:8080/auth/google/callback'
    },

    'linkedinAuth' : {
        'clientID'         : '75e0z0nvqlowdv',
        'clientSecret'     : 'H2LlnRj0FzSU0ka9',
        'callbackURL'      : 'http://localhost:8080/auth/linkedin/callback'
    }

};
