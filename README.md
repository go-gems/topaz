# Topaz

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

## Screen Sharing

Screen sharing is in early development, to give it a try, start a new tab on you browser and go to `/screen.html` I tried to merge both, but seems a little bit complicated for me, because I don't feel confortble with Javascript :).

