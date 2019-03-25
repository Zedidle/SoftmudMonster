let UserDataManager = require("UserDataManager");
let AudioManger = require("AudioManager");

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
        },
    },

    onLoad() {
        this.roleArg = UserDataManager.getRoleArg();
        this.updatePlayerAttr();
    },

    start() {

    },
    updatePlayerAttr() {
        this.surValue.string = '剩余点数：' + this.roleArg.sur;
        this.attrJumpDurationValue.string = this.roleArg.jumpDuration;
        this.attrAccelValue.string = this.roleArg.accel;
    },
    canAddAttr() {
        if (this.roleArg.sur === 0) {
            return false;
        } else {
            this.roleArg.sur--;
            return true;
        }
    },
    canSubAttr() {
        if (this.roleArg.sur > this.roleArg.maxArgNum - 1) {
            return false;
        } else {
            this.roleArg.sur++;
            return true;
        }
    },
    playAttrAudio(bool) {
        AudioManger.instance.play(bool?"canAttr":"cannotAttr");
        return bool;
    },

    addPlayerJumpDuration() {
        if (this.playAttrAudio(this.roleArg.jumpDuration < 20 && this.canAddAttr())) {
            this.roleArg.jumpDuration++;
            this.updatePlayerAttr();
        }
    },
    subPlayerJumpDuration() {
        if (this.playAttrAudio(this.roleArg.jumpDuration > 0 && this.canSubAttr())) {
            this.roleArg.jumpDuration--;
            this.updatePlayerAttr();
        }
    },
    addPlayerAccel() {
        if (this.playAttrAudio(this.roleArg.accel < 20 && this.canAddAttr())) {
            this.roleArg.accel++;
            this.updatePlayerAttr();
        }
    },
    subPlayerAccel() {
        if (this.playAttrAudio(this.roleArg.accel > 0 && this.canSubAttr())) {
            this.roleArg.accel--;
            this.updatePlayerAttr();
        }
    },


    open() {
        this.node.active = true;
    },

    close() {
        this.node.active = false;
        UserDataManager.setRoleArg(this.roleArg);
    }
});
