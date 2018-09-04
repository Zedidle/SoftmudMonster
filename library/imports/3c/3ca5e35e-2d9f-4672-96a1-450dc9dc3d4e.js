"use strict";
cc._RF.push(module, '3ca5eNeLZ9GcpahRQ3J3D1O', 'ScoreFX');
// scripts/ScoreFX.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        anim: {
            default: null,
            type: cc.Animation
        }
    },

    init: function init(game) {
        this.game = game;
        this.anim.getComponent('ScoreAnim').init(this);
    },
    despawn: function despawn() {
        this.game.despawnScoreFX(this.node);
    },


    play: function play() {
        this.anim.play('score_pop');
    }
});

cc._RF.pop();