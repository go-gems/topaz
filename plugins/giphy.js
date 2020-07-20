const https = require('https');

module.exports = function (config, formatResponse) {
    return {
        supports(username, avatar, message) {
            console.log(message)
            return (message.startsWith("/giphy "))
        },
        async transform(username, avatar, message) {

            keyword = message.replace("/giphy ", "")
            keyword = encodeURIComponent(keyword)
            let url = `https://api.giphy.com/v1/gifs/search?api_key=${config.api_key}&q=${keyword}&limit=10&offset=0&rating=g&lang=en`

            let response = await getJSON(url);
            let result = response.data[Math.floor(Math.random() * response.data.length)]
            return formatResponse(username, avatar, `${message}<br/><img style="width:100%" src="${result.images.original.url}"/>`)
        },
    };
};

function getJSON(theUrl) {
    return new Promise((resolve, reject) => {
        https.get(theUrl, (response) => {
            let chunks_of_data = [];

            response.on('data', (fragments) => {
                chunks_of_data.push(fragments);
            });

            response.on('end', () => {
                let response_body = Buffer.concat(chunks_of_data);
                resolve(JSON.parse(response_body.toString()));
            });

            response.on('error', (error) => {
                reject(error);
            });
        });
    });

}