require('dotenv').config();

var bodyParser = require('body-parser');         // pull information from HTML POST (express4)
var Cloudant = require('cloudant');
var express = require('express');
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var morgan = require('morgan');
var path = require('path');
var stormpath = require('express-stormpath');
var winston = require('winston');

var indexHtml = path.join(process.cwd(), 'index.html');

var cloudant = Cloudant({
  account: process.env.CLOUDANT_ACCOUNT,
  password: process.env.CLOUDANT_PASSWORD
}, (error, cloudant) => {
  if (error) {
    return console.error('Failed to initialize Cloudant: ' + error.message);
  }
  console.log('Cloudant initialized');
});

var app = express();

app.use(bodyParser.urlencoded({ extended : 'true' }));          // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(express.static(process.cwd()));                         // set the static files location
app.use(morgan('dev'));

app.use(stormpath.init(app, {
  application: {
    href: process.env.STORMPATH_HREF
  },
  client: {
    apiKey: {
      id: process.env.STORMPATH_ID,
      secret: process.env.STORMPATH_SECRET
    }
  },
  debug: 'info',
  expand: {
    customData: true,
  },
  postRegistrationHandler: (account, req, res, next) => {

    // create database
    cloudant.db.create(account.username, function(error) {
      if (error) {
        console.error('Error creating Cloudant database for ' + account.username, error);
        return;
      }
      console.log('Created Cloudant database for ' + account.username);
      // generate api key
      cloudant.generate_api_key(function(error, api) {
        if (error) {
          console.error('Error generating Cloudant API key for ' + account.username, error);
        }
        console.log('Generated Cloudant API key for ' + account.username);
        // set database security for api key
        var security = {};
        security['nobody'] = [];
        security[api.key] = ['_replicator'];
        var db = cloudant.db.use(account.username);
        db.set_security(security, function(error, result) {
          if (error) {
            console.error('Error setting Cloudant security for ' + account.username, error);
            return;
          }
          console.log('Set Cloudant security for ' + account.username);
          // save api key to stormpath custom data
          req.user.customData.cloudant_key = api.key;
          req.user.customData.cloudant_password = api.password;
          req.user.customData.save(function (error) {
            if (error) {
              console.error('Error saving Cloudant API key to Stormpath customData for ' + account.username, error);
            }
            console.log('Saved Cloudant API key to Stormpath customData');
            // DONE!
          });
        });
      });
    });

    // Don't wait for database to be created
    next();
  },
  web: {
    me: {
      expand: {
        customData: true
      }
    },
    register: {
      form: {
        fields: {
          givenName: {
            enabled: false
          },
          surname: {
            enabled: false
          },
          username: {
            enabled: true,
            label: 'Username',
            name: 'username',
            placeholder: '',
            required: true,
            type: 'text'
          }
        },
        fieldOrder: [ 'username', 'email', 'password' ]
      }
    },
    spa: {
      enabled: true,
      view: indexHtml
    }
  }
}));

// Restricted routes should return a 404
app.route('/:url(client|server)/*').get(function(req, res) {
  res.sendStatus(404);
});

// All other routes should redirect to index.html
app.route('/*').get(function(req, res) {
  res.sendFile(indexHtml);
});

// Stormpath is ready to start authenticating users
app.on('stormpath.ready', function() {

  console.log('Stormpath ready');

  var port = process.env.PORT || 9000;
  var ip = process.env.IP || '0.0.0.0';

  app.listen(port, ip, function() {
    console.log('Listening at http://%s:%s', ip, port);
  });

});
