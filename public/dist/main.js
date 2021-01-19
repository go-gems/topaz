/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/js/Controls.js":
/*!*******************************!*\
  !*** ./assets/js/Controls.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => /* binding */ Controls\n/* harmony export */ });\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\nclass Controls {\n  constructor(peerManager) {\n    _defineProperty(this, \"peerManager\", void 0);\n\n    this.peerManager = peerManager;\n  }\n\n  toggleAudio() {\n    this.peerManager.audioEnabled ? this.peerManager.disableAudio() : this.peerManager.enableAudio();\n  }\n\n  toggleVideo() {\n    this.peerManager.videoEnabled ? this.peerManager.disableVideo() : this.peerManager.enableVideo();\n  }\n\n  toggleScreenSharing() {\n    this.peerManager.screenSharingEnabled ? this.peerManager.videoStart() : this.peerManager.shareScreenStart();\n  }\n\n}\n\n//# sourceURL=webpack://topaz/./assets/js/Controls.js?");

/***/ }),

/***/ "./assets/js/MediaStreams.js":
/*!***********************************!*\
  !*** ./assets/js/MediaStreams.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"VideoStream\": () => /* binding */ VideoStream,\n/* harmony export */   \"AudioStream\": () => /* binding */ AudioStream,\n/* harmony export */   \"SharedScreen\": () => /* binding */ SharedScreen\n/* harmony export */ });\nasync function VideoStream(callback) {\n  const stream = await navigator.mediaDevices.getUserMedia({\n    video: true,\n    audio: false\n  });\n  callback(stream);\n}\nasync function AudioStream(callback) {\n  const stream = await navigator.mediaDevices.getUserMedia({\n    video: false,\n    audio: true\n  });\n  callback(stream);\n}\nasync function SharedScreen(callback) {\n  callback(await screenCapture());\n}\n\nfunction screenCapture() {\n  if (navigator.getDisplayMedia) {\n    return navigator.getDisplayMedia({\n      video: true\n    });\n  } else if (navigator.mediaDevices.getDisplayMedia) {\n    return navigator.mediaDevices.getDisplayMedia({\n      video: true\n    });\n  } else {\n    return navigator.mediaDevices.getUserMedia({\n      video: {\n        mediaSource: 'screen'\n      }\n    });\n  }\n}\n\n//# sourceURL=webpack://topaz/./assets/js/MediaStreams.js?");

/***/ }),

/***/ "./assets/js/PeerClient.js":
/*!*********************************!*\
  !*** ./assets/js/PeerClient.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => /* binding */ PeerClient\n/* harmony export */ });\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\nclass PeerClient {\n  constructor(peerId) {\n    _defineProperty(this, \"peerId\", void 0);\n\n    _defineProperty(this, \"htmlElement\", void 0);\n\n    _defineProperty(this, \"video\", void 0);\n\n    _defineProperty(this, \"videoStream\", void 0);\n\n    _defineProperty(this, \"audio\", void 0);\n\n    _defineProperty(this, \"audioStream\", void 0);\n\n    _defineProperty(this, \"calls\", {});\n\n    this.peerId = peerId;\n\n    this._initializeHTML();\n  }\n\n  _initializeHTML() {\n    this.video = document.createElement('video');\n    this.audio = document.createElement('audio');\n    this.htmlElement = document.createElement('div');\n    this.htmlElement.classList.add(\"video\", \"remote-video\");\n    this.htmlElement.dataset.peerId = this.peerId;\n    this.htmlElement.appendChild(this.video);\n    this.htmlElement.appendChild(this.audio);\n  }\n\n  joinVideoStream(stream) {\n    this.video.style.display = \"block\";\n    this.videoStream = stream;\n\n    try {\n      this.video.srcObject = this.videoStream;\n    } catch (error) {\n      this.video.src = window.URL.createObjectURL(this.videoStream);\n    }\n\n    this.video.autoplay = true;\n    this.video.muted = true;\n    this.video.playsinline = true;\n  }\n\n  joinScreenShareStream(stream) {\n    this.videoStream = stream;\n\n    try {\n      this.video.srcObject = this.videoStream;\n    } catch (error) {\n      this.video.src = window.URL.createObjectURL(this.videoStream);\n    }\n\n    this.video.autoplay = true;\n    this.video.muted = false;\n    this.video.playsinline = true;\n  }\n\n  joinAudioStream(stream) {\n    this.audioStream = stream;\n\n    try {\n      this.audio.srcObject = this.audioStream;\n    } catch (error) {\n      this.audio.src = window.URL.createObjectURL(this.audioStream);\n    }\n\n    this.audio.autoplay = true;\n    this.audio.muted = false;\n    this.audio.playsinline = true;\n  }\n\n  closeStream(type) {\n    if (this.calls[type]) {\n      this.calls[type].close();\n      delete this.calls[type];\n    }\n  }\n\n  toggleAudio(b) {\n    this.audio.muted = !b; // Here show mic on/off\n  }\n\n  toggleVideo(b) {\n    // Here show video on/off\n    if (!b) {\n      this.video.style.display = \"none\";\n    } else {\n      this.video.style.display = \"block\";\n    }\n  }\n\n}\n\n//# sourceURL=webpack://topaz/./assets/js/PeerClient.js?");

/***/ }),

/***/ "./assets/js/PeerManager.js":
/*!**********************************!*\
  !*** ./assets/js/PeerManager.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => /* binding */ PeerManager\n/* harmony export */ });\n/* harmony import */ var _PeerClient_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./PeerClient.js */ \"./assets/js/PeerClient.js\");\n/* harmony import */ var _MediaStreams_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./MediaStreams.js */ \"./assets/js/MediaStreams.js\");\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n\n\nclass PeerManager {\n  constructor(peer) {\n    _defineProperty(this, \"TYPE_VIDEO\", \"VIDEO\");\n\n    _defineProperty(this, \"TYPE_AUDIO\", \"AUDIO\");\n\n    _defineProperty(this, \"TYPE_SCREENSHARE\", \"SCREENSHARE\");\n\n    _defineProperty(this, \"peer\", void 0);\n\n    _defineProperty(this, \"localUser\", void 0);\n\n    _defineProperty(this, \"remoteUsers\", {});\n\n    _defineProperty(this, \"videoEnabled\", true);\n\n    _defineProperty(this, \"audioEnabled\", true);\n\n    _defineProperty(this, \"screenSharingEnabled\", false);\n\n    _defineProperty(this, \"onClosedStream\", type => {});\n\n    _defineProperty(this, \"onOpenedStream\", type => {});\n\n    this.peer = peer;\n    this.localUser = new _PeerClient_js__WEBPACK_IMPORTED_MODULE_0__.default(\"__default\");\n  }\n\n  async startPeering() {\n    await this.startMyStream();\n    this.peer.on('call', call => {\n      if (!this.remoteUsers[call.peer]) {\n        this.remoteUsers[call.peer] = new _PeerClient_js__WEBPACK_IMPORTED_MODULE_0__.default(call.peer);\n        document.querySelector(\".videos\").appendChild(this.remoteUsers[call.peer].htmlElement);\n      }\n\n      call.answer(null);\n      call.on('stream', this.processReceivingMediaStream(call));\n    });\n  }\n\n  async videoStart() {\n    this.screenSharingEnabled = false;\n    await (0,_MediaStreams_js__WEBPACK_IMPORTED_MODULE_1__.VideoStream)(stream => {\n      this.localUser.joinVideoStream(stream);\n    });\n  }\n\n  async audioStart() {\n    await (0,_MediaStreams_js__WEBPACK_IMPORTED_MODULE_1__.AudioStream)(stream => {\n      this.localUser.joinAudioStream(stream);\n      this.localUser.audio.muted = true;\n    });\n  }\n\n  async shareScreenStart() {\n    await (0,_MediaStreams_js__WEBPACK_IMPORTED_MODULE_1__.SharedScreen)(stream => {\n      this.localUser.joinScreenShareStream(stream);\n      this.screenSharingEnabled = true;\n      this.openStream(this.localUser.videoStream, this.TYPE_VIDEO);\n    });\n  }\n\n  async startMyStream() {\n    if (navigator.mediaDevices.getUserMedia) {\n      await this.videoStart();\n      await this.audioStart();\n    }\n\n    document.querySelector(\".videos\").appendChild(this.localUser.htmlElement);\n  }\n\n  sendMyStreams(peerId) {\n    if (this.videoEnabled) this.call(peerId, this.localUser.videoStream, this.TYPE_VIDEO);\n    if (this.audioEnabled) this.call(peerId, this.localUser.audioStream, this.TYPE_AUDIO);\n  }\n\n  call(peerId, stream, type) {\n    let callInstance = this.peer.call(peerId, stream, {\n      metadata: {\n        callType: type\n      }\n    });\n    callInstance.on('close', () => {});\n\n    if (!this.remoteUsers[peerId]) {\n      this.remoteUsers[peerId] = new _PeerClient_js__WEBPACK_IMPORTED_MODULE_0__.default(peerId);\n      document.querySelector(\".videos\").appendChild(this.remoteUsers[peerId].htmlElement);\n    }\n\n    this.remoteUsers[peerId].calls[type] = callInstance;\n  }\n\n  onCloseCall(callback) {}\n\n  closeCall(peerId) {\n    if (this.remoteUsers[peerId]) {\n      document.querySelector(\".videos\").removeChild(this.remoteUsers[peerId].htmlElement);\n      delete this.remoteUsers[peerId];\n    }\n  }\n\n  processReceivingMediaStream(call) {\n    let callType = call.metadata.callType;\n    return stream => {\n      switch (callType) {\n        case this.TYPE_VIDEO:\n          this.remoteUsers[call.peer].joinVideoStream(stream);\n          break;\n\n        case this.TYPE_AUDIO:\n          this.remoteUsers[call.peer].joinAudioStream(stream);\n          break;\n      }\n    };\n  }\n\n  closeStream(type) {\n    for (let peerId of Object.keys(this.remoteUsers)) {\n      this.remoteUsers[peerId].closeStream(type);\n    }\n\n    this.onClosedStream(type);\n  }\n\n  openStream(stream, type) {\n    for (let peerId of Object.keys(this.remoteUsers)) {\n      this.call(peerId, stream, type);\n    }\n\n    this.onOpenedStream(type);\n  }\n\n  disableVideo() {\n    this.videoEnabled = false;\n\n    for (let track of this.localUser.videoStream.getTracks()) {\n      track.stop();\n    }\n\n    this.closeStream(this.TYPE_VIDEO);\n  }\n\n  disableAudio() {\n    this.audioEnabled = false;\n\n    for (let track of this.localUser.audioStream.getTracks()) {\n      track.stop();\n    }\n\n    this.closeStream(this.TYPE_AUDIO);\n  }\n\n  async enableVideo() {\n    this.videoEnabled = true;\n    await this.videoStart();\n    this.openStream(this.localUser.videoStream, this.TYPE_VIDEO);\n  }\n\n  async enableAudio() {\n    this.audioEnabled = true;\n    await this.audioStart();\n    this.openStream(this.localUser.videoStream, this.TYPE_VIDEO);\n  }\n\n  changeStreamStatus(peerId, type, status) {\n    if (!this.remoteUsers[peerId]) return;\n\n    switch (type) {\n      case this.TYPE_VIDEO:\n        this.remoteUsers[peerId].toggleVideo(status);\n        break;\n\n      case this.TYPE_AUDIO:\n        this.remoteUsers[peerId].toggleAudio(status);\n        break;\n    }\n  }\n\n}\n\n//# sourceURL=webpack://topaz/./assets/js/PeerManager.js?");

/***/ }),

/***/ "./assets/js/Topaz.js":
/*!****************************!*\
  !*** ./assets/js/Topaz.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => /* binding */ Topaz\n/* harmony export */ });\n/* harmony import */ var _WsManager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./WsManager.js */ \"./assets/js/WsManager.js\");\n/* harmony import */ var _PeerManager_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PeerManager.js */ \"./assets/js/PeerManager.js\");\n/* harmony import */ var _Controls_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Controls.js */ \"./assets/js/Controls.js\");\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n\n\n\nclass Topaz {\n  constructor() {\n    _defineProperty(this, \"peerManager\", void 0);\n\n    _defineProperty(this, \"peerId\", void 0);\n\n    _defineProperty(this, \"wsManager\", void 0);\n\n    _defineProperty(this, \"userList\", {});\n\n    _defineProperty(this, \"controls\", void 0);\n\n    this.setupPeerManager();\n    this.setupPeerHandlers();\n  }\n\n  setupPeerHandlers() {\n    this.peerManager.peer.on('open', id => {\n      this.peerId = id;\n      this.peerManager.startPeering().then(() => {\n        this.initWs();\n      });\n    });\n  }\n\n  initWs() {\n    this.wsManager = new _WsManager_js__WEBPACK_IMPORTED_MODULE_0__.default();\n    this.wsManager.on(\"logged\", data => {\n      this.userList = data.userList;\n    });\n    this.wsManager.on(\"user-joined\", data => {\n      this.userList[data.peerId] = data;\n      this.peerManager.sendMyStreams(data.peerId);\n      this.wsManager.send(\"call-me\", {\n        \"from\": this.peerId,\n        \"to\": data.peerId\n      }); // from A to B\n    });\n    this.wsManager.on(\"call-request\", data => {\n      // B will store client A and make a call\n      this.userList[data.peerId] = data;\n      this.peerManager.sendMyStreams(data.peerId);\n    });\n    this.wsManager.on(\"user-left\", data => {\n      delete userList[data];\n      this.peerManager.closeCall(data);\n    });\n    this.wsManager.on(\"stream-status-changed\", data => {\n      this.peerManager.changeStreamStatus(data.peerId, data.type, data.on);\n    });\n\n    this.wsManager.ws.onopen = () => {\n      this.wsManager.send(\"login\", {\n        peerId: this.peerId\n      });\n    };\n  }\n\n  setupPeerManager() {\n    this.peerManager = new _PeerManager_js__WEBPACK_IMPORTED_MODULE_1__.default(new Peer({\n      config: {\n        'iceServers': [{\n          url: 'stun:stun.l.google.com:19302'\n        }, {\n          url: 'stun:stun.services.mozilla.com'\n        }]\n      }\n    }));\n    this.controls = new _Controls_js__WEBPACK_IMPORTED_MODULE_2__.default(this.peerManager);\n\n    this.peerManager.onOpenedStream = type => {\n      this.wsManager.send(\"stream-status-changed\", {\n        peerId: this.peerId,\n        type: type,\n        on: true\n      });\n    };\n\n    this.peerManager.onClosedStream = type => {\n      this.wsManager.send(\"stream-status-changed\", {\n        peerId: this.peerId,\n        type: type,\n        on: false\n      });\n    };\n  }\n\n}\n\n//# sourceURL=webpack://topaz/./assets/js/Topaz.js?");

/***/ }),

/***/ "./assets/js/WsManager.js":
/*!********************************!*\
  !*** ./assets/js/WsManager.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => /* binding */ WsManager\n/* harmony export */ });\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\nclass WsManager {\n  constructor() {\n    _defineProperty(this, \"ws\", void 0);\n\n    _defineProperty(this, \"actions\", {});\n\n    let protocol = \"ws://\";\n\n    if (window.location.protocol == \"https:\") {\n      protocol = \"wss://\";\n    }\n\n    this.ws = new WebSocket(protocol + window.location.hostname + (window.location.port ? `:${window.location.port}` : \"\") + \"/ws\");\n    this.ws.onmessage = this._onEvent(this);\n  }\n\n  _onEvent(self) {\n    return event => {\n      let msg = JSON.parse(event.data);\n\n      if (self.actions[msg.type]) {\n        self.actions[msg.type](msg.data);\n      }\n    };\n  }\n\n  send(type, data) {\n    this.ws.send(JSON.stringify({\n      type,\n      data\n    }));\n  }\n\n  on(type, callback) {\n    this.actions[type] = callback;\n  }\n\n}\n\n//# sourceURL=webpack://topaz/./assets/js/WsManager.js?");

/***/ }),

/***/ "./assets/js/index.js":
/*!****************************!*\
  !*** ./assets/js/index.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _Topaz_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Topaz.js */ \"./assets/js/Topaz.js\");\n\ndocument.addEventListener(\"DOMContentLoaded\", () => {\n  topaz = new _Topaz_js__WEBPACK_IMPORTED_MODULE_0__.default(userList);\n});\n\n//# sourceURL=webpack://topaz/./assets/js/index.js?");

/***/ }),

/***/ "./assets/scss/style.scss":
/*!********************************!*\
  !*** ./assets/scss/style.scss ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => __WEBPACK_DEFAULT_EXPORT__\n/* harmony export */ });\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + \"/css/style.css\");\n\n//# sourceURL=webpack://topaz/./assets/scss/style.scss?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./assets/js/index.js");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ 	__webpack_require__("./assets/scss/style.scss");
/******/ })()
;