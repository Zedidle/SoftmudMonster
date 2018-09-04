"use strict";
cc._RF.push(module, '6c688v72QdOKamCGCT+xaAd', 'Player');
// scripts/Player.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        initialHeight: 0,
        // 主角跳跃高度
        jumpHeight: 150,
        // 主角跳跃持续时间
        jumpDuration: 0.3,
        // 辅助形变动作时间
        squashDuration: 0,
        // 最大移动速度
        maxMoveSpeed: 3000,
        // 加速度
        accel: 250,
        // 跳跃音效资源
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
        // jumpStyle label 的引用
        jumpStyleDisplay: {
            default: null,
            type: cc.Label
        }
    },
    onLoad: function onLoad() {
        this.enabled = false;

        this.initProperties();

        // 加速度方向开关
        this.accLeft = false;
        this.accRight = false;
        // 主角当前水平方向速度
        this.xSpeed = 0;

        // screen boundaries
        this.minPosX = -this.node.parent.width / 2;
        this.maxPosX = this.node.parent.width / 2;

        // 初始化键盘输入监听
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        // 手机触摸屏
        var touchReceiver = cc.Canvas.instance.node;
        touchReceiver.on('touchstart', this.onTouchStart, this);
        touchReceiver.on('touchend', this.onTouchEnd, this);
    },

    initProperties: function initProperties() {
        this.initialHeight = 0;
        this.jumpHeight = 150;
        this.jumpDuration = 0.3;
        this.accel = 250;
    },

    upgrade: function upgrade() {
        this.jumpHeight += 2.5;
        this.jumpDuration += 0.005;
        this.accel += 25;
        this.updateJumpAction();
    },

    getJumpStyles: function getJumpStyles(r) {

        var styleKeys = [
        // '起跳'
        '正常', '漂浮',
        // '弹簧',
        // '震动',
        '二段', '轻功', '滞空'
        // '悬空',
        // '和谐',

        ];
        var styleValues = [
        // ['easeExponentialOut','easeExponentialIn'] //起跳
        ['easeCubicActionOut', 'easeCubicActionIn'] //正常
        , ['easeSineOut', 'easeSineIn'] //漂浮
        // ,['easeElasticOut','easeElasticIn'] //弹簧
        // ,['easeBounceOut','easeBounceIn'] //震动
        , ['easeBackOut', 'easeBackIn'] //二段
        , ['easeQuadraticActionOut', 'easeQuadraticActionIn'] //轻功
        , ['easeQuarticActionOut', 'easeQuarticActionIn'] //滞空
        // ,['easeQuinticActionOut','easeQuinticActionIn'] //悬空
        // ,['easeCircleActionOut','easeCircleActionIn'] //和谐
        ];

        return r === 'key' ? styleKeys : styleValues;
    },

    updateJumpAction: function updateJumpAction() {

        var jumpStyles = this.getJumpStyles();
        this.jumpStylesLength = jumpStyles.length;

        // 上升
        var jumpUp = cc.moveBy(this.jumpDuration, cc.v2(0, this.jumpHeight)).easing(cc[jumpStyles[this.jumpStyleIndex][0]]());
        // 下落
        var jumpDown = cc.moveBy(this.jumpDuration, cc.v2(0, -this.jumpHeight)).easing(cc[jumpStyles[this.jumpStyleIndex][1]]());

        // 形变
        var squash = cc.scaleTo(this.squashDuration, 1, 0.6);
        var stretch = cc.scaleTo(this.squashDuration, 1, 1.2);
        var scaleBack = cc.scaleTo(this.squashDuration, 1, 1);

        // 添加一个回调函数，用于在动作结束时调用我们定义的其他方法
        var callback = cc.callFunc(this.playJumpSound, this);
        clearInterval(this.jumpInterval);
        var t = this;
        this.jumpInterval = setInterval(function () {
            t.node.runAction(cc.repeat(cc.sequence(squash, stretch, jumpUp, scaleBack, jumpDown, callback), 1));
        }, this.jumpDuration * 2000 + this.squashDuration * 3000);
    },

    playJumpSound: function playJumpSound() {
        // 调用声音引擎播放声音
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },

    getCenterPos: function getCenterPos() {
        var centerPos = cc.v2(this.node.x, this.node.y + this.node.height / 2);
        return centerPos;
    },

    startMoveAt: function startMoveAt(x, y) {
        this.enabled = true;
        this.xSpeed = 0;
        this.node.setPosition(x, y);
        this.updateJumpAction();
    },

    stopMove: function stopMove() {
        this.enabled = false;
        this.node.stopAllActions();
        clearInterval(this.jumpInterval);
    },

    onKeyDown: function onKeyDown(event) {
        // set a flag when key pressed
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                this.accLeft = true;
                break;
            case cc.macro.KEY.d:
                this.accRight = true;
                break;
            case cc.macro.KEY.w:
                this.switchJumpStyle(true);
                break;
            case cc.macro.KEY.s:
                this.switchJumpStyle(false);
                break;
        }
    },
    onKeyUp: function onKeyUp(event) {
        // unset a flag when key released
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                this.accLeft = false;
                break;
            case cc.macro.KEY.d:
                this.accRight = false;
                break;
        }
    },
    onTouchStart: function onTouchStart(event) {
        var touchLoc = event.getLocation();
        if (touchLoc.x > cc.winSize.width / 2) {
            if (touchLoc.y > cc.winSize.height / 2) {
                this.switchJumpStyle(true);
            } else {
                this.accLeft = false;
                this.accRight = true;
            }
        } else {
            if (touchLoc.y > cc.winSize.height / 2) {
                this.switchJumpStyle(false);
            } else {
                this.accLeft = true;
                this.accRight = false;
            }
        }
    },


    switchJumpStyle: function switchJumpStyle(bool) {
        if (bool) {
            if (this.jumpStyleIndex === this.jumpStylesLength - 1) {
                this.jumpStyleIndex = 0;
            } else {
                this.jumpStyleIndex++;
            }
        } else {
            if (this.jumpStyleIndex === 0) {
                this.jumpStyleIndex = this.jumpStylesLength - 1;
            } else {
                this.jumpStyleIndex--;
            }
        }
        this.updateJumpAction();
        this.changeJumpStyle();
    },

    changeJumpStyle: function changeJumpStyle() {
        var jumpStyles = this.getJumpStyles('key');
        this.jumpStyleDisplay.string = '跳法：' + jumpStyles[this.jumpStyleIndex];

        // 播放切换武器的声音
        cc.audioEngine.playEffect(this.switchJumpStyleAudio, false);
    },

    onTouchEnd: function onTouchEnd(event) {
        this.accLeft = false;
        this.accRight = false;
    },
    onDestroy: function onDestroy() {
        // 取消键盘输入监听
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        var touchReceiver = cc.Canvas.instance.node;
        touchReceiver.off('touchstart', this.onTouchStart, this);
        touchReceiver.off('touchend', this.onTouchEnd, this);
    },


    update: function update(dt) {
        // 根据当前加速度方向每帧更新速度
        if (this.accLeft) {
            this.xSpeed -= this.accel * dt;
        } else if (this.accRight) {
            this.xSpeed += this.accel * dt;
        }
        // 限制主角的速度不能超过最大值
        if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
            // if speed reach limit, use max speed with current direction
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        }

        // 根据当前速度更新主角的位置
        this.node.x += this.xSpeed * dt;

        var gameLevel = this.node.parent.getComponent('Game').gameLevel;

        // limit player position inside screen
        if (this.node.x > this.node.parent.width / 2 + gameLevel) {
            this.node.x = this.node.parent.width / 2 + gameLevel;
            this.xSpeed = 0;
        } else if (this.node.x < -this.node.parent.width / 2 - gameLevel) {
            this.node.x = -this.node.parent.width / 2 - gameLevel;
            this.xSpeed = 0;
        }
    }

});

cc._RF.pop();