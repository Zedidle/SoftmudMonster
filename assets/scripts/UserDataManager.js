const UserDataManager = {
    loadData() {
        console.log("UserDataManager-loadData");
        let roleArg = JSON.parse(localStorage.getItem("roleArg"));
        if (roleArg) {
            this.roleArg = roleArg;
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