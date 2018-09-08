"use strict";
cc._RF.push(module, '4ad09ueAe1Gc4Q4qMnUq4i6', 'bg');
// scripts/bg.js

'use strict';

// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {},

    // LIFE-CYCLE CALLBACKS:

    onLoad: function onLoad() {
        console.log('get bg');
        // sprite.spriteFrame = newSpriteFrame;
        // console.log(this.node)
        // console.log(this.node._components[0])
        console.log(this.node._components[0]);
    },
    start: function start() {}
}

// update (dt) {},
);

cc._RF.pop();