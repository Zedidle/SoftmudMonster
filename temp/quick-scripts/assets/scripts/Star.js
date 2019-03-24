(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/Star.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '4644f0m2WtABYRy+pn6dOaG', 'Star', __filename);
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
    init: function init(game) {
        this.game = game;
        this.enabled = true;
        this.node.opacity = 255;
    },
    reuse: function reuse(game) {
        this.init(game);
    },
    onPicked: function onPicked() {
        var pos = this.node.getPosition();
        this.game.gainScore(pos);
        this.game.despawnStar(this.node);
        this.game.player.getComponent('Player').upgrade();
        this.game.gameUpgrade();
    },
    getPlayerDistance: function getPlayerDistance() {
        var playerPos = this.game.player.getPosition();
        var dist = this.node.position.sub(playerPos).mag();
        return dist;
    },
    update: function update(dt) {
        if (this.getPlayerDistance() < this.pickRadius) {
            this.onPicked();
            return;
        }

        var opacityRatio = 1 - this.game.timer / this.game.starDuration;
        var minOpacity = 50;
        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
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
        //# sourceMappingURL=Star.js.map
        