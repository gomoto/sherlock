var cloudant = require('./cloudant');
var config = require('./config');
var stormpath = require('express-stormpath');

module.exports = {
  // insert Stormpath middleware into the specified express app
  init: (app) => {
    return stormpath.init(app, {
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
        // asynchronously create database
        cloudant.createDatabase(req.user);
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
          view: config.indexHtml
        }
      }
    });
  }
};
