///<reference path="AppRoom.ts"/>
var AppRoomProvider = (function () {
    function AppRoomProvider() {
        //console.error("Unable to instantiate AppRoomProvider. Class is singleton. Use AppRoomProvider.getIsnstance()");
    }
    AppRoomProvider.getInstance = function () {
        if (!this.instance) {
            this.instance = new this();
        }
        return this.instance;
    };
    AppRoomProvider.prototype.setAppRoom = function (appRoom) {
        this.room = appRoom;
    };
    AppRoomProvider.prototype.getAppRoom = function () {
        return this.room;
    };
    return AppRoomProvider;
}());
//# sourceMappingURL=AppRoomProvider.js.map