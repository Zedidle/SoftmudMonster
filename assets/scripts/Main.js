let UserDataManager = require("UserDataManager");
let AudioManager = require("AudioManager");
let WX = require("WX");

let Main = cc.Class({
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
        youWinNode: cc.Node,
    },

    statics: {
        instance: null
    },

    ctor() {
        if (!Main.instance) {
            Main.instance = this;
        }
    },

    onLoad() {
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

        this.spawnStar();
        this.spawnRedStar();
    },
    initGame() {
        this.starsDuration = 4;
        this.levelCount = 0;
        this.cameraFarSpeed = 10;  // 拉远镜头频率
        this.time = 0;
        this.score = 0;
        this.scoreKeeper = 1;
        this.currentStarNumber = 1;
        this.mostHit = 0;
        this.starNumber = 1;
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
    },
    menuToAbout() {
        let c = this.menuHideAll();
        c[5].active = true;
    },


    iniBg() {
        let bgNumber = 1;
        let bgIndex = Math.floor(Math.random() * bgNumber);
        cc.loader.loadRes("bgs/" + bgIndex, cc.SpriteFrame, (err, spriteFrame) => {
            if (err) console.error(err);
            this.bg.addComponent(cc.Sprite).spriteFrame = spriteFrame;
            this.bg.scale = 1.2;
        });
    },

    startGameTimer() {
        this.timeKeeper = setInterval(() => {
            this.time += 0.01;
            this.gameTimer.string = "Time: " + this.time.toFixed(2);
        }, 10);
    },
    stopGameTimer() {
        clearInterval(this.timeKeeper);
    },

    spawnRedStar() {
        this.redStar = cc.instantiate(this.redStarPrefab);
        this.node.addChild(this.redStar);

        let destY = this.node.height / 2 - this.redStar.height / 2;
        let startY = this.groundY + this.player.getComponent('Player').jumpHeight + 150;
        let startX = (Math.random() - 0.5) * 0.9 * this.node.width;
        this.redStar.setPosition(cc.v2(startX, startY));
        this.redStar.getComponent('RedStar').init(this);

        let yDistance = destY - startY;
        this.redStar.runAction(cc.moveBy(yDistance * 0.6, 0, destY));

        let roadWidth = this.node.width * 0.9;
        let totalTime = 20;
        let speed = roadWidth / totalTime;
        let time = (roadWidth / 2 - startX) / speed;
        this.redStar.runAction(cc.sequence(
            cc.moveTo(time, roadWidth * 0.45, 0),
            cc.callFunc(() => {
                this.redStar.runAction(
                    cc.repeatForever(cc.sequence(
                        cc.moveTo(totalTime, -roadWidth * 0.45, 0),
                        cc.moveTo(totalTime, roadWidth * 0.45, 0)
                    ))
                )
            })
        ));
    },

    spawnStar() {
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
        let v2 = cc.v2(randX, randY);
        star.setPosition(v2);
        star.getComponent('Star').init(this);

        this.timer = 0;
        this.currentStars.push(star);
    },

    despawnStar(star) {
        this.starPool.put(star);
        this.currentStarNumber--;
        if (this.currentStarNumber === 0) {
            for (let i = 0; i < this.starNumber; i++) {
                this.spawnStar();
            }
            this.currentStarNumber = this.starNumber;
        }
    },

    gainScore(pos) {
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
    resetScore() {
        this.score = 0;
        this.scoreLabel.string = 'Score: ' + this.score;
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
        this.levelCount++;
        if (this.levelCount % (5 * this.starNumber) === 0) {
            this.farBg();
            this.levelCount = 0;
            this.starNumber++;
            this.starsDuration += 0.2;
        }
    },

    farBg() {
        this.bg.runAction(cc.scaleBy(0.5, 0.95));
        AudioManager.instance.play("farCamera", false);
    },

    update(dt) {
        if (this.timer > this.starsDuration) {
            this.gameOver();
            this.enabled = false;
            return;
        }
        this.timer += dt;
    },

    gameWin() {
        this.youWinNode.active = true;
        this.again();
        AudioManager.instance.play("gameWin", false);
    },

    gameOver() {
        this.gameOverNode.active = true;
        this.again();
        AudioManager.instance.play("gameOver", false);
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