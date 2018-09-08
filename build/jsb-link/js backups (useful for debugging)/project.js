window.__require = function t(e, i, n) {
function s(c, o) {
if (!i[c]) {
if (!e[c]) {
var r = c.split("/");
r = r[r.length - 1];
if (!e[r]) {
var h = "function" == typeof __require && __require;
if (!o && h) return h(r, !0);
if (a) return a(r, !0);
throw new Error("Cannot find module '" + c + "'");
}
}
var u = i[c] = {
exports: {}
};
e[c][0].call(u.exports, function(t) {
return s(e[c][1][t] || t);
}, u, u.exports, t, e, i, n);
}
return i[c].exports;
}
for (var a = "function" == typeof __require && __require, c = 0; c < n.length; c++) s(n[c]);
return s;
}({
Game: [ function(t, e, i) {
"use strict";
cc._RF.push(e, "4e12fLSQu1L+KV6QmxDiavU", "Game");
cc.Class({
extends: cc.Component,
properties: {
bgAtlas: {
default: null,
type: cc.SpriteAtlas
},
bgs: {
default: null,
type: [ cc.SpriteFrame ]
},
gameTimer: {
default: null,
type: cc.Label
},
timeKeeper: null,
gameCamera: {
default: null,
type: cc.Camera
},
starNumber: 1,
currentStarNumber: 1,
currentStars: [],
starPrefab: {
default: null,
type: cc.Prefab
},
redStarPrefab: {
default: null,
type: cc.Prefab
},
scoreFXPrefab: {
default: null,
type: cc.Prefab
},
iniStarDuration: 5,
starDuration: 0,
gameLevel: 0,
cameraFarSpeed: 10,
starMoreSpeed: 35,
ground: {
default: null,
type: cc.Node
},
player: {
default: null,
type: cc.Node
},
thisJumpGetScore: !1,
scoreKeeper: 1,
scoreDisplay: {
default: null,
type: cc.Label
},
scoreAudio: {
default: null,
type: cc.AudioClip
},
btnNode: {
default: null,
type: cc.Node
},
gameOverNode: {
default: null,
type: cc.Node
},
youWinNode: {
default: null,
type: cc.Node
},
controlHintLabel: {
default: null,
type: cc.Label
},
keyboardHint: {
default: "",
multiline: !0
},
touchHint: {
default: "",
multiline: !0
}
},
onLoad: function() {
console.log(this.bgAtlas);
console.log(this.bgAtlas.getTexture());
this.node;
this.groundY = this.ground.y + this.ground.height / 2 - 10;
this.currentStarX = 0;
this.timer = 0;
this.enabled = !1;
var t = cc.sys.isMobile ? this.touchHint : this.keyboardHint;
this.controlHintLabel.string = t;
this.starPool = new cc.NodePool("Star");
this.scorePool = new cc.NodePool("ScoreFX");
this.spawnRedStar();
},
startGameTimer: function() {
var t = 0;
this.timeKeeper = setInterval(function() {
t += .1;
this.gameTimer.string = "Time: " + t.toFixed(1);
}.bind(this), 100);
},
stopGameTimer: function() {
clearInterval(this.timeKeeper);
},
onStartGame: function() {
this.gameCamera.zoomRatio = 1;
this.startGameTimer();
this.resetScore();
this.enabled = !0;
this.btnNode.x = 3e3;
this.gameOverNode.active = !1;
this.youWinNode.active = !1;
this.player.getComponent("Player").startMoveAt(0, this.groundY);
var t = !0, e = !1, i = void 0;
try {
for (var n, s = this.currentStars[Symbol.iterator](); !(t = (n = s.next()).done); t = !0) {
n.value.destroy();
}
} catch (t) {
e = !0;
i = t;
} finally {
try {
!t && s.return && s.return();
} finally {
if (e) throw i;
}
}
this.currentStars = [];
this.starNumber = 1;
this.spawnNewStar();
},
spawnRedStar: function() {
var t = cc.instantiate(this.redStarPrefab);
this.node.addChild(t);
var e = this.node.width / 2 - 180 - 10 * Math.random(), i = 2 * (Math.random() - .5) * this.node.width / 2;
t.setPosition(cc.v2(i, e));
t.getComponent("RedStar").init(this);
},
spawnNewStar: function() {
var t = null;
t = this.starPool.size() > 0 ? this.starPool.get(this) : cc.instantiate(this.starPrefab);
this.node.addChild(t);
t.setPosition(this.getNewStarPosition());
t.getComponent("Star").init(this);
this.startTimer();
this.currentStars.push(t);
},
despawnStar: function(t) {
t.destroy();
this.currentStarNumber--;
if (!this.currentStarNumber) {
for (var e = 0; e < this.starNumber; e++) this.spawnNewStar();
this.currentStarNumber = this.starNumber;
}
},
startTimer: function() {
this.starDuration = this.iniStarDuration - this.gameLevel / 150;
this.timer = 0;
},
getNewStarPosition: function() {
var t = this.groundY + Math.random() * this.player.getComponent("Player").jumpHeight + 30, e = this.node.width / 2 + .6 * this.gameLevel, i = 2 * (Math.random() - .5) * e;
return cc.v2(i, t);
},
gainScore: function(t) {
this.score += this.scoreKeeper;
this.scoreDisplay.string = "Score: " + this.score;
this.thisJumpGetScore = !0;
var e = this.spawnScoreFX();
e.node.children[0].children[1]._components[0]._string = "+" + this.scoreKeeper;
this.node.addChild(e.node);
e.node.setPosition(t);
e.play();
cc.audioEngine.playEffect(this.scoreAudio, !1);
this.scoreKeeper++;
},
resetScore: function() {
this.score = 0;
this.scoreDisplay.string = "Score: " + this.score;
},
spawnScoreFX: function() {
var t;
(t = cc.instantiate(this.scoreFXPrefab).getComponent("ScoreFX")).init(this);
return t;
},
despawnScoreFX: function(t) {
this.scorePool.put(t);
},
gameUpgrade: function() {
this.gameLevel++;
this.gameLevel % this.cameraFarSpeed == 0 && this.modifyCamera();
if (this.gameLevel % this.starMoreSpeed == 0) {
this.starNumber++;
this.iniStarDuration += .5;
}
},
modifyCamera: function() {
var t = 0, e = setInterval(function() {
this.gameCamera.zoomRatio *= .999;
12 == ++t && clearInterval(e);
}.bind(this), 40);
},
update: function(t) {
if (this.timer > this.starDuration) {
this.gameOver();
this.enabled = !1;
} else this.timer += t;
},
gameWin: function() {
this.youWinNode.active = !0;
this.again();
},
gameOver: function() {
this.gameOverNode.active = !0;
this.again();
},
again: function() {
this.stopGameTimer();
this.player.getComponent("Player").stopMove();
this.player.getComponent("Player").initProperties();
this.gameLevel = 0;
this.btnNode.x = 0;
this.enabled = !1;
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
jumpHeight: 150,
jumpDuration: .3,
squashDuration: .05,
maxMoveSpeed: 3e3,
accel: 300,
jumpAudio: {
default: null,
type: cc.AudioClip
},
jumpActionArray: [],
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
onLoad: function() {
this.enabled = !1;
this.initProperties();
this.accLeft = !1;
this.accRight = !1;
this.xSpeed = 0;
this.minPosX = -this.node.parent.width / 2;
this.maxPosX = this.node.parent.width / 2;
cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
var t = cc.Canvas.instance.node;
t.on("touchstart", this.onTouchStart, this);
t.on("touchend", this.onTouchEnd, this);
},
initProperties: function() {
this.initialHeight = 0;
this.jumpHeight = 150;
this.jumpDuration = .3;
this.accel = 250;
},
upgrade: function() {
this.jumpHeight += 1.5;
this.jumpDuration += .002;
this.accel += 15;
},
getJumpStyles: function(t) {
return "key" === t ? [ "正常", "漂浮", "二段", "轻功", "滞空" ] : [ [ "easeCubicActionOut", "easeCubicActionIn" ], [ "easeSineOut", "easeSineIn" ], [ "easeBackOut", "easeBackIn" ], [ "easeQuadraticActionOut", "easeQuadraticActionIn" ], [ "easeQuarticActionOut", "easeQuarticActionIn" ] ];
},
jumping: function() {
var t = this.getJumpStyles();
this.jumpStylesLength = t.length;
var e = cc.moveBy(this.jumpDuration, cc.v2(0, this.jumpHeight)).easing(cc[t[this.jumpStyleIndex][0]]()), i = cc.moveBy(this.jumpDuration, cc.v2(0, -this.jumpHeight)).easing(cc[t[this.jumpStyleIndex][1]]()), n = cc.scaleTo(this.squashDuration, 1, .6), s = cc.scaleTo(this.squashDuration, 1, 1.2), a = cc.scaleTo(this.squashDuration, 1, 1), c = cc.callFunc(this.playJumpSound, this);
this.node.runAction(cc.repeat(cc.sequence(n, s, e, a, i, c), 1));
if (this.enabled) {
var o = this.node.parent.getComponent("Game");
o.thisJumpGetScore || (o.scoreKeeper = 1);
o.thisJumpGetScore = !1;
this.readyJump();
}
},
readyJump: function() {
var t = this;
setTimeout(function() {
t.enabled && t.jumping();
}, 2e3 * t.jumpDuration + 3e3 * t.squashDuration);
},
playJumpSound: function() {
cc.audioEngine.playEffect(this.jumpAudio, !1);
},
getCenterPos: function() {
return cc.v2(this.node.x, this.node.y + this.node.height / 2);
},
startMoveAt: function(t, e) {
this.enabled = !0;
this.xSpeed = 0;
this.node.setPosition(t, e);
this.readyJump();
},
stopMove: function() {
this.enabled = !1;
this.node.stopAllActions();
clearInterval(this.jumpInterval);
},
onKeyDown: function(t) {
switch (t.keyCode) {
case cc.macro.KEY.a:
this.accLeft = !0;
break;

case cc.macro.KEY.d:
this.accRight = !0;
break;

case cc.macro.KEY.w:
this.switchJumpStyle(!0);
break;

case cc.macro.KEY.s:
this.switchJumpStyle(!1);
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
onTouchStart: function(t) {
var e = t.getLocation();
if (e.x > cc.winSize.width / 2) if (e.y > cc.winSize.height / 2) this.switchJumpStyle(!0); else {
this.accLeft = !1;
this.accRight = !0;
} else if (e.y > cc.winSize.height / 2) this.switchJumpStyle(!1); else {
this.accLeft = !0;
this.accRight = !1;
}
},
switchJumpStyle: function(t) {
t ? this.jumpStyleIndex === this.jumpStylesLength - 1 ? this.jumpStyleIndex = 0 : this.jumpStyleIndex++ : 0 === this.jumpStyleIndex ? this.jumpStyleIndex = this.jumpStylesLength - 1 : this.jumpStyleIndex--;
this.changeJumpStyle();
},
changeJumpStyle: function() {
var t = this.getJumpStyles("key");
this.jumpStyleDisplay.string = "跳法：" + t[this.jumpStyleIndex];
cc.audioEngine.playEffect(this.switchJumpStyleAudio, !1);
},
onTouchEnd: function(t) {
this.accLeft = !1;
this.accRight = !1;
},
onDestroy: function() {
cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
var t = cc.Canvas.instance.node;
t.off("touchstart", this.onTouchStart, this);
t.off("touchend", this.onTouchEnd, this);
},
update: function(t) {
this.accLeft ? this.xSpeed -= this.accel * t : this.accRight && (this.xSpeed += this.accel * t);
Math.abs(this.xSpeed) > this.maxMoveSpeed && (this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed));
this.node.x += this.xSpeed * t;
var e = this.node.parent.getComponent("Game").gameLevel;
if (this.node.x > this.node.parent.width / 2 + .7 * e) {
this.node.x = this.node.parent.width / 2 + .7 * e;
this.xSpeed = 0;
} else if (this.node.x < -this.node.parent.width / 2 - .7 * e) {
this.node.x = -this.node.parent.width / 2 - .7 * e;
this.xSpeed = 0;
}
}
});
cc._RF.pop();
}, {} ],
RedStar: [ function(t, e, i) {
"use strict";
cc._RF.push(e, "15cafr2gY1H/ZTHSw9tkry2", "RedStar");
cc.Class({
extends: cc.Component,
properties: {
pickRadius: 70,
game: null
},
start: function() {},
init: function(t) {
this.game = t;
this.enabled = !0;
},
onPicked: function() {
this.game.gameWin();
},
getPlayerDistance: function() {
var t = this.game.player.getPosition();
t.y += 1 * this.node.height / 2;
return this.node.position.sub(t).mag();
},
update: function(t) {
this.getPlayerDistance() < this.pickRadius && this.onPicked();
}
});
cc._RF.pop();
}, {} ],
ScoreAnim: [ function(t, e, i) {
"use strict";
cc._RF.push(e, "cbcc93fW59M6pdGY0rpAqm+", "ScoreAnim");
cc.Class({
extends: cc.Component,
init: function(t) {
this.scoreFX = t;
},
hideFX: function() {
this.scoreFX.despawn();
}
});
cc._RF.pop();
}, {} ],
ScoreFX: [ function(t, e, i) {
"use strict";
cc._RF.push(e, "3ca5eNeLZ9GcpahRQ3J3D1O", "ScoreFX");
cc.Class({
extends: cc.Component,
properties: {
anim: {
default: null,
type: cc.Animation
}
},
init: function(t) {
this.game = t;
this.anim.getComponent("ScoreAnim").init(this);
},
despawn: function() {
this.game.despawnScoreFX(this.node);
},
play: function() {
this.anim.play("score_pop");
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
pickRadius: 60
},
onLoad: function() {
this.enabled = !1;
},
init: function(t) {
this.game = t;
this.enabled = !0;
this.node.opacity = 255;
},
reuse: function(t) {
this.init(t);
},
onPicked: function() {
var t = this.node.getPosition();
this.game.gainScore(t);
this.game.despawnStar(this.node);
this.game.player.getComponent("Player").upgrade();
this.game.gameUpgrade();
},
getPlayerDistance: function() {
var t = this.game.player.getPosition();
t.y += 1 * this.node.height / 2;
return this.node.position.sub(t).mag();
},
update: function(t) {
if (this.getPlayerDistance() < this.pickRadius) this.onPicked(); else {
var e = 1 - this.game.timer / this.game.starDuration;
this.node.opacity = 50 + Math.floor(205 * e);
}
}
});
cc._RF.pop();
}, {} ],
bg: [ function(t, e, i) {
"use strict";
cc._RF.push(e, "4ad09ueAe1Gc4Q4qMnUq4i6", "bg");
cc.Class({
extends: cc.Component,
properties: {},
onLoad: function() {
console.log("get bg");
console.log(this.node._components[0]);
},
start: function() {}
});
cc._RF.pop();
}, {} ]
}, {}, [ "Game", "Player", "RedStar", "ScoreAnim", "ScoreFX", "Star", "bg" ]);