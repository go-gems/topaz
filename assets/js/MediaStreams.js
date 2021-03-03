export async function VideoStream(callback) {
    const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
    callback(stream)
}

export async function AudioStream(callback) {
    const stream = await navigator.mediaDevices.getUserMedia({video: false, audio: true})
    callback(stream)
}

export async function SharedScreen(callback) {
    callback(await screenCapture())

}

export async function getVideoInputList() {
    let content = []
    await navigator
        .mediaDevices
        .enumerateDevices()
        .then(devices => {
            for (let device of devices) {
                switch (device.kind) {
                    case "videoinput":
                        content.push(device);
                        break;
                    default:
                        break
                }
            }
        })
    return content;
}

export async function getAudioInputList() {
    let content = []
    await navigator
        .mediaDevices
        .enumerateDevices()
        .then(devices => {
            for (let device of devices) {
                switch (device.kind) {
                    case "audioinput":
                        content.push(device);
                        break;
                    default:
                        break
                }
            }
        })
    return content;
}

function screenCapture() {
    if (navigator.getDisplayMedia) {
        return navigator.getDisplayMedia({video: true});
    } else if (navigator.mediaDevices.getDisplayMedia) {
        return navigator.mediaDevices.getDisplayMedia({video: true});
    } else {
        return navigator.mediaDevices.getUserMedia({video: {mediaSource: 'screen'}});
    }
}