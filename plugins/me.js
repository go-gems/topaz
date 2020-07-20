
module.exports = function (config, formatResponse) {
    return {
        supports(username, avatar, message) {
            return (message.startsWith("/me "))
        },
        transform(username, avatar, message) {
            message = message.replace("/me ", "")
            avatar.image = "";
            return formatResponse("", avatar, "<b>" + username + " " + message + "</b>")
        },
    };
};

