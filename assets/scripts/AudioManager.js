const AudioManager = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    ctor() {
        if (!AudioManager.instance) {
            AudioManager.instance = this;
        }
    },

    onload(){
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
        },
    },

    play(audioName,loop){
        cc.audioEngine.playEffect(this[audioName], loop);
    },

    stopAll(){
        cc.audioEngine.stopAll();
    },


});
