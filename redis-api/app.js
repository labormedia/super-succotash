'use strict';
const fs = require('fs')
var SwaggerExpress = require('swagger-express-mw');
const https = require('https')
var app = require('express')();
const auth = require('./api/helpers/auth')
module.exports = app; // for testing

var config = {
  appRoot: __dirname, // required config
  swaggerSecurityHandlers : {
    Bearer: auth.verifyToken
  }
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  swaggerExpress.register(app);

  var port = process.env.PORT || 10010;
  app.listen(port, function () {
    console.log('Insecure server started # %s!', port);
  });
  var sslport = 10443;
  console.log('dirname', __dirname)
  https.createServer({
    key: fs.readFileSync('../certs/key.pem'),
    cert: fs.readFileSync('../certs/cert.pem'),
    passphrase: 'simplephrase'
  }, app).listen(sslport, function () {
    console.log('Secure server started # %s!', sslport);
  });


  if (swaggerExpress.runner.swagger.paths['/api/v1/ping']) {
    console.log('try :\ncurl https://127.0.0.1:' + port + '/api/v1/ping');
  }
});

