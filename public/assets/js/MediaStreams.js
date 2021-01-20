export  async function VideoStream(callback){
    return await navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(callback)
}

export  async function AudioStream(callback){
    await navigator.mediaDevices.getUserMedia({video: false, audio: true})
        .then(callback)
}

export  async function SharedScreen(callback){
   await screenCapture()
       .then(callback)

}
function screenCapture(){
    if (navigator.getDisplayMedia) {
        return navigator.getDisplayMedia({video: true});
    } else if (navigator.mediaDevices.getDisplayMedia) {
        return navigator.mediaDevices.getDisplayMedia({video: true});
    } else {
        return navigator.mediaDevices.getUserMedia({video: {mediaSource: 'screen'}});
    }
}