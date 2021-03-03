export default class LayoutManager {

    videosContainer
    scene
    selectedPeer = null

    constructor() {
        this.videosContainer = document.querySelector(".peer-list")
        this.scene = document.querySelector(".scene")
        window.onresize = () => {
            this.updateLayout()
        }
    }

    insertPeer(peer) {
        peer.htmlElement.onclick = () => {
            if (this.selectedPeer === null) {
                this.selectedPeer = peer
                this.focusLayout();
            } else if (this.selectedPeer?.peerId === peer.peerId) {
                this.addPeer(this.selectedPeer)
                this.selectedPeer = null
                this.tiledLayout(peer);
            } else {
                this.addPeer(this.selectedPeer)
                this.selectedPeer = peer
                this.removePeer(peer)
                this.focusLayout();
            }
        }
        this.addPeer(peer)
    }

    addPeer(peer) {
        this.videosContainer.appendChild(peer.htmlElement)
        this.updateLayout()
    }

    removePeer(peer) {
        this.videosContainer.removeChild(peer.htmlElement)
        this.updateLayout()
    }


    updateLayout() {


        console.log(" : NUMBER OF CHILD:", this.videosContainer.childElementCount);
        let childElementCount = this.videosContainer.childElementCount;
        let counter = this.videosContainer.childElementCount;
        let oppositeCounter = 1;
        if (this.videosContainer.childElementCount > 3) {
            counter = Math.ceil(Math.sqrt(this.videosContainer.childElementCount))
            oppositeCounter = counter
            if (childElementCount <= counter * (counter - 1)) {
                oppositeCounter = counter - 1
            }
        }

        let direction = "row"
        if (window.innerWidth > window.innerHeight) {
            this.videosContainer.style.gridTemplate = `repeat(${oppositeCounter},1fr) / repeat(${counter},1fr)`;
        } else {
            this.videosContainer.style.gridTemplate = `repeat(${counter},1fr) / repeat(${oppositeCounter},1fr)`;
            direction = "column"
        }
        this.videosContainer.style.gridAutoFlow = direction
    }

    focusLayout() {
        this.videosContainer.classList.add("focus-layout")
        this.scene.appendChild(this.selectedPeer.htmlElement)
        this.scene.style.display = "block";

    }

    tiledLayout() {
        this.videosContainer.classList.remove("focus-layout")
        this.scene.style.display = "none";
        while (this.scene.firstChild) {
            this.scene.removeChild(this.scene.lastChild);
        }
    }
}