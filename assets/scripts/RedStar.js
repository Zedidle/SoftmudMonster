cc.Class({
    extends: cc.Component,

    properties: {
        pickRadius: 70,
        game:null,
    },

    onLoad () {},

    start () {

    },
    init(game) {
        this.game = game;
        this.enabled = true;
    },

    onPicked(){
        this.game.gameWin();
    },
    getPlayerDistance () {
        var playerPos = this.game.player.getPosition();
        playerPos.y += this.node.height * 1/2;
        var dist = this.node.position.sub(playerPos).mag();
        return dist;
    },
    update(dt) {
        if (this.getPlayerDistance() < this.pickRadius) {
            this.onPicked();
            return;
        }
    },
});
