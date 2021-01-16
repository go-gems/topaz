# Topaz

[![Join the chat at https://gitter.im/decima-topaz/community](https://badges.gitter.im/decima-topaz/community.svg)](https://gitter.im/decima-topaz/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

based on [kolson25/WebRTC-Multi-Peer-Video-Audio](https://github.com/kolson25/WebRTC-Multi-Peer-Video-Audio), this project aims to try webrtc.
## Demo

You can try it at [topaz.h91.co](https://topaz.h91.co)

## Getting started

To run the project, just copy the docker-compose.yml in a folder and run the following command:

```
docker-compose up -d
```

To test it, you have to go to [https://localhost:3000](https://localhost:3000). 

Be sure that you use SSL (via reverse proxy for example) or you wont be able to get access to your camera.

For development I used [ngrok](https://ngrok.com/) which is reliable for https and even testing with remote people :-)

## Config

You can copy and set up your own config.json.dist.
For now, configuration works only with chat plugins.

## Plugins

### Create a plugin
To create a plugin, you will need to create a js file with the following structure:
```js
module.exports = function (config, formatResponse) {
    return {
        supports(username, avatar, message) {
            // return true if the plugin should be used.
            // for example : return message.startsWith("/hello")
            return true
        },
        transform(username, avatar, message) {
            if(config.some_random_config=="SOME VALUE"){
                console.log("do something")
            }
            // should return a formatResponse in order to be processable.
            return formatResponse(message, avatar,  message )
        },
    };
};
```
- Supports is a function used to check if the plugin should manipulate the message. 
It can be useful to detect that someone has been quoted, or if the string starts/contains something.

- Transform takes a username, avatar, message and will apply transformation if supports returns true. 
you can use the formatResponse to return the good format or you can do manually using the following syntax:
```json
{
    "author": "username",
    "avatar": {
        "avatar": "bear",
        "color": "red", 
        "image": "<svg.../>"
    },
    "message": "SOME MESSAGE"
} 

```

- To use the config, you will need to read more about enabling a plugin,

### Enable a plugin

In order to enable a plugin add it to the _plugins.js file:
example : 
```js
module.exports= {
 me:   "./plugins/me.js",
 giphy:   "./plugins/giphy.js",
 pluginName: "./path/to/file.js"
}
```

The pluginName is used in order to retrieve configuration which is stored in config.json.
```json
{
  "plugins": {
    "giphy": {
      "api_key": "GIPHY API KEY"
    },
    "pluginName": {
      "some_random_config": "SOME_VALUE"
    }
  }
}
```


## Screen Sharing

Screen sharing is in early development, to give it a try, start a new tab on you browser and go to `/screen.html` I tried to merge both, but seems a little bit complicated for me, because I don't feel confortble with Javascript :).

