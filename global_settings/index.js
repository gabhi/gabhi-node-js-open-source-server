var config = require('nconf').argv().env().file({
    file: './config/app_config.json'
});
var extras = require('express-extras');

module.exports = function(app) {
    //Enable CORS
    app.all('*', function(req, res, next) {
        if (!req.get('Origin')) return next();
        var ACCESS_CONTROL = config.get("ACCESS_CONTROL");
        // use "*" here to accept any origin
        res.set('Access-Control-Allow-Origin', ACCESS_CONTROL.ALLOW_ORIGIN);
        res.set('Access-Control-Allow-Methods', ACCESS_CONTROL.ALLOW_METHODS);
        res.set('Access-Control-Allow-Headers', ACCESS_CONTROL.ALLOW_HEADERS);

        next();
    });
    process.env.NODE_ENV = config.get("NODE_ENV");
    app.use(extras.throttle());
    app.use(extras.throttle(config.get("THROTTLESETTINGS")));

};