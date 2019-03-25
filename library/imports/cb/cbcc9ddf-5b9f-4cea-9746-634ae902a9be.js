"use strict";
cc._RF.push(module, 'cbcc93fW59M6pdGY0rpAqm+', 'ScoreAnim');
// scripts/ScoreAnim.js

"use strict";

cc.Class({
    extends: cc.Component,

    init: function init(scoreFX) {
        this.scoreFX = scoreFX;
    },
    hideFX: function hideFX() {
        this.scoreFX.despawn();
    }
});

cc._RF.pop();