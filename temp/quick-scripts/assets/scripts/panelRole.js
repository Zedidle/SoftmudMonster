(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/panelRole.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '02b1bOgTmBBebxYHyEXoYlb', 'panelRole', __filename);
// scripts/panelRole.js

"use strict";

var UserDataManager = require("UserDataManager");
var AudioManger = require("AudioManager");

cc.Class({
    extends: cc.Component,

    properties: {
        surValue: {
            default: null,
            type: cc.Label
        },
        attrJumpDurationValue: {
            default: null,
            type: cc.Label
        },
        attrAccelValue: {
            default: null,
            type: cc.Label
        }
    },

    onLoad: function onLoad() {
        this.roleArg = UserDataManager.getRoleArg();
        this.updatePlayerAttr();
    },
    start: function start() {},
    updatePlayerAttr: function updatePlayerAttr() {
        this.surValue.string = '剩余点数：' + this.roleArg.sur;
        this.attrJumpDurationValue.string = this.roleArg.jumpDuration;
        this.attrAccelValue.string = this.roleArg.accel;
    },
    canAddAttr: function canAddAttr() {
        if (this.roleArg.sur === 0) {
            return false;
        } else {
            this.roleArg.sur--;
            return true;
        }
    },
    canSubAttr: function canSubAttr() {
        if (this.roleArg.sur > this.roleArg.maxArgNum - 1) {
            return false;
        } else {
            this.roleArg.sur++;
            return true;
        }
    },
    playAttrAudio: function playAttrAudio(bool) {
        AudioManger.instance.play(bool ? "canAttr" : "cannotAttr");
        return bool;
    },
    addPlayerJumpDuration: function addPlayerJumpDuration() {
        if (this.playAttrAudio(this.roleArg.jumpDuration < 20 && this.canAddAttr())) {
            this.roleArg.jumpDuration++;
            this.updatePlayerAttr();
        }
    },
    subPlayerJumpDuration: function subPlayerJumpDuration() {
        if (this.playAttrAudio(this.roleArg.jumpDuration > 0 && this.canSubAttr())) {
            this.roleArg.jumpDuration--;
            this.updatePlayerAttr();
        }
    },
    addPlayerAccel: function addPlayerAccel() {
        if (this.playAttrAudio(this.roleArg.accel < 20 && this.canAddAttr())) {
            this.roleArg.accel++;
            this.updatePlayerAttr();
        }
    },
    subPlayerAccel: function subPlayerAccel() {
        if (this.playAttrAudio(this.roleArg.accel > 0 && this.canSubAttr())) {
            this.roleArg.accel--;
            this.updatePlayerAttr();
        }
    },
    open: function open() {
        this.node.active = true;
    },
    close: function close() {
        this.node.active = false;
        UserDataManager.setRoleArg(this.roleArg);
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
        //# sourceMappingURL=panelRole.js.map
        