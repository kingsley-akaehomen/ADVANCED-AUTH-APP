const errorHandler = (err, req, res, next) => {

    const statusCode = res.statusCode ? res.statusCode : 500;

    const errorDetails = {
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        status: statusCode,
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : Null
    };

    console.log(errorDetails)
    res.status(statusCode);
    res.json(errorDetails)
};

module.exports = errorHandler;