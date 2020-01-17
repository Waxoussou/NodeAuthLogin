module.exports = {
    showPath: function (req, res, next) {
        console.log("path : ", req.url)
        return next();
    },
    showReqParams: function (req, res, next) {
        if (req.params) {
            // console.log({ params: req.params });
        }
        next();
    },
    showBody: function (req, res, next) {
        if (req.body) {
            console.log("HELLO :", req.body)
        }
    }
}