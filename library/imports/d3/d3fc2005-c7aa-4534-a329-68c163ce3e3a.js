"use strict";
cc._RF.push(module, 'd3fc2AFx6pFNKMpaMFjzj46', 'WX');
// scripts/WX.js

"use strict";

var Config = require("config");

var data = {
    bestScore: 0,
    loginDays: 0,
    personCode: 0,
    playTime: 0,
    shareTimes: 0,
    totalScore: 0
};

var local = {
    isLocal: true,
    personNumber: 53,

    setBestScore: function setBestScore(score) {
        data.bestScore = score;
    },
    addLoginDays: function addLoginDays() {
        data.loginDays++;
    },
    modifyPersonCode: function modifyPersonCode(isAdd) {
        if (isAdd) {
            if (data.personCode < this.personNumber - 1) {
                data.personCode++;
            } else {
                data.personCode = 0;
            }
        } else {
            if (data.personCode > 0) {
                data.personCode--;
            } else {
                data.personCode = this.personNumber - 1;
            }
        }
    },
    addPlayTime: function addPlayTime(time) {
        data.playTime += time;
    },
    addShareTimes: function addShareTimes() {
        data.shareTimes++;
    },
    increaseTotalScore: function increaseTotalScore(score) {
        data.totalScore += score;
    },
    getBestScore: function getBestScore() {
        return data.bestScore;
    },
    getLoginDays: function getLoginDays() {
        return data.loginDays;
    },
    getPersonCode: function getPersonCode() {
        return data.personCode;
    },
    getPlayTime: function getPlayTime() {
        return data.playTime;
    },
    getShareTimes: function getShareTimes() {
        return data.shareTimes;
    },
    getTotalScore: function getTotalScore() {
        return data.totalScore;
    }
};

var WX = { // 微信平台
    isLocal: false,
    hadInid: false,
    rewardedVideoAd: null,
    isVideoAvalible: false,

    // 第一时间去用户标识
    login: function login(callback) {
        var _this2 = this;

        console.log("WX - login");
        var _this = this;

        // 微信是 openId
        wx.cloud.init({
            env: Config.env.wxCloudDB
        });
        _this.DB = wx.cloud.database({
            env: Config.env.wxCloudDB
        });
        _this.COMMAND = _this.DB.command;
        _this.COLLECTION = _this.DB.collection('test');

        /*  开放数据域不能向主域发送消息。
            主域可以向开放数据域发送消息。调用 wx.getOpenDataContext() 方法可以获取开放数据域实例，
            调用实例上的 OpenDataContext.postMessage() 方法可以向开放数据域发送消息。 */
        _this.openDataContext = wx.getOpenDataContext();
        _this.createCanvas = wx.createCanvas;

        // _this.setUserCloudStorage = wx.setUserCloudStorage;

        wx.cloud.callFunction({
            name: 'login',
            data: {},
            complete: function complete(e) {
                _this.openid = e.result.openId;
                _this.getUserData(callback);
            }
        });

        if (!this.hadInid) {
            // 分享初始化  
            this.hadInid = true;
            wx.showShareMenu({ withShareTicket: true });
            wx.updateShareMenu({ withShareTicket: true });
            wx.onShareAppMessage(function () {
                return {
                    title: _this2.getShareTitle(),
                    imageUrl: _this2.getShareImgUrl()
                };
            });
        }

        if (!this.rewardedVideoAd) {
            this.rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: 'adunit-3a89cb6497099f0f' });
            this.rewardedVideoAd.onLoad(function () {
                _this2.isVideoAvailable = true;
            });
            this.rewardedVideoAd.onError(function (err) {
                console.log(err);
                _this2.isVideoAvailable = false;
            });
        }
    },
    getUserData: function getUserData(callback) {
        console.log("USER - getUserData");
        var _this = this;
        _this.COLLECTION.where({
            _openid: _this.openid
        }).get({
            success: function success(res) {
                // 判断用户是否第一次加入游戏, 查询数据库中是否存在该用户的openId
                if (res.data.length) {
                    data = res.data[0];
                } else {
                    _this.COLLECTION.add({
                        data: {
                            bestScore: 0,
                            loginDays: 0,
                            personCode: 0,
                            playTime: 0,
                            shareTimes: 0,
                            totalScore: 0
                        },
                        success: function success(res) {
                            console.log("USER - getUserData: COLLECTION add - success: ");
                            console.log(res);
                        },

                        fail: console.error
                    });
                }

                _this.DOC = _this.COLLECTION.doc(data._id); // 如果是微信平台，则要靠 _id 去定位
                console.log("USER - getUserData: COLLECTION get - success: " + _this.DOC);
                callback();
            },

            fail: console.error
        });
    },
    navigateToMiniProgram: function navigateToMiniProgram(appId, path) {
        var envVersion = "release"; // develop || trial || release;
        wx.navigateToMiniProgram({
            appId: appId, // string		是	要打开的小程序 appId
            path: path, // string		否	打开的页面路径，如果为空则打开首页
            // extraData:	// object		否	需要传递给目标小程序的数据，目标小程序可在 App.onLaunch，App.onShow 中获取到这份数据。
            envVersion: envVersion, // string	release	否	要打开的小程序版本。仅在当前小程序为开发版或体验版时此参数有效。如果当前小程序是正式版，则打开的小程序必定是正式版。
            success: function success() {
                // function		否	接口调用成功的回调函数
                console.log("跳转成功！");
            },
            fail: function fail() {
                // function		否	接口调用失败的回调函数
                console.log("跳转失败！");
            },
            complete: function complete() {
                // function		否	接口调用结束的回调函数（调用成功、失败都会执行）
                console.log("跳转操作完成！");
            }
        });
    },
    updatePersonCode: function updatePersonCode() {
        var _this = this;
        _this.DOC.update({
            data: {
                personCode: data.personCode
            },
            success: console.log,
            fail: console.error
        });
    },
    addShareTimes: function addShareTimes() {
        var _ = this.COMMAND;
        this.DOC.update({
            data: {
                shareTimes: _.inc(1)
            },
            success: console.log,
            fail: console.error
        });
    },
    updateThisPlay: function updateThisPlay(playData) {
        // 更新当场玩耍数据
        console.log("GAMEOVER - Update User Data: ");
        var _this = this;
        var _ = this.COMMAND;
        _this.DOC.update({
            data: {
                playTime: _.inc(playData.thisPlayTime),
                totalScore: _.inc(playData.score),
                bestScore: data.bestScore
            },
            success: console.log,
            fail: console.error
        });

        this.saveRankData(data.bestScore);
        console.log(data);
    },
    saveRankData: function saveRankData(bestScore) {
        var openData = [{
            key: 'bestScore',
            value: String(bestScore)
        }];

        wx.setUserCloudStorage({
            KVDataList: openData,
            success: function success(res) {
                console.log("saveOpenData success: ");
                console.log(res);
            },
            fail: function fail(res) {
                console.error("saveOpenData failed: ");
                console.log(res);
            }
        });
    },
    share: function share(callback, title) {
        console.log("USER - wxShare ");
        var _this = this;

        wx.shareAppMessage({
            title: title ? title : this.getShareTitle(),
            imageUrl: this.getShareImgUrl(),
            success: function success(res) {
                console.log(res);
                callback();
                wx.showToast({ title: "分享成功！", icon: "none" });
                _this.addShareTimes();
            },
            fail: function fail(res) {
                console.log(res);
                wx.showToast({ title: "分享失败！", icon: "none" });
            }
        });
    },
    watchVideoAD: function watchVideoAD(callback) {
        var _this3 = this;

        console.log("USER-watchVideoAD");
        // let obj = wx.getSystemInfoSync();

        if (this.isVideoAvailable) {
            this.rewardedVideoAd.show();
            var onClose = function onClose(res) {
                if (res) {
                    if (callback) callback(res.isEnded);
                }
                _this3.rewardedVideoAd.offClose(onClose);
                _this3.isVideoAvailable = false;
            };

            this.rewardedVideoAd.onClose(onClose);
        }
    },
    getShareTitle: function getShareTitle() {
        var titles = ["谁才是皇牌伐木工？", " 一起来砍树吧！"];
        var index = Math.floor(Math.random() * titles.length);
        return titles[index];
    },
    getShareImgUrl: function getShareImgUrl() {
        // return `/imgs/timberman-3.6-1.jpg`;
        return "https://gameres.huge7.com/timberman/share.jpg";
    },
    sendMeRankData: function sendMeRankData() {},


    // 排行榜功能： 获得好友在开放数据域的数据
    getRankData: function getRankData() {}
};
WX.__proto__ = local;

function USER() {
    if (cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT_GAME) {
        // 微信游戏平台
        return WX;
    } else if (false) {
        // another platform

    } else {
        return local;
    }
}

module.exports = USER;

cc._RF.pop();