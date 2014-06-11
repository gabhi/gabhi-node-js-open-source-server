module.exports = function(app) {

    app.get("/", function(req, res) {
        res.send("Your Awsome Node js server is running!");
    });
};