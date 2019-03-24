const Config = require("config");


let data = {
    bestScore: 0,
    loginDays: 0,
    personCode: 0,
    playTime: 0,
    shareTimes: 0,
    totalScore: 0
};

const local = {
    isLocal: true,
    personNumber:53,

    setBestScore(score) {
        data.bestScore = score;
    },
    addLoginDays() {
        data.loginDays++;
    },
    modifyPersonCode(isAdd) {
        if (isAdd) {
            if(data.personCode < this.personNumber-1){
                data.personCode ++;
            }else{
                data.personCode = 0;
            }
        } else {
            if(data.personCode > 0){
                data.personCode--;
            }else{
                data.personCode = this.personNumber-1;
            }
        }
    },
    addPlayTime(time) {
        data.playTime += time;
    },
    addShareTimes() {
        data.shareTimes++;
    },
    increaseTotalScore(score) {
        data.totalScore += score;
    },

    getBestScore() {
        return data.bestScore;
    },
    getLoginDays() {
        return data.loginDays;
    },
    getPersonCode() {
        return data.personCode;
    },
    getPlayTime() {
        return data.playTime;
    },
    getShareTimes() {
        return data.shareTimes;
    },
    getTotalScore() {
        return data.totalScore;
    }
}


const WX = {    // 微信平台
    isLocal: false,
    hadInid: false,
    rewardedVideoAd: null,
    isVideoAvalible: false,

    // 第一时间去用户标识
    login(callback) {
        console.log("WX - login");
        let _this = this;

        // 微信是 openId
        wx.cloud.init({
            env: Config.env.wxCloudDB
        });
        _this.DB = wx.cloud.database({
            env: Config.env.wxCloudDB,
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
            complete(e) {
                _this.openid = e.result.openId;
                _this.getUserData(callback);
            }
        })

        if (!this.hadInid) {  // 分享初始化  
            this.hadInid = true;
            wx.showShareMenu({ withShareTicket: true });
            wx.updateShareMenu({ withShareTicket: true });
            wx.onShareAppMessage(() => {
                return {
                    title: this.getShareTitle(),
                    imageUrl: this.getShareImgUrl(),
                }
            });
        }

        if (!this.rewardedVideoAd) {
            this.rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: 'adunit-3a89cb6497099f0f' })
            this.rewardedVideoAd.onLoad(() => {
                this.isVideoAvailable = true;
            });
            this.rewardedVideoAd.onError(err => {
                console.log(err)
                this.isVideoAvailable = false;
            })
        }
    },


    getUserData(callback) {
        console.log("USER - getUserData");
        let _this = this;
        _this.COLLECTION.where({
            _openid: _this.openid
        }).get({
            success(res) {
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
                        success(res) {
                            console.log("USER - getUserData: COLLECTION add - success: ");
                            console.log(res);
                        },
                        fail: console.error
                    });
                }

                _this.DOC = _this.COLLECTION.doc(data._id);  // 如果是微信平台，则要靠 _id 去定位
                console.log("USER - getUserData: COLLECTION get - success: " + _this.DOC);
                callback();
            },
            fail: console.error
        });
    },


    navigateToMiniProgram(appId, path) {
        let envVersion = "release"; // develop || trial || release;
        wx.navigateToMiniProgram({
            appId,	// string		是	要打开的小程序 appId
            path,	// string		否	打开的页面路径，如果为空则打开首页
            // extraData:	// object		否	需要传递给目标小程序的数据，目标小程序可在 App.onLaunch，App.onShow 中获取到这份数据。
            envVersion, // string	release	否	要打开的小程序版本。仅在当前小程序为开发版或体验版时此参数有效。如果当前小程序是正式版，则打开的小程序必定是正式版。
            success(){ // function		否	接口调用成功的回调函数
                console.log("跳转成功！");
            },	
            fail(){ 	// function		否	接口调用失败的回调函数
                console.log("跳转失败！");
            },
            complete(){ // function		否	接口调用结束的回调函数（调用成功、失败都会执行）
                console.log("跳转操作完成！");
            }	
        });
    },

    updatePersonCode() {
        let _this = this;
        _this.DOC.update({
            data: {
                personCode: data.personCode
            },
            success: console.log,
            fail: console.error
        })
    },

    addShareTimes() {
        let _ = this.COMMAND;
        this.DOC.update({
            data: {
                shareTimes: _.inc(1)
            },
            success: console.log,
            fail: console.error
        })
    },


    updateThisPlay(playData) {  // 更新当场玩耍数据
        console.log("GAMEOVER - Update User Data: ");
        let _this = this;
        let _ = this.COMMAND;
        _this.DOC.update({
            data: {
                playTime: _.inc(playData.thisPlayTime),
                totalScore: _.inc(playData.score),
                bestScore: data.bestScore,
            },
            success: console.log,
            fail: console.error
        });

        this.saveRankData(data.bestScore);
        console.log(data);
    },

    saveRankData(bestScore) {
        let openData = [{
            key: 'bestScore',
            value: String(bestScore)
        }];

        wx.setUserCloudStorage({
            KVDataList: openData,
            success(res) {
                console.log("saveOpenData success: ");
                console.log(res);
            },
            fail(res) {
                console.error("saveOpenData failed: ");
                console.log(res);
            }
        });
    },

    share(callback, title) {
        console.log("USER - wxShare ");
        let _this = this;

        wx.shareAppMessage({
            title: title ? title : this.getShareTitle(),
            imageUrl: this.getShareImgUrl(),
            success(res) {
                console.log(res);
                callback();
                wx.showToast({ title: "分享成功！", icon: "none" });
                _this.addShareTimes();
            },
            fail(res) {
                console.log(res);
                wx.showToast({ title: "分享失败！", icon: "none" });
            },
        });
    },

    watchVideoAD(callback) {
        console.log("USER-watchVideoAD")
        // let obj = wx.getSystemInfoSync();

        if (this.isVideoAvailable) {
            this.rewardedVideoAd.show();
            let onClose = res => {
                if (res) {
                    if (callback) callback(res.isEnded);
                }
                this.rewardedVideoAd.offClose(onClose);
                this.isVideoAvailable = false;
            }

            this.rewardedVideoAd.onClose(onClose);
        }
    },

    getShareTitle() {
        let titles = [
            "谁才是皇牌伐木工？",
            " 一起来砍树吧！",
        ];
        let index = Math.floor(Math.random() * titles.length);
        return titles[index];
    },
    getShareImgUrl() {
        // return `/imgs/timberman-3.6-1.jpg`;
        return `https://gameres.huge7.com/timberman/share.jpg`;
    },

    sendMeRankData() {

    },

    // 排行榜功能： 获得好友在开放数据域的数据
    getRankData() {

    },
}
WX.__proto__ = local;



function USER() {
    if (cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT_GAME) {   // 微信游戏平台
        return WX;
    } else if (false) {
        // another platform

    } else {
        return local;
    }
}

module.exports = USER;