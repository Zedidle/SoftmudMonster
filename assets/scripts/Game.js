cc.Class({
    extends: cc.Component,

    properties: {
        bgs:{
            default:null,
            type:cc.Node
        },
        gameTimer:{
            default:null,
            type: cc.Label
        },
        timeKeeper:null,

        gameCamera:{
            default:null,
            type:cc.Camera
        },
        starNumber:1,
        currentStarNumber:1,
        currentStars:[],
        // 这个属性引用了星星预制资源
        starPrefab: {
            default: null,
            type: cc.Prefab
        },
        redStar:null,
        redStarPrefab: {
            default: null,
            type: cc.Prefab
        },
        scoreFXPrefab: {
            default: null,
            type: cc.Prefab
        },
        iniStarDuration:5,
        starDuration: 0,   // 星星产生后消失时间的随机范围

        gameLevel:0,
        cameraFarSpeed:10,  // 拉远镜头的等级频率
        starMoreSpeed:20,  // 星星数量增加的频率

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
        thisJumpGetScore:false,
        scoreKeeper:1,
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
        gameWinAudio: {
            default: null,
            type: cc.AudioClip
        },
        gameOverAudio: {
            default: null,
            type: cc.AudioClip
        },
    },

    onLoad: function () {

    	this.menuToFirstPanel();


        this.iniBg();
        let canvas = this.node;

        // 获取地平面的 y 轴坐标
        this.groundY = this.ground.y + this.ground.height/2 - 10;

        // store last star's x position
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
    },

    // 关于菜单部分
    menuHideAll:function(){
    	let c = this.menuNode.children;
    	for(let i of c){
    		i.active = false;
    	}
    	return c;
    },
    menuToFirstPanel:function(){
    	let c = this.menuHideAll();
    	c[0].active = true;
    },
    menuToAttribute:function(){
    	let c = this.menuHideAll();
    	c[1].active = true;
    },


    iniBg: function(){
        this.bgs.zIndex = -10;
        let bgChildren = this.bgs.children;
        let l = bgChildren.length;
        for(let i of bgChildren){
            i.active = false;
        }
        bgChildren[Math.floor(Math.random()*l)].active = true;
    },

    startGameTimer: function(){
        let time = 0;
        this.timeKeeper = setInterval(function(){
            time += 0.01;
            this.gameTimer.string = "Time: " + time.toFixed(2); 
        }.bind(this),10);
    },
    stopGameTimer:function(){
        clearInterval(this.timeKeeper);
    },

    onStartGame: function () {
        
        this.iniBg();
        this.gameCamera.zoomRatio = 1;
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
        this.player.getComponent('Player').startMoveAt(0,this.groundY);
        // spawn star

        this.starNumber = 1;
        this.starMoreSpeed = 20;
        this.spawnNewStar();
        this.spawnRedStar();
    },

    spawnRedStar:function(){
        this.redStar = cc.instantiate(this.redStarPrefab);
        this.node.addChild(this.redStar);

        var randY = 500;
        var randX = (Math.random() - 0.5) * 2 * this.node.width/2;
        this.redStar.setPosition(cc.v2(randX, randY));
        this.redStar.getComponent('RedStar').init(this);
    },

    spawnNewStar: function() {
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

    despawnStar (star) {
        star.destroy();
        this.currentStarNumber--;
        //如果当前场景中没有星星
        if(!this.currentStarNumber){
            for(let i=0;i<this.starNumber;i++){
                this.spawnNewStar();
            }
            this.currentStarNumber = this.starNumber;
        }
    },

    startTimer: function () {
        // get a life duration for next star
        this.starDuration = this.iniStarDuration - this.gameLevel / 150;
        this.timer = 0;
    },

    getNewStarPosition: function () {
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
        var randY = this.groundY + Math.random() * this.player.getComponent('Player').jumpHeight + 30;
        // 根据屏幕宽度，随机得到一个星星 x 坐标
        var maxX = this.node.width/2 + this.gameLevel*0.6;

        var randX = (Math.random() - 0.5) * 2 * maxX;
        // 返回星星坐标
        return cc.v2(randX, randY);
    },


    gainScore: function (pos) {
        this.score += this.scoreKeeper;
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = 'Score: ' + this.score;

        this.thisJumpGetScore = true;

        // 播放特效
        var fx = this.spawnScoreFX();
        var theScoreShow = fx.node.children[0].children[1]._components[0];
        theScoreShow._string = "+"+this.scoreKeeper;
        this.node.addChild(fx.node);
        fx.node.setPosition(pos);
        fx.play();
        
        // 播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);

        this.scoreKeeper++;
    },
    resetScore: function () {
        this.score = 0;
        this.scoreDisplay.string = 'Score: ' + this.score;
    },

    spawnScoreFX: function () {
        var fx;
        fx = cc.instantiate(this.scoreFXPrefab).getComponent('ScoreFX');
        fx.init(this);
        return fx;
    },

    despawnScoreFX (scoreFX) {
        this.scorePool.put(scoreFX);
    },

    gameUpgrade:function(){
        this.gameLevel++;
        if(this.gameLevel%this.cameraFarSpeed === 0){
            this.modifyCamera();
        }
        if(this.gameLevel%this.starMoreSpeed === 0){
            this.starNumber ++;
            this.iniStarDuration += 0.5;
        }
    },

    // 设置镜头
    modifyCamera:function(){
        let times = 0;
        let modify = setInterval(function(){
            this.gameCamera.zoomRatio *= (999 / 1000);
            times++;
            if(times==11){
                clearInterval(modify);
            }
        }.bind(this),40)
    },

    update: function (dt) {
        // 每帧更新计时器，超过限度还没有生成新的星星
        // 就会调用游戏失败逻辑
        if (this.timer > this.starDuration) {
            this.gameOver();
            this.enabled = false;   // disable gameOver logic to avoid load scene repeatedly
            return;
        }
        this.timer += dt;
    },

    gameWin: function(){
        this.youWinNode.active = true;
        this.again();
        
        // 播放胜利音效
        cc.audioEngine.playEffect(this.gameWinAudio, false);
    },

    gameOver: function () {
        this.gameOverNode.active = true;
        this.again();

        // 播放失败音效
        cc.audioEngine.playEffect(this.gameOverAudio, false);
    },


    again:function(){
        this.player.getComponent('Player').stopMove();
        this.stopGameTimer();
        this.gameLevel = 0;
        this.iniStarDuration = 6;
        this.menuNode.active = true;
        this.enabled = false;
        this.currentStarNumber = 1;
        this.starPool.clear();
        this.redStar.destroy();
        for(let i of this.currentStars){
            i.destroy();
        }
        this.currentStars = [];
    }

});