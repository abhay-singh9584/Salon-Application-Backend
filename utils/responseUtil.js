const sendResponse = (res, statusCode, status, message, data = null) => {
    const response = {
        status,
        message,
    };

    if (data) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

module.exports = sendResponse;