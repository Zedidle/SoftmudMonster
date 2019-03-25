"use strict";
cc._RF.push(module, '85488zELFpAyo8BX+KFSkuO', 'Main');
// scripts/Main.js

"use strict";

var UserDataManager = require("UserDataManager");
var AudioManager = require("AudioManager");
var WX = require("WX");

var Main = cc.Class({
    extends: cc.Component,

    properties: {
        bg: cc.Node,
        title: cc.Node,
        gameTimer: cc.Label,
        starPrefab: cc.Prefab,
        redStarPrefab: cc.Prefab,
        scoreFXPrefab: cc.Prefab,
        ground: cc.Node,
        player: cc.Node,
        scoreLabel: cc.Label,
        menuNode: cc.Node,
        gameOverNode: cc.Node,
        youWinNode: cc.Node
    },

    statics: {
        instance: null
    },

    ctor: function ctor() {
        if (!Main.instance) {
            Main.instance = this;
        }
    },
    onLoad: function onLoad() {
        this.starNumber = 1;
        this.currentStarNumber = 1;
        this.currentStars = [];
        this.mostHit = 0;
        this.twiceJumpGetScore = 0;
        this.scoreKeeper = 1;

        WX.login();
        UserDataManager.loadData();

        AudioManager.instance.play("bgm", true);

        this.redStar = null;
        this.timeKeeper = null;

        this.menuToFirstPanel();
        this.iniBg();

        this.groundY = this.ground.y + this.ground.height / 2 - 10;

        this.currentStarX = 0;
        this.enabled = false;

        this.starPool = new cc.NodePool('Star');
        this.scorePool = new cc.NodePool('ScoreFX');
    },
    startGame: function startGame() {
        this.title.active = false;
        this.initGame();
        this.iniBg();
        this.startGameTimer();
        this.resetScore();
        this.enabled = true;
        this.menuNode.active = false;
        this.gameOverNode.active = false;
        this.youWinNode.active = false;
        this.player.getComponent('Player').startMoveAt(0, this.groundY);

        this.spawnStar();
        this.spawnRedStar();
    },
    initGame: function initGame() {
        this.starsDuration = 4;
        this.levelCount = 0;
        this.cameraFarSpeed = 10; // 拉远镜头频率
        this.time = 0;
        this.score = 0;
        this.scoreKeeper = 1;
        this.currentStarNumber = 1;
        this.mostHit = 0;
        this.starNumber = 1;
    },

    // 关于菜单部分
    menuHideAll: function menuHideAll() {
        var c = this.menuNode.children;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = c[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var i = _step.value;
                i.active = false;
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return c;
    },
    menuToFirstPanel: function menuToFirstPanel() {
        var c = this.menuHideAll();
        c[0].active = true;
    },

    // menuToAttribute() {
    //     let c = this.menuHideAll();
    //     c[1].active = true;
    // },
    menuToShop: function menuToShop() {
        var c = this.menuHideAll();
        c[2].active = true;
    },
    menuToGuide: function menuToGuide() {
        var c = this.menuHideAll();
        c[3].active = true;
    },
    menuToRank: function menuToRank() {
        var c = this.menuHideAll();
        c[4].active = true;
    },
    menuToAbout: function menuToAbout() {
        var c = this.menuHideAll();
        c[5].active = true;
    },
    iniBg: function iniBg() {
        var _this = this;

        var bgNumber = 1;
        var bgIndex = Math.floor(Math.random() * bgNumber);
        cc.loader.loadRes("bgs/" + bgIndex, cc.SpriteFrame, function (err, spriteFrame) {
            if (err) console.error(err);
            _this.bg.addComponent(cc.Sprite).spriteFrame = spriteFrame;
            _this.bg.scale = 1.2;
        });
    },
    startGameTimer: function startGameTimer() {
        var _this2 = this;

        this.timeKeeper = setInterval(function () {
            _this2.time += 0.01;
            _this2.gameTimer.string = "Time: " + _this2.time.toFixed(2);
        }, 10);
    },
    stopGameTimer: function stopGameTimer() {
        clearInterval(this.timeKeeper);
    },
    spawnRedStar: function spawnRedStar() {
        var _this3 = this;

        this.redStar = cc.instantiate(this.redStarPrefab);
        this.node.addChild(this.redStar);

        var destY = this.node.height / 2 - this.redStar.height / 2;
        var startY = this.groundY + this.player.getComponent('Player').jumpHeight + 150;
        var startX = (Math.random() - 0.5) * 0.9 * this.node.width;
        this.redStar.setPosition(cc.v2(startX, startY));
        this.redStar.getComponent('RedStar').init(this);

        var yDistance = destY - startY;
        this.redStar.runAction(cc.moveBy(yDistance * 0.6, 0, destY));

        var roadWidth = this.node.width * 0.9;
        var totalTime = 20;
        var speed = roadWidth / totalTime;
        var time = (roadWidth / 2 - startX) / speed;
        this.redStar.runAction(cc.sequence(cc.moveTo(time, roadWidth * 0.45, 0), cc.callFunc(function () {
            _this3.redStar.runAction(cc.repeatForever(cc.sequence(cc.moveTo(totalTime, -roadWidth * 0.45, 0), cc.moveTo(totalTime, roadWidth * 0.45, 0))));
        })));
    },
    spawnStar: function spawnStar() {
        var star = null;
        if (this.starPool.size() > 0) {
            star = this.starPool.get(this);
            console.log("Game-spawnStar form startPool");
        } else {
            star = cc.instantiate(this.starPrefab);
        }

        this.node.addChild(star);
        var randY = this.groundY + Math.random() * this.player.getComponent('Player').jumpHeight + 30;
        var randX = (Math.random() - 0.5) * 0.9 * this.node.width;
        var v2 = cc.v2(randX, randY);
        star.setPosition(v2);
        star.getComponent('Star').init(this);

        this.timer = 0;
        this.currentStars.push(star);
    },
    despawnStar: function despawnStar(star) {
        this.starPool.put(star);
        this.currentStarNumber--;
        if (this.currentStarNumber === 0) {
            for (var i = 0; i < this.starNumber; i++) {
                this.spawnStar();
            }
            this.currentStarNumber = this.starNumber;
        }
    },
    gainScore: function gainScore(pos) {
        this.score += this.scoreKeeper;
        if (this.scoreKeeper > this.mostHit) {
            this.mostHit = this.scoreKeeper;
        }
        this.scoreLabel.string = 'Score: ' + this.score;
        this.twiceJumpGetScore = 2;

        var fx = this.spawnScoreFX();
        var theScoreShow = fx.node.children[0].children[1]._components[0];
        theScoreShow._string = "+" + this.scoreKeeper;
        this.node.addChild(fx.node);
        fx.node.setPosition(pos);
        fx.play();

        AudioManager.instance.play("addScore", false);
        this.scoreKeeper++;
    },
    resetScore: function resetScore() {
        this.score = 0;
        this.scoreLabel.string = 'Score: ' + this.score;
    },
    spawnScoreFX: function spawnScoreFX() {
        var fx;
        fx = cc.instantiate(this.scoreFXPrefab).getComponent('ScoreFX');
        fx.init(this);
        return fx;
    },
    despawnScoreFX: function despawnScoreFX(scoreFX) {
        this.scorePool.put(scoreFX);
    },
    gameUpgrade: function gameUpgrade() {
        this.levelCount++;
        if (this.levelCount % (5 * this.starNumber) === 0) {
            this.farBg();
            this.levelCount = 0;
            this.starNumber++;
            this.starsDuration += 0.2;
        }
    },
    farBg: function farBg() {
        this.bg.runAction(cc.scaleBy(0.5, 0.95));
        AudioManager.instance.play("farCamera", false);
    },
    update: function update(dt) {
        if (this.timer > this.starsDuration) {
            this.gameOver();
            this.enabled = false;
            return;
        }
        this.timer += dt;
    },
    gameWin: function gameWin() {
        this.youWinNode.active = true;
        this.again();
        AudioManager.instance.play("gameWin", false);
    },
    gameOver: function gameOver() {
        this.gameOverNode.active = true;
        this.again();
        AudioManager.instance.play("gameOver", false);
    },
    again: function again() {
        this.sendScore();
        this.player.getComponent('Player').stopMove();
        this.stopGameTimer();
        this.menuNode.active = true;
        this.enabled = false;
        this.starPool.clear();
        this.redStar.destroy();
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = this.currentStars[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var i = _step2.value;

                i.destroy();
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        this.currentStars = [];
    },
    sendScore: function sendScore() {
        console.log("Game-sendScore");
    }
});

cc._RF.pop();