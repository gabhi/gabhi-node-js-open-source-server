var config = require('nconf').argv().env().file({
    file: './config/app_config.json'
});
var PROFILER = config.get("PROFILER");
require('look').start(PROFILER.PORT, PROFILER.HOST);
// Include the cluster module
var cluster = require('cluster');
var i18n = require("i18n");
i18n.configure({
    locales: ['en', 'fr'],
    directory: __dirname + '/locales'
});
i18n.setLocale('en');

var greeting = i18n.__('Hello');
console.log(greeting);

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


    require("./routes")(app);
    require("./global_settings")(app);

    // Bind to a port
    app.listen(port);
    logger.debug("listening on port " + port);
}