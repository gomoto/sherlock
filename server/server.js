require('dotenv').config();

var bodyParser = require('body-parser');         // pull information from HTML POST (express4)
var express = require('express');
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var morgan = require('morgan');
var path = require('path');
var stormpath = require('express-stormpath');
var winston = require('winston');

var indexHtml = path.join(process.cwd(), 'index.html');

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
  web: {
    me: {
      expand: {
        customData: true
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
