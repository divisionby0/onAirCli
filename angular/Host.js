var Host = (function () {
    function Host() {
        this.host = "localhost:8443";
        //console.error("Unable to instantiate AppRoomProvider. Class is singleton. Use AppRoomProvider.getIsnstance()");
    }
    Host.getInstance = function () {
        if (!this.instance) {
            this.instance = new this();
        }
        return this.instance;
    };
    Host.prototype.setHost = function (host) {
        this.host = host;
    };
    Host.prototype.getHost = function () {
        return this.host;
    };
    return Host;
}());
//# sourceMappingURL=Host.js.map