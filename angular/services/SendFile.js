///<reference path="../Settings.ts"/>
var SendFile = (function () {
    function SendFile(kurento, fileData, roomName, type) {
        this.currentPacketNum = -1;
        this.packetCollectionId = "p" + Math.round(Math.random() * 10000);
        this.totalPackets = 0;
        this.type = "img";
        this.kurento = kurento;
        this.fileData = fileData;
        this.roomName = roomName;
        this.type = type;
        this.packets = this.splitPackets();
        this.totalPackets = this.packets.length;
        console.log("total packets", this.totalPackets);
        this.sendPacket();
    }
    SendFile.prototype.sendPacket = function () {
        var _this = this;
        this.currentPacketNum += 1;
        if (this.currentPacketNum < this.totalPackets) {
            var currentPacket = this.packets[this.currentPacketNum];
            console.log("currentPacket:", currentPacket);
            this.kurento.sendFile(this.roomName, currentPacket, { id: this.packetCollectionId, current: this.currentPacketNum, total: this.totalPackets, type: this.type });
            setTimeout(function () { return _this.sendPacket(); }, Settings.sendFilePacketInterval);
        }
        else {
            console.log("send complete");
        }
    };
    SendFile.prototype.splitPackets = function () {
        var i;
        var packets = [];
        for (i = 0; i < this.fileData.length; i += Settings.sendFileMaxPacketSize) {
            packets.push(this.fileData.slice(i, i + Settings.sendFileMaxPacketSize));
        }
        return packets;
    };
    return SendFile;
}());
//# sourceMappingURL=SendFile.js.map