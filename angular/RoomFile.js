///<reference path="lib/events/EventBus.ts"/>
var RoomFile = (function () {
    function RoomFile(id, content, type, currentLoadedPackets, totalPackets) {
        this.content = "";
        this.currentLoadedPackets = 0;
        this.totalPackets = 0;
        this.isLoaded = false;
        this.id = id;
        this.content = content;
        this.type = type;
        this.currentLoadedPackets = currentLoadedPackets;
        this.totalPackets = totalPackets;
        if (currentLoadedPackets - 1 == totalPackets) {
            this.isLoaded = true;
            this.onLoadComplete();
        }
    }
    RoomFile.prototype.addPacket = function (packet, currentLoadedPackets, totalPackets) {
        this.content += packet;
        this.currentLoadedPackets = currentLoadedPackets;
        this.totalPackets = totalPackets;
        var progress = Math.round(this.currentLoadedPackets / this.totalPackets * 100);
        EventBus.dispatchEvent("ON_FILE_LOAD_PROGRESS", progress);
        console.log("download progress: ", progress);
        if (currentLoadedPackets == (totalPackets - 1)) {
            this.isLoaded = true;
            this.onLoadComplete();
        }
    };
    RoomFile.prototype.getContent = function () {
        return this.content;
    };
    RoomFile.prototype.getIsLoaded = function () {
        return this.isLoaded;
    };
    RoomFile.prototype.onLoadComplete = function () {
        console.log("File ", this.id, "load complete");
        EventBus.dispatchEvent("ON_FILE_LOAD_COMPLETE", { id: this.id, type: this.type });
    };
    return RoomFile;
}());
//# sourceMappingURL=RoomFile.js.map