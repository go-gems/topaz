module.exports = function (config, formatResponse) {
    return {
        supports(username, avatar, message) {
            return (message.startsWith("/rot13 "))
        },
        transform(username, avatar, message) {
            message = message.replace("/rot13 ", "")
            return formatResponse(username, avatar, rot13(message))
        },
    };
};

function rot13(str) {
    var input = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var output = 'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm';
    var index = x => input.indexOf(x);
    var translate = x => index(x) > -1 ? output[index(x)] : x;
    return str.split('').map(translate).join('');
}

