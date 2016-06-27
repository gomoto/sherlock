var Cloudant = require('cloudant');

var cloudant = Cloudant({
  account: process.env.CLOUDANT_ACCOUNT,
  password: process.env.CLOUDANT_PASSWORD
}, (error, cloudant) => {
  if (error) return console.error('Failed to initialize Cloudant: ' + error.message);
  console.log('Cloudant initialized');
});

cloudant.set_cors({
  enable_cors: true,
  allow_credentials: true,
  origins: [ process.env.DOMAIN ]
}, (error, data) => {
  if (error) return console.error(error);
  console.log('Cloudant CORS set');
});

module.exports = {
  // Create Cloudant database for the specified Stormpath user
  createDatabase: (user) => {
    // create database
    cloudant.db.create(user.username, (error) => {
      if (error) return console.error('Error creating Cloudant database for ' + user.username, error);
      console.log('Created Cloudant database for ' + user.username);
      // generate api key
      cloudant.generate_api_key((error, api) => {
        if (error) return console.error('Error generating Cloudant API key for ' + user.username, error);
        console.log('Generated Cloudant API key for ' + user.username);
        // set database security for api key
        var security = {};
        security['nobody'] = [];
        security[api.key] = ['_replicator'];
        var db = cloudant.db.use(user.username);
        db.set_security(security, (error, result) => {
          if (error) return console.error('Error setting Cloudant security for ' + user.username, error);
          console.log('Set Cloudant security for ' + user.username);
          // save api key to stormpath custom data
          user.customData.cloudant_key = api.key;
          user.customData.cloudant_password = api.password;
          user.customData.save((error) => {
            if (error) return console.error('Error saving Cloudant API key to Stormpath customData for ' + user.username, error);
            console.log('Saved Cloudant API key to Stormpath customData');
          });
        });
      });
    });
  }
};
