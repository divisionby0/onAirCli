var ParticipantsUtil = (function () {
    function ParticipantsUtil() {
        //console.error("Unable to instantiate AppRoomProvider. Class is singleton. Use AppRoomProvider.getIsnstance()");
    }
    ParticipantsUtil.getInstance = function () {
        if (!this.instance) {
            this.instance = new this();
        }
        return this.instance;
    };
    ParticipantsUtil.prototype.setOwnerName = function (name) {
        this.ownerName = name;
    };
    ParticipantsUtil.prototype.setSelfName = function (name) {
        this.selfName = name;
    };
    ParticipantsUtil.prototype.isOwner = function (name) {
        return name == this.ownerName;
    };
    ParticipantsUtil.prototype.isSelf = function (name) {
        return name == this.selfName;
    };
    return ParticipantsUtil;
}());
//# sourceMappingURL=ParticipantsUtil.js.map