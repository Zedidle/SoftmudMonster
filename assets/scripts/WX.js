const WX = {    // 微信平台
    isWX: cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT_GAME,

    CONFIG: {
        cloudDB: "softmudmonster-77e1e9",
    },

    hadInid: false,
    rewardedVideoAd: null,
    isVideoAvalible: false,

    // 第一时间去用户标识
    login(callback) {
        console.log("WX-login");
        if(!this.isWX) return;

        let self = this;
        wx.cloud.init({
            env: self.CONFIG.cloudDB
        });
        self.DB = wx.cloud.database({
            env: self.CONFIG.cloudDB
        });
        self.COLLECTION = self.DB.collection('test');

        self.COLLECTION.add({
            // data 字段表示需新增的 JSON 数据
            data: {
                // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
                description: 'learn cloud database',
                date: new Date().getTime(),
                tags: [
                    'cloud',
                    'database'
                ],
            },
            success(res) {
                // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
                console.log(res)
            }
        })

        /*  开放数据域不能向主域发送消息。
            主域可以向开放数据域发送消息。调用 wx.getOpenDataContext() 方法可以获取开放数据域实例，
            调用实例上的 OpenDataContext.postMessage() 方法可以向开放数据域发送消息。 */
        // self.openDataContext = wx.getOpenDataContext();
        // self.createCanvas = wx.createCanvas;
        // self.setUserCloudStorage = wx.setUserCloudStorage;



        // 云函数
        // wx.cloud.callFunction({
        //     name: 'login',
        //     data: {},
        //     complete(e) {
        //         self.openid = e.result.openId;
        //         self.getUserData(callback);
        //     }
        // });





        // if (!this.hadInid) {  // 分享初始化  
        //     this.hadInid = true;
        //     wx.showShareMenu({ withShareTicket: true });
        //     wx.updateShareMenu({ withShareTicket: true });
        //     wx.onShareAppMessage(() => {
        //         return {
        //             title: this.getShareTitle(),
        //             imageUrl: this.getShareImgUrl(),
        //         }
        //     });
        // }

        // if (!this.rewardedVideoAd) {
        //     this.rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: 'adunit-3a89cb6497099f0f' })
        //     this.rewardedVideoAd.onLoad(() => {
        //         this.isVideoAvailable = true;
        //     });
        //     this.rewardedVideoAd.onError(err => {
        //         console.log(err)
        //         this.isVideoAvailable = false;
        //     })
        // }
    },


    getUserData(callback) {
        console.log("WX-getUserData");
        if(!this.isWX) return;
        let self = this;
        self.COLLECTION.where({
            _openid: self.openid
        }).get({
            success(res) {
                // 判断用户是否第一次加入游戏, 查询数据库中是否存在该用户的openId
                if (res.data.length) {
                    data = res.data[0];
                } else {
                    self.COLLECTION.add({
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

                self.DOC = self.COLLECTION.doc(data._id);  // 如果是微信平台，则要靠 _id 去定位
                console.log("USER - getUserData: COLLECTION get - success: " + self.DOC);
                callback();
            },
            fail: console.error
        });
    },


    // navigateToMiniProgram(appId, path) {
    //     let envVersion = "release"; // develop || trial || release;
    //     wx.navigateToMiniProgram({
    //         appId,	// string		是	要打开的小程序 appId
    //         path,	// string		否	打开的页面路径，如果为空则打开首页
    //         // extraData:	// object		否	需要传递给目标小程序的数据，目标小程序可在 App.onLaunch，App.onShow 中获取到这份数据。
    //         envVersion, // string	release	否	要打开的小程序版本。仅在当前小程序为开发版或体验版时此参数有效。如果当前小程序是正式版，则打开的小程序必定是正式版。
    //         success() { // function		否	接口调用成功的回调函数
    //             console.log("跳转成功！");
    //         },
    //         fail() { 	// function		否	接口调用失败的回调函数
    //             console.log("跳转失败！");
    //         },
    //         complete() { // function		否	接口调用结束的回调函数（调用成功、失败都会执行）
    //             console.log("跳转操作完成！");
    //         }
    //     });
    // },

    // updatePersonCode() {
    //     let self = this;
    //     self.DOC.update({
    //         data: {
    //             personCode: data.personCode
    //         },
    //         success: console.log,
    //         fail: console.error
    //     })
    // },

    // addShareTimes() {
    //     let _ = this.DB.command;
    //     this.DOC.update({
    //         data: {
    //             shareTimes: _.inc(1)
    //         },
    //         success: console.log,
    //         fail: console.error
    //     })
    // },

    updateThisPlay(playData) {  // 更新当场玩耍数据
        console.log("GAMEOVER - Update User Data: ");
        let _ = this.DB.command;
        this.DOC.update({
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
        let self = this;

        wx.shareAppMessage({
            title: title ? title : this.getShareTitle(),
            imageUrl: this.getShareImgUrl(),
            success(res) {
                console.log(res);
                callback();
                wx.showToast({ title: "分享成功！", icon: "none" });
                self.addShareTimes();
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

module.exports = WX;