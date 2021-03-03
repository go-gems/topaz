import {getAudioInputList, getVideoInputList} from "./MediaStreams.js";

export default class Controls {

    peerManager

    constructor(peerManager) {
        this.peerManager = peerManager
        this.updateControls()
    }

    updateControls() {
        this.toggleButtonEffect("#sound-button", this.peerManager.localUser.audioEnabled, "fa-microphone", "fa-microphone-slash")
        this.toggleButtonEffect("#video-button", this.peerManager.localUser.videoEnabled, "fa-video", "fa-video-slash")
        this.toggleButtonEffect("#screen-button", this.peerManager.localUser.screenSharingEnabled, "fa-screen", "fa-screen")
    }

    toggleButtonEffect(selector, state, iconTrue, iconFalse) {
        const btn = document.querySelector(selector)
        if (state) {
            btn.classList.add("active")
            btn.firstElementChild.classList.remove(iconFalse)
            btn.firstElementChild.classList.add(iconTrue)
        } else {
            btn.classList.remove("active")

            btn.firstElementChild.classList.add(iconFalse)
            btn.firstElementChild.classList.remove(iconTrue)

        }
    }

    toggleAudio() {
        this.peerManager.localUser.audioEnabled ? this.peerManager.disableAudio() : this.peerManager.enableAudio()
        this.updateControls()
    }

    toggleVideo() {
        this.peerManager.localUser.videoEnabled ? this.peerManager.disableVideo() : this.peerManager.enableVideo()
        this.updateControls()

    }

    async toggleScreenSharing() {
        await (this.peerManager.localUser.screenSharingEnabled ? this.peerManager.disableScreenShare() : this.peerManager.enableScreenShare())
        this.updateControls()
    }

    async settings() {
        let e = await getVideoInputList();
        console.log(e)

        let f = await getAudioInputList();
        console.log(f)
    }

}
