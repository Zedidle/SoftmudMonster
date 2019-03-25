"use strict";
cc._RF.push(module, '4644f0m2WtABYRy+pn6dOaG', 'Star');
// scripts/Star.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        pickRadius: 70
    },

    onLoad: function onLoad() {
        this.enabled = false;
    },
    init: function init(_main) {
        this._main = _main;
        this.enabled = true;
        this.node.opacity = 255;
    },
    onPicked: function onPicked() {
        var pos = this.node.getPosition();
        this._main.gainScore(pos);
        this._main.despawnStar(this.node);
        this._main.player.getComponent('Player').upgrade();
        this._main.gameUpgrade();
    },
    getPlayerDistance: function getPlayerDistance() {
        var playerPos = this._main.player.getPosition();
        var dist = this.node.position.sub(playerPos).mag();
        return dist;
    },
    update: function update(dt) {
        if (this.getPlayerDistance() < this.pickRadius) {
            this.onPicked();
            return;
        }

        this.node.opacity = 100 + Math.floor((1 - this._main.timer / this._main.starsDuration) * 155);
    }
});

cc._RF.pop();