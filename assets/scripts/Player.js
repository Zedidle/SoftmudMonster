let UserDataManager = require("UserDataManager");

cc.Class({
    extends: cc.Component,

    properties: {

        controller: {
            default: null,
            type: cc.Node
        },
        mobileController: {
            default: null,
            type: cc.Node
        },
        money: {
            default: null,
            type: cc.Label
        },

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

        jumpStyles: null,
        jumpStylesLength: 0,
        jumpStyleDisplay: {
            default: null,
            type: cc.Label
        },
    },

    onLoad() {
        this.enabled = false;
        this.minPosX = -this.node.parent.width / 2;
        this.maxPosX = this.node.parent.width / 2;

        this.jumpStyles = this.getJumpStyles();
        this.jumpStylesLength = this.jumpStyles.length;

        this.initInput();
    },

    initInput() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);

        if (document.body.clientWidth < 960) {
            this.mobileController.active = true;
        } else {
            this.mobileController.active = false;
        }
    },
    startMoveAt(x, y) {
        this.roleArg = UserDataManager.getRoleArg();
        this.canTurn = true;
        this.enabled = true;
        this.firstJump = true;
        this.xSpeed = 0;
        this.accDir = Math.random() > 0.5 ? 0 : 1;
        this.initAttr();
        this.readyJump();
        this.node.setPosition(x, y + this.node.height / 2);
    },
    initAttr() {
        this.jumpHeight = 110; // 主角跳跃高度
        this.node.rotation = 0;

        this.jumpDuration = 0.25 + this.roleArg.jumpDuration / 200;  // 主角跳跃持续时间
        this.accel = 350 + this.roleArg.accel * 5; // 加速度

        this.squashDuration = 0.03; // 辅助形变动作时间
        this.maxMoveSpeed = 3000; // 最大移动速度

        this.rise_jumpHeight = 0.7;
        this.rise_jumpDuration = 0.0005;
        this.rise_accel = 2.5;
    },
    upgrade() {
        this.jumpHeight += (this.rise_jumpHeight);
        this.jumpDuration += this.rise_jumpDuration * (10 + this.roleArg.jumpDuration) / 30;
        this.accel += this.rise_accel * (10 + this.roleArg.accel) / 30;
    },

    getJumpStyles: function (r) {

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
            ['easeCubicActionOut', 'easeCubicActionIn']  //正常
            , ['easeSineOut', 'easeSineIn'] //漂浮
            // ,['easeElasticOut','easeElasticIn'] //弹簧
            // ,['easeBounceOut','easeBounceIn'] //震动
            , ['easeBackOut', 'easeBackIn'] //二段
            , ['easeQuadraticActionOut', 'easeQuadraticActionIn']  //轻功
            , ['easeQuarticActionOut', 'easeQuarticActionIn'] //滞空
            // ,['easeQuinticActionOut','easeQuinticActionIn'] //悬空
            // ,['easeCircleActionOut','easeCircleActionIn'] //和谐
        ];

        return r === 'key' ? styleKeys : styleValues;
    },


    readyJump() {
        let readyTime = this.jumpDuration * 2 + this.squashDuration * 3;
        if (this.firstJump) {
            this.firstJump = false;
            this.node.runAction(cc.sequence(
                cc.scaleTo(readyTime, 1.2, 0.8),
                cc.callFunc(() => {
                    this.node.scale = 1;
                })
            ))
        }
        setTimeout(() => {
            if (this.enabled) this.jumping();
        }, readyTime * 1000);
    },
    jumping() {
        let jumpStyles = this.jumpStyles
            , jumpUp = cc.moveBy(this.jumpDuration, cc.v2(0, this.jumpHeight)).easing(cc[jumpStyles[this.jumpStyleIndex][0]]())
            , jumpDown = cc.moveBy(this.jumpDuration, cc.v2(0, -this.jumpHeight)).easing(cc[jumpStyles[this.jumpStyleIndex][1]]())
            , squash = cc.scaleTo(this.squashDuration, 1, 0.6)
            , stretch = cc.scaleTo(this.squashDuration, 1, 1.2)
            , scaleBack = cc.scaleTo(this.squashDuration, 1, 1)
            , callback = cc.callFunc(this.playJumpSound, this);

        this.node.runAction(cc.repeat(cc.sequence(squash, stretch, jumpUp, scaleBack, jumpDown, callback), 1));

        if (this.enabled) {
            let game = this.node.parent.getComponent('Game');
            if (game.twiceJumpGetScore === 0) {
                game.scoreKeeper = Math.ceil(game.scoreKeeper * 4 / 5);
            } else {
                game.twiceJumpGetScore--;
            }
            this.readyJump();
        }
    },



    playJumpSound() {
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },
    stopMove() {
        this.enabled = false;
        this.node.stopAllActions();
        clearInterval(this.jumpInterval);
    },

    onKeyDown(event) {
        switch (event.keyCode) {
            case cc.macro.KEY.w:
                this.switchJumpStyle();
                break;
            case cc.macro.KEY.s:
                this.turnXSpeed();
                break;
            case cc.macro.KEY.a:
                this.speedBounce();
                break;
        }
    },

    onTouchStart(event) {
        var touchLoc = event.getLocation();
        if (touchLoc.y > cc.winSize.height * 0.6) {
            this.switchJumpStyle();
        } else {
            if (touchLoc.x < cc.winSize.width / 3) {
                this.accDir = 0;
            } else if (touchLoc.x > cc.winSize.width * 2 / 3) {
                this.accDir = 1;
            } else {
                this.turnXSpeed();
            }
        }
    },

    turnAcc() {
        if (this.accDir === 0) {
            this.accDir = 1;
        } else {
            this.accDir = 0;
        }
    },

    turnXSpeed() {
        if (this.canTurn) {
            this.xSpeed /= -1.4;
            this.node.runAction(
                cc.sequence(cc.rotateBy(0.5, this.accDir === 0 ? 360 : -360),
                    cc.callFunc(() => {
                        this.node.rotation = 0;
                    })
                ));
            this.turnAcc();
        }
    },
    reverseXSpeed() {
        this.turnXSpeed();
        this.canTurn = false;
        setTimeout(() => {
            this.canTurn = true;
        }, 100);
    },
    speedBounce() {
        this.xSpeed /= 2;
        this.node.runAction(cc.sequence(
            cc.scaleTo(1, 0.7),
            cc.callFunc(() => {
                this.xSpeed *= 3;
                this.node.scale = 1;
            })
        ));
    },

    switchJumpStyle() {
        if (this.jumpStyleIndex === this.jumpStylesLength - 1) {
            this.jumpStyleIndex = 0;
        } else {
            this.jumpStyleIndex++;
        }
        this.changeJumpStyle();
    },

    changeJumpStyle() {
        let jumpStyles = this.getJumpStyles('key');
        this.jumpStyleDisplay.string = '跳法：' + jumpStyles[this.jumpStyleIndex];
        cc.audioEngine.playEffect(this.switchJumpStyleAudio, false);
    },

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },

    update(dt) {
        if (this.accDir) {
            this.xSpeed += this.accel * dt;
        } else {
            this.xSpeed -= this.accel * dt;
        }
        if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        }

        this.node.x += this.xSpeed * dt;
        if (this.node.x > this.node.parent.width / 2) {
            this.node.x = this.node.parent.width / 2;
            this.reverseXSpeed();
        } else if (this.node.x < -this.node.parent.width / 2) {
            this.node.x = -this.node.parent.width / 2;
            this.reverseXSpeed();
        }
    },
});


