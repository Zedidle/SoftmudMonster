window.__require = function t(e, i, n) {
function c(a, o) {
if (!i[a]) {
if (!e[a]) {
var u = a.split("/");
u = u[u.length - 1];
if (!e[u]) {
var r = "function" == typeof __require && __require;
if (!o && r) return r(u, !0);
if (s) return s(u, !0);
throw new Error("Cannot find module '" + a + "'");
}
}
var h = i[a] = {
exports: {}
};
e[a][0].call(h.exports, function(t) {
return c(e[a][1][t] || t);
}, h, h.exports, t, e, i, n);
}
return i[a].exports;
}
for (var s = "function" == typeof __require && __require, a = 0; a < n.length; a++) c(n[a]);
return c;
}({
Game: [ function(t, e, i) {
"use strict";
cc._RF.push(e, "4e12fLSQu1L+KV6QmxDiavU", "Game");
cc.Class({
extends: cc.Component,
properties: {
starPrefab: {
default: null,
type: cc.Prefab
},
maxStarDuration: 0,
minStarDuration: 0,
ground: {
default: null,
type: cc.Node
},
player: {
default: null,
type: cc.Node
},
scoreDisplay: {
default: null,
type: cc.Label
},
scoreAudio: {
default: null,
type: cc.AudioClip
}
},
onLoad: function() {
this.groundY = this.ground.y + this.ground.height / 2;
this.timer = 0;
this.starDuration = 0;
this.spawnNewStar();
this.score = 0;
},
upgrade: function() {
this.player.getComponent("Player").upgrade();
},
spawnNewStar: function() {
var t = cc.instantiate(this.starPrefab);
this.node.addChild(t);
t.setPosition(this.getNewStarPosition());
t.getComponent("Star").game = this;
this.starDuration = this.minStarDuration + Math.random() * (this.maxStarDuration - this.minStarDuration);
this.timer = 0;
},
getNewStarPosition: function() {
var t, e = this.groundY + Math.random() * this.player.getComponent("Player").jumpHeight + 50, i = this.node.width / 2;
t = 2 * (Math.random() - .5) * i;
return cc.v2(t, e);
},
update: function(t) {
if (this.timer > this.starDuration) {
this.gameOver();
this.enabled = !1;
} else this.timer += t;
},
gainScore: function() {
this.score += 1;
this.scoreDisplay.string = "Score: " + this.score;
cc.audioEngine.playEffect(this.scoreAudio, !1);
},
gameOver: function() {
this.player.stopAllActions();
cc.director.loadScene("game");
}
});
cc._RF.pop();
}, {} ],
Player: [ function(t, e, i) {
"use strict";
cc._RF.push(e, "6c688v72QdOKamCGCT+xaAd", "Player");
cc.Class({
extends: cc.Component,
properties: {
initialHeight: 0,
jumpHeight: 0,
jumpDuration: .3,
maxMoveSpeed: 0,
accel: 0,
jumpAudio: {
default: null,
type: cc.AudioClip
},
switchJumpStyleAudio: {
default: null,
type: cc.AudioClip
},
jumpInterval: null,
jumpStyleIndex: 0,
jumpStylesLength: 0,
jumpStyleDisplay: {
default: null,
type: cc.Label
}
},
upgrade: function() {
this.jumpHeight += 5;
this.jumpDuration += .01;
this.accel += 10;
this.updateJumpAction();
},
getJumpStyles: function(t) {
return "key" === t ? [ "起跳", "漂浮", "弹簧", "震动", "二段", "轻功", "滞空", "悬空", "和谐", "正常" ] : [ [ "easeExponentialOut", "easeExponentialIn" ], [ "easeSineOut", "easeSineIn" ], [ "easeElasticOut", "easeElasticIn" ], [ "easeBounceOut", "easeBounceIn" ], [ "easeBackOut", "easeBackIn" ], [ "easeQuadraticActionOut", "easeQuadraticActionIn" ], [ "easeQuarticActionOut", "easeQuarticActionIn" ], [ "easeQuinticActionOut", "easeQuinticActionIn" ], [ "easeCircleActionOut", "easeCircleActionIn" ], [ "easeCubicActionOut", "easeCubicActionIn" ] ];
},
updateJumpAction: function() {
var t = this.getJumpStyles();
this.jumpStylesLength = t.length;
var e = cc.moveBy(this.jumpDuration, cc.v2(0, this.jumpHeight)).easing(cc[t[this.jumpStyleIndex][0]]()), i = cc.moveBy(this.jumpDuration, cc.v2(0, -this.jumpHeight)).easing(cc[t[this.jumpStyleIndex][1]]()), n = cc.callFunc(this.playJumpSound, this);
clearInterval(this.jumpInterval);
var c = this;
this.jumpInterval = setInterval(function() {
c.node.runAction(cc.repeat(cc.sequence(e, i, n), 1));
}, 2e3 * this.jumpDuration);
},
playJumpSound: function() {
cc.audioEngine.playEffect(this.jumpAudio, !1);
},
onKeyDown: function(t) {
switch (t.keyCode) {
case cc.macro.KEY.a:
this.accLeft = !0;
break;

case cc.macro.KEY.d:
this.accRight = !0;
console.log("d");
break;

case cc.macro.KEY.w:
this.jumpStyleIndex === this.jumpStylesLength - 1 ? this.jumpStyleIndex = 0 : this.jumpStyleIndex++;
this.updateJumpAction();
this.changeJumpStyle();
break;

case cc.macro.KEY.s:
0 === this.jumpStyleIndex ? this.jumpStyleIndex = this.jumpStylesLength - 1 : this.jumpStyleIndex--;
this.updateJumpAction();
this.changeJumpStyle();
}
},
onKeyUp: function(t) {
switch (t.keyCode) {
case cc.macro.KEY.a:
this.accLeft = !1;
break;

case cc.macro.KEY.d:
this.accRight = !1;
}
},
onLoad: function() {
this.updateJumpAction();
this.accLeft = !1;
this.accRight = !1;
this.xSpeed = 0;
cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
},
onDestroy: function() {
cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
},
update: function(t) {
this.accLeft ? this.xSpeed -= this.accel * t : this.accRight && (this.xSpeed += this.accel * t);
Math.abs(this.xSpeed) > this.maxMoveSpeed && (this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed));
this.node.x += this.xSpeed * t;
},
changeJumpStyle: function() {
var t = this.getJumpStyles("key");
this.jumpStyleDisplay.string = "跳跃模式: " + t[this.jumpStyleIndex];
cc.audioEngine.playEffect(this.switchJumpStyleAudio, !1);
}
});
cc._RF.pop();
}, {} ],
Star: [ function(t, e, i) {
"use strict";
cc._RF.push(e, "4644f0m2WtABYRy+pn6dOaG", "Star");
cc.Class({
extends: cc.Component,
properties: {
pickRadius: 0
},
getPlayerDistance: function() {
var t = this.game.player.getPosition();
return this.node.position.sub(t).mag();
},
onPicked: function() {
this.game.spawnNewStar();
this.game.gainScore();
this.node.destroy();
this.game.player.getComponent("Player").upgrade();
},
update: function(t) {
if (this.getPlayerDistance() < this.pickRadius) this.onPicked(); else {
var e = 1 - this.game.timer / this.game.starDuration;
this.node.opacity = 50 + Math.floor(205 * e);
}
}
});
cc._RF.pop();
}, {} ]
}, {}, [ "Game", "Player", "Star" ]);