(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/RedStar.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '15cafr2gY1H/ZTHSw9tkry2', 'RedStar', __filename);
// scripts/RedStar.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        pickRadius: 70,
        game: null
    },

    onLoad: function onLoad() {},
    start: function start() {},
    init: function init(game) {
        this.game = game;
        this.enabled = true;
    },
    onPicked: function onPicked() {
        this.game.gameWin();
    },
    getPlayerDistance: function getPlayerDistance() {
        var playerPos = this.game.player.getPosition();
        playerPos.y += this.node.height * 1 / 2;
        var dist = this.node.position.sub(playerPos).mag();
        return dist;
    },
    update: function update(dt) {
        if (this.getPlayerDistance() < this.pickRadius) {
            this.onPicked();
            return;
        }
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
        //# sourceMappingURL=RedStar.js.map
        