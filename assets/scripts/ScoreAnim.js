cc.Class({
    extends: cc.Component,

    init(scoreFX) {
        this.scoreFX = scoreFX;
    },

    hideFX() {
        this.scoreFX.despawn();
    },
});