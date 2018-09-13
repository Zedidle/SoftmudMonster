cc.Class({
    extends: cc.Component,
    
    properties: {

        controller:{
            default:null,
            type:cc.Node
        },


        sur:{
            default:null,
            type:cc.Label
        },
        playerJumpDurationValue:{
            default:null,
            type:cc.Label
        },
        playerAccelValue:{
            default:null,
            type:cc.Label
        },
        player_sur:0,
        player_jumpDuration:10,
        player_accel:10,

        // attrSucc:false,  //是否成功修改属性
        canAttrAudio:{
            default:null,
            type:cc.AudioClip
        },
        cannotAttrAudio:{
            default:null,
            type:cc.AudioClip
        },
        // 跳跃音效资源
        jumpAudio: {
            default: null,
            type: cc.AudioClip
        },
        jumpActionArray:[],
        switchJumpStyleAudio: {
            default: null,
            type: cc.AudioClip
        },
        jumpInterval:null,
        jumpStyleIndex:0,

        jumpStyles:null,
        jumpStylesLength:0,
        // jumpStyle label 的引用
        jumpStyleDisplay: {
            default: null,
            type: cc.Label
        },
    },

    onLoad: function() {
        this.enabled = false;
        // screen boundaries
        this.minPosX = -this.node.parent.width/2;
        this.maxPosX = this.node.parent.width/2;

        this.jumpStyles = this.getJumpStyles();
        this.jumpStylesLength = this.jumpStyles.length;

        this.initInput();
    },

    initInput:function(){
        // 初始化键盘输入监听
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        // 手机触摸屏
        var touchReceiver = this.controller;
        touchReceiver.on('touchstart', this.onTouchStart, this);
        touchReceiver.on('touchend', this.onTouchEnd, this); 
    },

    initAttr:function(){
        this.height=0; //初始高度
        this.jumpHeight=120; // 主角跳跃高度
        this.jumpDuration=0.3;  // 主角跳跃持续时间
        this.accel=400; // 加速度
        this.squashDuration = 0.03; // 辅助形变动作时间
        this.maxMoveSpeed = 3000; // 最大移动速度
    
        this.rise_jumpHeight = 0.8;
        this.rise_jumpDuration = 0.0006;
        this.rise_accel = 3;
    },        
    upgrade: function(){
        this.jumpHeight += (this.rise_jumpHeight);
        this.jumpDuration += this.rise_jumpDuration * (10 + this.player_jumpDuration) / 30;
        this.accel += this.rise_accel * (10 + this.player_accel) / 30;
    },
    canAddAttr(){
        if(this.player_sur < 1){
            return false;
        }else{
            this.player_sur--;
            return true;
        }
    },
    canSubAttr(){
        if(this.player_sur > 19){
            return false;   
        }else{
            this.player_sur++;
            return true;
        }
    },
    playAttrAudio(bool){
        cc.audioEngine.playEffect(this[bool?'canAttrAudio':'cannotAttrAudio'], false);
        return bool;
    },
    updatePlayerAttr(){
        this.sur.string = '剩余点数：' + this.player_sur;
        this.playerJumpDurationValue.string = this.player_jumpDuration;
        this.playerAccelValue.string = this.player_accel;
    },
    addPlayerJumpDuration(){
        if(this.playAttrAudio(this.player_jumpDuration<20&&this.canAddAttr())){
            this.player_jumpDuration++;   
            this.updatePlayerAttr();
        }
    },
    subPlayerJumpDuration(){
        console.log(this.node.children[0])
        if(this.playAttrAudio(this.player_jumpDuration>0&&this.canSubAttr())){
            this.player_jumpDuration--;
            this.updatePlayerAttr();
        }
    },
    addPlayerAccel(){
        if(this.playAttrAudio(this.player_accel<20&&this.canAddAttr())){
            this.player_accel++;
            this.updatePlayerAttr();
        }
    },
    subPlayerAccel(){
        if(this.playAttrAudio(this.player_accel>0&&this.canSubAttr())){
            this.player_accel--;   
            this.updatePlayerAttr();
        }
    },


    getJumpStyles: function(r){

        let styleKeys = [
            // '起跳'
            '正常',
            '漂浮',
            // '弹簧',
            // '震动',
            '二段',
            '轻功',
            '滞空'
            // '悬空',
            // '和谐',
            
        ];
        let styleValues = [
            // ['easeExponentialOut','easeExponentialIn'] //起跳
            ['easeCubicActionOut','easeCubicActionIn']  //正常
            ,['easeSineOut','easeSineIn'] //漂浮
            // ,['easeElasticOut','easeElasticIn'] //弹簧
            // ,['easeBounceOut','easeBounceIn'] //震动
            ,['easeBackOut','easeBackIn'] //二段
            ,['easeQuadraticActionOut','easeQuadraticActionIn']  //轻功
            ,['easeQuarticActionOut','easeQuarticActionIn'] //滞空
            // ,['easeQuinticActionOut','easeQuinticActionIn'] //悬空
            // ,['easeCircleActionOut','easeCircleActionIn'] //和谐
        ];

        return r==='key'?styleKeys:styleValues;
    },

	jumping: function(){

        let jumpStyles = this.jumpStyles
            ,jumpUp = cc.moveBy(this.jumpDuration, cc.v2(0, this.jumpHeight)).easing(cc[jumpStyles[this.jumpStyleIndex][0]]())
            ,jumpDown = cc.moveBy(this.jumpDuration, cc.v2(0, -this.jumpHeight)).easing(cc[jumpStyles[this.jumpStyleIndex][1]]())
            ,squash = cc.scaleTo(this.squashDuration, 1, 0.6)
            ,stretch = cc.scaleTo(this.squashDuration, 1, 1.2)
            ,scaleBack = cc.scaleTo(this.squashDuration, 1, 1)
            ,callback = cc.callFunc(this.playJumpSound, this);

        this.node.runAction(cc.repeat(cc.sequence(squash, stretch, jumpUp, scaleBack, jumpDown, callback),1));
        
        if(this.enabled){
			let game = this.node.parent.getComponent('Game');
			if(game.twiceJumpGetScore === 0){
				game.scoreKeeper = Math.ceil(game.scoreKeeper * 2/3);
			}else{
                game.twiceJumpGetScore --;
            }
        	this.readyJump();
        }
    },

    readyJump: function () {
		let t = this;
		setTimeout(function(){
			if(t.enabled) t.jumping();
		},t.jumpDuration*2000+t.squashDuration*3000);
    },

    playJumpSound: function () {
        // 调用声音引擎播放声音
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },

    getCenterPos: function () {
        var centerPos = cc.v2(this.node.x, this.node.y + this.node.height/2);
        return centerPos;
    },

    startMoveAt: function (x,y) {
        this.enabled = true;
        this.enabled = true;
        this.xSpeed = 0; // 主角当前水平方向速度
        this.accLeft = false;  // 加速度方向开关
        this.accRight = false;
        this.initAttr();
        this.readyJump();
        this.node.setPosition(x,y);
    },

    stopMove: function () {
        this.enabled = false;
        this.node.stopAllActions();
        clearInterval(this.jumpInterval);
    },

    onKeyDown (event) {
        // set a flag when key pressed
        switch(event.keyCode) {
            case cc.macro.KEY.a:
                this.accLeft = true;
                break;
            case cc.macro.KEY.d:
                this.accRight = true;
                break;
            case cc.macro.KEY.w:
                this.switchJumpStyle();
                break;
            case cc.macro.KEY.s:
                this.stopXSpeed();
                break;
        }
    },

    onKeyUp (event) {
        // unset a flag when key released
        switch(event.keyCode) {
            case cc.macro.KEY.a:
                this.accLeft = false;
                break;
            case cc.macro.KEY.d:
                this.accRight = false;
                break;
        }
    },

    onTouchStart (event) {
        var touchLoc = event.getLocation();
        if(touchLoc.y > cc.winSize.height * 0.6){
            this.switchJumpStyle();
        }else{
            if (touchLoc.x < cc.winSize.width/3) {
                this.accLeft = true;
                this.accRight = false;
            } else if(touchLoc.x > cc.winSize.width * 2/3){
                this.accLeft = false;
                this.accRight = true;
            }else{
                this.stopXSpeed();
            }
        }
    },

    stopXSpeed(){
        this.xSpeed /= -1.3;
    },
    reverseXSpeed(){
        this.xSpeed /= -3;
    },

    switchJumpStyle:function(){
        if(this.jumpStyleIndex === this.jumpStylesLength-1){
            this.jumpStyleIndex = 0;
        }else{
            this.jumpStyleIndex++;
        }
        this.changeJumpStyle();
    },

    changeJumpStyle: function(){
        let jumpStyles = this.getJumpStyles('key');
        this.jumpStyleDisplay.string = '跳法：' + jumpStyles[this.jumpStyleIndex];

        // 播放切换武器的声音
        cc.audioEngine.playEffect(this.switchJumpStyleAudio, false);
    },
    
    onTouchEnd (event) {
        this.accLeft = false;
        this.accRight = false;
    },

    onDestroy () {
        // 取消键盘输入监听
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
       
        var touchReceiver = this.controller;
        touchReceiver.off('touchstart', this.onTouchStart, this);
        touchReceiver.off('touchend', this.onTouchEnd, this);
    },    

    update: function (dt) {
        // 根据当前加速度方向每帧更新速度
        if (this.accLeft) {
            this.xSpeed -= this.accel * dt;
        } else if (this.accRight) {
            this.xSpeed += this.accel * dt;
        }
        // 限制主角的速度不能超过最大值
        if ( Math.abs(this.xSpeed) > this.maxMoveSpeed ) {
            // if speed reach limit, use max speed with current direction
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        }

        // 根据当前速度更新主角的位置
        this.node.x += this.xSpeed * dt;

        let gameLevel = this.node.parent.getComponent('Game').gameLevel;

        // limit player_ position inside screen
        if ( this.node.x > (this.node.parent.width/2 + gameLevel*0.6)) {
            this.node.x = this.node.parent.width/2 + gameLevel*0.6;
            this.reverseXSpeed();
        } else if (this.node.x < (-this.node.parent.width/2 - gameLevel*0.6)) {
            this.node.x = -this.node.parent.width/2 - gameLevel*0.6;
            this.reverseXSpeed();
        }
    },
});


