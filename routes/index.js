var sample_route_impl = require("./sample_route_impl");

module.exports = function(app) {

    app.get("/", sample_route_impl.getRoot);
};