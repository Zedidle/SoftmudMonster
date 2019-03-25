(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/AudioManager.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '96d3ccLi7xE56PRnxO5TeQZ', 'AudioManager', __filename);
// scripts/AudioManager.js

"use strict";

var AudioManager = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null
    },

    ctor: function ctor() {
        if (!AudioManager.instance) {
            AudioManager.instance = this;
        }
    },
    onload: function onload() {
        cc.game.addPersistRootNode(this.node);
    },


    properties: {
        bgm: {
            default: null,
            type: cc.AudioClip
        },
        farCamera: {
            default: null,
            type: cc.AudioClip
        },
        addScore: {
            default: null,
            type: cc.AudioClip
        },
        gameWin: {
            default: null,
            type: cc.AudioClip
        },
        gameOver: {
            default: null,
            type: cc.AudioClip
        },
        canAttr: {
            default: null,
            type: cc.AudioClip
        },
        cannotAttr: {
            default: null,
            type: cc.AudioClip
        },
        jump: {
            default: null,
            type: cc.AudioClip
        },
        switchJump: {
            default: null,
            type: cc.AudioClip
        }
    },

    play: function play(audioName, loop) {
        cc.audioEngine.playEffect(this[audioName], loop);
    },
    stopAll: function stopAll() {
        cc.audioEngine.stopAll();
    }
});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=AudioManager.js.map
        