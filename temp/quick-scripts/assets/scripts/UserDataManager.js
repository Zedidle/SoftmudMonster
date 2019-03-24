(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/UserDataManager.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '9b62bsgyLtJ6KHdBbVG1xq8', 'UserDataManager', __filename);
// scripts/UserDataManager.js

"use strict";

var UserDataManager = {
    GAME_VERSION: "0.8.0",

    loadData: function loadData() {
        console.log("UserDataManager-loadData");
        var roleArg = localStorage.getItem("roleArg");
        if (roleArg) {
            this.roleArg = JSON.parse(roleArg);
        } else {
            this.roleArg = {
                maxArgNum: 20,
                sur: 0,
                jumpDuration: 10,
                accel: 10
            };
        }
    },
    getRoleArg: function getRoleArg() {
        return this.roleArg;
    },
    setRoleArg: function setRoleArg(roleArg) {
        localStorage.setItem("roleArg", JSON.stringify(roleArg));
    }
};

module.exports = UserDataManager;

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=UserDataManager.js.map
        