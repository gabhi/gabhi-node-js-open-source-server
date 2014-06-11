var config = require('nconf').argv().env().file({
    file: './config/app_config.json'
});
var PROFILER = config.get("PROFILER");
var extras = require('express-extras');

require('look').start(PROFILER.PORT, PROFILER.HOST);
// Include the cluster module
var cluster = require('cluster');


var port = process.env.PORT || config.get("PORT");
var express = require('express');
var cluster_mode_enabled = config.get("CLUSTER_MODE");
var log4js = require('log4js');
var logger = log4js.getLogger();

log4js.configure('./config/log4js.json', {});


// Code to run if we're in the master process
if (cluster.isMaster && cluster_mode_enabled) {
    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function(worker) {

        // Replace the dead worker, we're not sentimental
        logger.debug('Worker ' + worker.id + ' died :(');
        cluster.fork();

    });

    // Code to run if we're in a worker process
} else {
    var app = express();

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






    require("./routes")(app);

    // Bind to a port
    app.listen(port);
    logger.debug("listening on port " + port);
}