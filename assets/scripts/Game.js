let UserDataManager = require("UserDataManager");

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
        ground: {
            default: null,
            type: cc.Node
        },
        player: {
            default: null,
            type: cc.Node
        },
        twiceJumpGetScore: 0,
        scoreKeeper: 1,
        scoreDisplay: {
            default: null,
            type: cc.Label
        },

        farCameraAudio: {
            default: null,
            type: cc.AudioClip
        },
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
        },
    },

    onLoad() {

        UserDataManager.loadData();

        cc.audioEngine.playEffect(this.bgm, true);

        this.redStar = null;
        this.timeKeeper = null;

        this.menuToFirstPanel();
        this.iniBg();

        this.groundY = this.ground.y + this.ground.height / 2 - 10;

        this.currentStarX = 0;

        this.enabled = false;

        this.controlHintLabel.string = "操作说明：\n" + (cc.sys.isMobile ? this.touchHint : this.keyboardHint);
        this.starPool = new cc.NodePool('Star');
        this.scorePool = new cc.NodePool('ScoreFX');
    },

    initGame() {
        this.iniStarDuration = 6;
        this.starDuration = 0;
        this.gameLevel = 0;
        this.cameraFarSpeed = 10;  // 拉远镜头频率
        this.starMoreSpeed = 30;   // 星星增加频率
        this.time = 0;
        this.score = 0;
        this.scoreKeeper = 1,
            this.currentStarNumber = 1;
        this.mostHit = 0;
        this.starNumber = 1;
        this.gameCamera.zoomRatio = 1;
    },

    startGame() {

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

        this.spawnNewStar();
        this.spawnRedStar();
    },

    // 关于菜单部分
    menuHideAll() {
        let c = this.menuNode.children;
        for (let i of c) i.active = false;
        return c;
    },
    menuToFirstPanel() {
        let c = this.menuHideAll();
        c[0].active = true;
    },
    // menuToAttribute() {
    //     let c = this.menuHideAll();
    //     c[1].active = true;
    // },
    menuToShop() {
        let c = this.menuHideAll();
        c[2].active = true;
    },
    menuToGuide() {
        let c = this.menuHideAll();
        c[3].active = true;
    },
    menuToRank() {
        let c = this.menuHideAll();
        c[4].active = true;
        axios.get('/ranklist')
            .then(response => {
                console.log(response);
                this.rankList.string = response.data;
            })
            .catch(error => {
                console.log(error)
            })
    },
    menuToAbout() {
        let c = this.menuHideAll();
        c[5].active = true;
    },


    iniBg() {
        this.bgs.zIndex = -10;
        this.bgs.scale = 1;
        console.log(this.bgs);
        console.log(this.bgs.scale)

        let bgChildren = this.bgs.children;
        let l = bgChildren.length;
        for (let i of bgChildren) {
            i.active = false;
        }
        bgChildren[Math.floor(Math.random() * l)].active = true;
    },

    startGameTimer() {
        this.timeKeeper = setInterval(function () {
            this.time += 0.01;
            this.gameTimer.string = "Time: " + this.time.toFixed(2);
        }.bind(this), 10);
    },
    stopGameTimer() {
        clearInterval(this.timeKeeper);
    },


    spawnRedStar() {
        this.redStar = cc.instantiate(this.redStarPrefab);
        this.node.addChild(this.redStar);

        let destY = this.node.height / 2 - this.redStar.height / 2;
        let startY = this.groundY + this.player.getComponent('Player').jumpHeight + 150;
        let startX = (Math.random() - 0.5) * 2 * (this.node.width / 2 - this.redStar.height / 2);
        this.redStar.setPosition(cc.v2(startX, startY));
        this.redStar.getComponent('RedStar').init(this);

        let yDistance = destY - startY;
        this.redStar.runAction(cc.moveBy(yDistance * 0.6, 0, destY));

        // let t = this;
        // (function rising() {
        //     setTimeout(function () {
        //         t.redStar.setPosition(cc.v2(startX, startY));
        //         startY++;
        //         if (startY < destY) rising();
        //     }, 600);
        // })();
    },

    spawnNewStar() {
        var newStar = null;
        if (this.starPool.size() > 0) {
            newStar = this.starPool.get(this);
            console.log("Game-spawnNewStart form startPool");
        } else {
            newStar = cc.instantiate(this.starPrefab);
        }

        this.node.addChild(newStar);
        newStar.setPosition(this.getNewStarPosition());
        newStar.getComponent('Star').init(this);

        this.startTimer();
        this.currentStars.push(newStar);
    },

    despawnStar(star) {
        this.starPool.put(star);
        this.currentStarNumber--;
        if (this.currentStarNumber === 0) {
            for (let i = 0; i < this.starNumber; i++) {
                this.spawnNewStar();
            }
            this.currentStarNumber = this.starNumber;
        }
    },

    startTimer() {
        this.starDuration = this.iniStarDuration - this.gameLevel / 150;
        this.timer = 0;
    },

    getNewStarPosition() {
        var randY = this.groundY + Math.random() * this.player.getComponent('Player').jumpHeight + 30;
        var maxX = this.node.width / 2;
        var randX = (Math.random() - 0.5) * 2 * maxX;
        return cc.v2(randX, randY);
    },


    gainScore(pos) {
        this.score += this.scoreKeeper;
        if (this.scoreKeeper > this.mostHit) {
            this.mostHit = this.scoreKeeper;
        }
        this.scoreDisplay.string = 'Score: ' + this.score;
        this.twiceJumpGetScore = 2;

        var fx = this.spawnScoreFX();
        var theScoreShow = fx.node.children[0].children[1]._components[0];
        theScoreShow._string = "+" + this.scoreKeeper;
        this.node.addChild(fx.node);
        fx.node.setPosition(pos);
        fx.play();

        cc.audioEngine.playEffect(this.scoreAudio, false);
        this.scoreKeeper++;
    },
    resetScore() {
        this.score = 0;
        this.scoreDisplay.string = 'Score: ' + this.score;
    },

    spawnScoreFX() {
        var fx;
        fx = cc.instantiate(this.scoreFXPrefab).getComponent('ScoreFX');
        fx.init(this);
        return fx;
    },

    despawnScoreFX(scoreFX) {
        this.scorePool.put(scoreFX);
    },

    gameUpgrade() {
        this.gameLevel++;
        if (this.gameLevel % this.cameraFarSpeed === 0) {
            this.farBg();
        }
        if (this.gameLevel < 21 && this.gameLevel % 10 === 0) {
            this.starNumber++;
        }
        if (this.gameLevel % this.starMoreSpeed === 0) {
            this.starNumber++;
            this.iniStarDuration += 0.7;
        }
    },

    farBg() {
        let times = 0;
        let modify = setInterval(function () {
            this.bgs.scale *= (999 / 1000);
            times++;
            if (times == 10) {
                clearInterval(modify);
            }
        }.bind(this), 50)
        cc.audioEngine.playEffect(this.farCameraAudio, false);
    },

    update(dt) {
        if (this.timer > this.starDuration) {
            this.gameOver();
            this.enabled = false;
            return;
        }
        this.timer += dt;
    },

    gameWin() {
        this.finalScore = (Math.pow((300 / this.time.toFixed(2)), 2).toFixed(2) * this.score).toFixed(0);
        this.winScoreLabel.string = 'Final Score: ' + this.finalScore + '\n' + "Most Hit: " + this.mostHit;

        this.youWinNode.active = true;
        this.again();
        cc.audioEngine.playEffect(this.gameWinAudio, false);
    },

    gameOver() {
        this.gameOverNode.active = true;
        this.again();
        cc.audioEngine.playEffect(this.gameOverAudio, false);
    },

    again() {
        this.sendScore();
        this.player.getComponent('Player').stopMove();
        this.stopGameTimer();
        this.menuNode.active = true;
        this.enabled = false;
        this.starPool.clear();
        this.redStar.destroy();
        for (let i of this.currentStars) {
            i.destroy();
        }
        this.currentStars = [];
    },
    sendScore() {
        console.log("Game-sendScore");
    }

});