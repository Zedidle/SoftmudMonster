(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/Game.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '4e12fLSQu1L+KV6QmxDiavU', 'Game', __filename);
// scripts/Game.js

'use strict';

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

cc.Class({
    extends: cc.Component,

    properties: {

        bgm: {
            default: null,
            type: cc.AudioClip
        },

        title: {
            default: null,
            type: cc.Node
        },

        bgs: {
            default: null,
            type: cc.Node
        },
        gameTimer: {
            default: null,
            type: cc.Label
        },

        gameCamera: {
            default: null,
            type: cc.Camera
        },
        starNumber: 1,
        currentStarNumber: 1,
        currentStars: [],
        mostHit: 0,

        // 这个属性引用了星星预制资源
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

        rankList: {
            default: null,
            type: cc.Label
        },
        // 地面节点，用于确定星星生成的高度
        ground: {
            default: null,
            type: cc.Node
        },
        // player 节点，用于获取主角弹跳的高度，和控制主角行动开关
        player: {
            default: null,
            type: cc.Node
        },
        twiceJumpGetScore: 0,
        scoreKeeper: 1,
        // score label 的引用
        scoreDisplay: {
            default: null,
            type: cc.Label
        },

        farCameraAudio: {
            default: null,
            type: cc.AudioClip
        },
        // 得分音效资源
        scoreAudio: {
            default: null,
            type: cc.AudioClip
        },

        menuNode: {
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
            default: '',
            multiline: true
        },
        touchHint: {
            default: '',
            multiline: true
        },
        winScoreLabel: {
            default: null,
            type: cc.Label
        },
        gameWinAudio: {
            default: null,
            type: cc.AudioClip
        },
        gameOverAudio: {
            default: null,
            type: cc.AudioClip
        }
    },

    onLoad: function onLoad() {

        cc.audioEngine.playEffect(this.bgm, true);

        this.redStar = null;
        this.timeKeeper = null;

        this.menuToFirstPanel();
        this.iniBg();

        // 获取地平面的 y 轴坐标
        this.groundY = this.ground.y + this.ground.height / 2 - 10;

        // store last star's x position
        this.currentStarX = 0;

        // is showing menu or running game
        this.enabled = false;

        // initialize control hint
        this.controlHintLabel.string = "操作说明：\n" + (cc.sys.isMobile ? this.touchHint : this.keyboardHint);

        // initialize star and score pool
        this.starPool = new cc.NodePool('Star');
        this.scorePool = new cc.NodePool('ScoreFX');
    },
    initGame: function initGame() {
        this.iniStarDuration = 6;
        this.starDuration = 0;
        this.gameLevel = 0;
        this.cameraFarSpeed = 10; // 拉远镜头频率
        this.starMoreSpeed = 30; // 星星增加频率
        this.time = 0;
        this.score = 0;
        this.scoreKeeper = 1, this.currentStarNumber = 1;
        this.mostHit = 0;
        this.starNumber = 1;
        this.gameCamera.zoomRatio = 1;
    },
    startGame: function startGame() {

        this.title.active = false;
        this.initGame();
        this.iniBg();
        // 开始计时
        this.startGameTimer();
        // 初始化计分
        this.resetScore();
        // set game state to running
        this.enabled = true;
        // set button and gameover text out of screen
        this.menuNode.active = false;
        this.gameOverNode.active = false;
        this.youWinNode.active = false;
        // reset player position and move speed
        this.player.getComponent('Player').startMoveAt(0, this.groundY);

        this.spawnNewStar();
        this.spawnRedStar();
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
    menuToAttribute: function menuToAttribute() {
        var c = this.menuHideAll();
        c[1].active = true;
    },
    menuToShop: function menuToShop() {
        var c = this.menuHideAll();
        c[2].active = true;
    },
    menuToGuide: function menuToGuide() {
        var c = this.menuHideAll();
        c[3].active = true;
    },
    menuToRank: function menuToRank() {
        var _this = this;

        var c = this.menuHideAll();
        c[4].active = true;
        _axios2.default.get('/ranklist').then(function (response) {
            console.log(response);
            _this.rankList.string = response.data;
        }).catch(function (error) {
            console.log(error);
        });
    },
    menuToAbout: function menuToAbout() {
        var c = this.menuHideAll();
        c[5].active = true;
    },
    iniBg: function iniBg() {
        this.bgs.zIndex = -10;
        this.bgs.scale = 1;
        console.log(this.bgs);
        console.log(this.bgs.scale);

        var bgChildren = this.bgs.children;
        var l = bgChildren.length;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = bgChildren[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var i = _step2.value;

                i.active = false;
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

        bgChildren[Math.floor(Math.random() * l)].active = true;
    },
    startGameTimer: function startGameTimer() {
        this.timeKeeper = setInterval(function () {
            this.time += 0.01;
            this.gameTimer.string = "Time: " + this.time.toFixed(2);
        }.bind(this), 10);
    },
    stopGameTimer: function stopGameTimer() {
        clearInterval(this.timeKeeper);
    },
    spawnRedStar: function spawnRedStar() {
        this.redStar = cc.instantiate(this.redStarPrefab);
        this.node.addChild(this.redStar);

        var destHeight = this.node.height / 2 - this.redStar.height / 2;
        var randY = this.groundY + this.player.getComponent('Player').jumpHeight + 120;
        var randX = (Math.random() - 0.5) * 2 * (this.node.width / 2 - this.redStar.height / 2);
        this.redStar.setPosition(cc.v2(randX, randY));
        this.redStar.getComponent('RedStar').init(this);

        var t = this;
        (function rising() {
            setTimeout(function () {
                t.redStar.setPosition(cc.v2(randX, randY));
                randY++;
                if (randY < destHeight) rising();
            }, 600);
        })();
    },
    spawnNewStar: function spawnNewStar() {
        var newStar = null;
        // 使用给定的模板在场景中生成一个新节点
        if (this.starPool.size() > 0) {
            newStar = this.starPool.get(this); // this will be passed to Star's reuse method
        } else {
            newStar = cc.instantiate(this.starPrefab);
        }

        // 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(newStar);
        // 为星星设置一个随机位置
        newStar.setPosition(this.getNewStarPosition());
        // pass Game instance to star
        newStar.getComponent('Star').init(this);

        // start star timer and store star reference
        this.startTimer();
        this.currentStars.push(newStar);
    },
    despawnStar: function despawnStar(star) {
        star.destroy();
        this.currentStarNumber--;
        //如果当前场景中没有星星
        if (!this.currentStarNumber) {
            for (var i = 0; i < this.starNumber; i++) {
                this.spawnNewStar();
            }
            this.currentStarNumber = this.starNumber;
        }
    },
    startTimer: function startTimer() {
        this.starDuration = this.iniStarDuration - this.gameLevel / 150;
        this.timer = 0;
    },
    getNewStarPosition: function getNewStarPosition() {
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
        var randY = this.groundY + Math.random() * this.player.getComponent('Player').jumpHeight + 30;
        // 根据屏幕宽度，随机得到一个星星 x 坐标
        // var maxX = this.node.width/2 + this.gameLevel*0.3;
        var maxX = this.node.width / 2;
        var randX = (Math.random() - 0.5) * 2 * maxX;
        // 返回星星坐标
        // return cc.v2(randX, randY);
        return cc.v2(randX, randY);
    },
    gainScore: function gainScore(pos) {
        this.score += this.scoreKeeper;
        if (this.scoreKeeper > this.mostHit) {
            this.mostHit = this.scoreKeeper;
        }
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = 'Score: ' + this.score;

        this.twiceJumpGetScore = 2;

        // 播放特效
        var fx = this.spawnScoreFX();
        var theScoreShow = fx.node.children[0].children[1]._components[0];
        theScoreShow._string = "+" + this.scoreKeeper;
        this.node.addChild(fx.node);
        fx.node.setPosition(pos);
        fx.play();

        // 播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);
        this.scoreKeeper++;
    },
    resetScore: function resetScore() {
        this.score = 0;
        this.scoreDisplay.string = 'Score: ' + this.score;
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
        this.gameLevel++;
        if (this.gameLevel % this.cameraFarSpeed === 0) {
            // this.farCamera();
            // 缩小背景图
            // this.bgs.
            this.farBg();
            // console.log(this.bgs.scale)
            // this.bgs.scale *= 0.9;
        }
        if (this.gameLevel < 21 && this.gameLevel % 10 === 0) {
            this.starNumber++;
        }
        if (this.gameLevel % this.starMoreSpeed === 0) {
            this.starNumber++;
            this.iniStarDuration += 0.7;
        }
    },
    farBg: function farBg() {
        var times = 0;
        // this.bgs.scale *= 0.9;
        var modify = setInterval(function () {
            this.bgs.scale *= 999 / 1000;
            // this.gameCamera.zoomRatio *= (999 / 1000);
            times++;
            if (times == 10) {
                clearInterval(modify);
            }
        }.bind(this), 50);
        cc.audioEngine.playEffect(this.farCameraAudio, false);
    },


    // 设置镜头
    farCamera: function farCamera() {
        var times = 0;
        var modify = setInterval(function () {
            this.gameCamera.zoomRatio *= 999 / 1000;
            times++;
            if (times == 8) {
                clearInterval(modify);
            }
        }.bind(this), 50);
        cc.audioEngine.playEffect(this.farCameraAudio, false);
    },
    update: function update(dt) {
        // 每帧更新计时器，超过限度还没有生成新的星星
        // 就会调用游戏失败逻辑
        if (this.timer > this.starDuration) {
            this.gameOver();
            this.enabled = false; // disable gameOver logic to avoid load scene repeatedly
            return;
        }
        this.timer += dt;
    },
    gameWin: function gameWin() {
        this.finalScore = (Math.pow(300 / this.time.toFixed(2), 2).toFixed(2) * this.score).toFixed(1) * 10;
        this.winScoreLabel.string = 'Final Score: ' + this.finalScore + '\n' + "Most Hit: " + this.mostHit;

        // this.youWinNode.children[0]._components[0]._string = 'Final Score: '+ this.finalScore + '\n' + "Most Hit: "+this.mostHit;
        this.youWinNode.active = true;
        this.again();
        cc.audioEngine.playEffect(this.gameWinAudio, false);
    },
    gameOver: function gameOver() {
        this.gameOverNode.active = true;
        this.again();
        cc.audioEngine.playEffect(this.gameOverAudio, false);
    },
    again: function again() {
        this.sendScore();
        this.player.getComponent('Player').stopMove();
        this.stopGameTimer();
        this.menuNode.active = true;
        this.enabled = false;
        this.starPool.clear();
        this.redStar.destroy();
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = this.currentStars[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var i = _step3.value;

                i.destroy();
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        this.currentStars = [];
    },
    sendScore: function sendScore() {
        console.log(this.time);
        console.log(this.score);
        console.log(this.finalScore);
        var data = {
            // player:,
            time: this.time,
            score: this.score,
            finalScore: this.finalScore
        };
        _axios2.default.post('/sendScore', data).then(function (response) {
            console.log(response);
        }).catch(function (error) {
            console.log(error);
        });
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
        //# sourceMappingURL=Game.js.map
        