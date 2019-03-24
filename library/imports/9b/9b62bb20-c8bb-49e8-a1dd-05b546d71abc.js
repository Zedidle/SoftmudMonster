"use strict";
cc._RF.push(module, '9b62bsgyLtJ6KHdBbVG1xq8', 'UserDataManager');
// scripts/UserDataManager.js

"use strict";

var UserDataManager = {
    loadData: function loadData() {
        console.log("UserDataManager-loadData");
        var roleArg = JSON.parse(localStorage.getItem("roleArg"));
        if (roleArg) {
            this.roleArg = roleArg;
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