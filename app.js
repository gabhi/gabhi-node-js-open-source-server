// Include the cluster module
var cluster = require('cluster');
var config = require('nconf').argv().env().file({
    file: './config/app_config.json'
});

var port = process.env.PORT || config.get("PORT");
var express = require('express');
var cluster_mode_enabled = config.get("CLUSTER_MODE");


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
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();

    });

    // Code to run if we're in a worker process
} else {
    var app = express();
    require("./routes")(app);

    // Bind to a port
    app.listen(port);
    console.log("listening on port " + port);
}