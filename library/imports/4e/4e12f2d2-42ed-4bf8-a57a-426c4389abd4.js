"use strict";
cc._RF.push(module, '4e12fLSQu1L+KV6QmxDiavU', 'Game');
// scripts/Game.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {

        gameTimer: {
            default: null,
            type: cc.Label
        },
        timeKeeper: null,

        gameCamera: {
            default: null,
            type: cc.Camera
        },

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
        iniStarDuration: 5,
        // 星星产生后消失时间的随机范围
        starDuration: 6,
        gameLevel: 0,
        cameraFarSpeed: 10, // 拉远镜头的等级频率

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
        thisJumpGetScore: false,
        scoreKeeper: 1,
        // score label 的引用
        scoreDisplay: {
            default: null,
            type: cc.Label
        },
        // 得分音效资源
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
            default: '',
            multiline: true
        },
        touchHint: {
            default: '',
            multiline: true
        }
    },

    onLoad: function onLoad() {

        var canvas = this.node;

        // 获取地平面的 y 轴坐标
        this.groundY = this.ground.y + this.ground.height / 2 - 10;

        // store last star's x position
        this.currentStar = null;
        this.currentStarX = 0;

        // 初始化计时器
        this.timer = 0;

        // is showing menu or running game
        this.enabled = false;

        // initialize control hint
        var hintText = cc.sys.isMobile ? this.touchHint : this.keyboardHint;
        this.controlHintLabel.string = hintText;

        // initialize star and score pool
        this.starPool = new cc.NodePool('Star');
        this.scorePool = new cc.NodePool('ScoreFX');

        this.spawnRedStar();
    },

    startGameTimer: function startGameTimer() {
        var time = 0;
        this.timeKeeper = setInterval(function () {
            time += 0.1;
            this.gameTimer.string = "Time: " + time.toFixed(1);
        }.bind(this), 100);
    },
    stopGameTimer: function stopGameTimer() {
        clearInterval(this.timeKeeper);
    },

    onStartGame: function onStartGame() {
        // 开始计时
        this.startGameTimer();
        // 初始化计分
        this.resetScore();
        // set game state to running
        this.enabled = true;
        // set button and gameover text out of screen
        this.btnNode.x = 3000;
        this.gameOverNode.active = false;
        this.youWinNode.active = false;
        // reset player position and move speed
        this.player.getComponent('Player').startMoveAt(0, this.groundY);
        // spawn star
        this.spawnNewStar();
    },

    spawnRedStar: function spawnRedStar() {
        var redStar = cc.instantiate(this.redStarPrefab);
        this.node.addChild(redStar);

        var randY = this.node.width / 2 - 240 - Math.random() * 10;
        var randX = (Math.random() - 0.5) * 2 * this.node.width / 2;
        redStar.setPosition(cc.v2(randX, randY));
        redStar.getComponent('RedStar').init(this);
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
        this.currentStar = newStar;
    },

    despawnStar: function despawnStar(star) {
        star.destroy();
        this.spawnNewStar();
    },


    startTimer: function startTimer() {
        // get a life duration for next star
        this.starDuration = this.iniStarDuration - this.gameLevel / 150;
        this.timer = 0;
    },

    getNewStarPosition: function getNewStarPosition() {
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
        var randY = this.groundY + Math.random() * this.player.getComponent('Player').jumpHeight + 30;
        // 根据屏幕宽度，随机得到一个星星 x 坐标
        var maxX = this.node.width / 2 + this.gameLevel * 0.6;

        var randX = (Math.random() - 0.5) * 2 * maxX;
        // 返回星星坐标
        return cc.v2(randX, randY);
    },

    gainScore: function gainScore(pos) {
        this.score += this.scoreKeeper;
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = 'Score: ' + this.score;

        this.thisJumpGetScore = true;

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
        // if (this.scorePool.size() > 0) {
        //     fx = this.scorePool.get();
        //     return fx.getComponent('ScoreFX');
        // } else {
        fx = cc.instantiate(this.scoreFXPrefab).getComponent('ScoreFX');
        fx.init(this);
        return fx;
        // }
    },

    despawnScoreFX: function despawnScoreFX(scoreFX) {
        this.scorePool.put(scoreFX);
    },


    gameUpgrade: function gameUpgrade() {
        this.gameLevel++;
        if (this.gameLevel % this.cameraFarSpeed === 0) {
            this.modifyCamera();
        }
    },

    // 设置镜头
    modifyCamera: function modifyCamera() {
        var times = 0;
        var modify = setInterval(function () {
            this.gameCamera.zoomRatio *= 999 / 1000;
            times++;
            if (times == 11) {
                clearInterval(modify);
            }
        }.bind(this), 25);
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
        this.youWinNode.active = true;
        this.stopGameTimer();
        this.player.getComponent('Player').stopMove();
        this.enabled = false;
        this.btnNode.x = 0;
    },

    gameOver: function gameOver() {
        this.stopGameTimer();
        this.gameOverNode.active = true;
        this.player.getComponent('Player').stopMove();
        this.player.getComponent('Player').initProperties();
        this.currentStar.destroy();
        this.btnNode.x = 0;
        this.gameLevel = 0;
        this.gameCamera.zoomRatio = 1;
    }
});

cc._RF.pop();