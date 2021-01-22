export default class PeerClient {
    videoEnabled = true
    audioEnabled = true
    screenSharingEnabled = false

    peerId
    htmlElement
    video
    videoStream
    audio
    screen
    screenStream
    audioStream
    calls = {}
    properties = {}
    callsBar

    constructor(peerId) {
        this.peerId = peerId
        this._initializeHTML()

    }

    showControls(e) {
        //use only on debug
        // e.setAttribute("controls", "controls")
    }

    _initializeHTML() {
        this.video = document.createElement('video');
        this.video.classList.add("video")
        this.showControls(this.video)
        this.screen = document.createElement('video');
        this.screen.classList.add("screen")
        this.showControls(this.screen)
        this.audio = document.createElement('audio');
        this.audio.classList.add("audio")

        this.showControls(this.audio)
        this.htmlElement = document.createElement('div');
        this.htmlElement.classList.add("peer");
        this.htmlElement.dataset.peerId = this.peerId;
        this.htmlElement.appendChild(this.video);
        this.htmlElement.appendChild(this.screen);
        this.htmlElement.appendChild(this.audio);
        this._callsBar_init()
        this.htmlElement.appendChild(this.callsBar)

    }

    _callsBar_init() {

        this.callsBar = document.createElement("div")
        /**setInterval(()=>{this.drawCallsBar()},2000);
         }
         drawCallsBar(){
        let audioState = this.audioEnabled?"AON":"AOFF";
        let videoState = this.videoEnabled?"VON":"VOFF";
        this.callsBar.innerHTML=`<span>${audioState}</span><span>${videoState}</span>`;**/
    }

    joinVideoStream(stream) {
        this.video.style.display = "block";
        this.videoStream = stream
        try {
            this.video.srcObject = this.videoStream;
        } catch (error) {
            this.video.src = window.URL.createObjectURL(this.videoStream);
        }

        this.video.autoplay = true;
        this.video.muted = true;
        this.video.playsinline = true;


    }

    joinScreenShareStream(stream, onClose) {
        this.screenStream = stream
        try {
            this.screen.srcObject = this.screenStream;
        } catch (error) {
            this.screen.src = window.URL.createObjectURL(this.videoStream);
        }

        this.screen.autoplay = true;
        this.screen.muted = false;
        this.screen.playsinline = true;
        this.toggleScreen(true)
        this.screenStream.getVideoTracks()[0].onended = () => {
            this.toggleScreen(false)
            onClose()

        };
    }

    joinAudioStream(stream) {
        this.audioStream = stream
        try {
            this.audio.srcObject = this.audioStream;
        } catch (error) {
            this.audio.src = window.URL.createObjectURL(this.audioStream);
        }

        this.audio.autoplay = true;
        this.audio.muted = false;
        this.audio.playsinline = true;
    }

    closeStream(type) {
        if (this.calls[type]) {
            this.calls[type].close()
            delete this.calls[type]
        }
    }

    toggleAudio(b) {
        this.audio.muted = !b
        // Here show mic on/off
    }

    toggleScreen(b) {
        if (b) {
            this.htmlElement.classList.add("screen-share")
        } else {
            this.htmlElement.classList.remove("screen-share")
        }
    }

    toggleVideo(b) {
        // Here show video on/off
        if (!b) {
            this.video.style.display = "none"
        } else {
            this.video.style.display = "block"
        }
    }


}