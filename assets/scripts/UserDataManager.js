const UserDataManager = {
    GAME_VERSION: "0.8.0",

    loadData() {
        console.log("UserDataManager-loadData");
        let roleArg = localStorage.getItem("roleArg");
        if (roleArg) {
            this.roleArg = JSON.parse(roleArg);
        } else {
            this.roleArg = {
                maxArgNum: 20,
                sur: 0,
                jumpDuration: 10,
                accel: 10,
            };
        }
    },

    getRoleArg() {
        return this.roleArg;
    },
    setRoleArg(roleArg) {
        localStorage.setItem("roleArg", JSON.stringify(roleArg));
    },
};

module.exports = UserDataManager;