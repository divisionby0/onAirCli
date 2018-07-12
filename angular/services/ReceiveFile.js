///<reference path="../AppRoomProvider.ts"/>
var ReceiveFile = (function () {
    function ReceiveFile(fileData) {
        //console.log("New ReceiveFile: " + JSON.stringify(fileData));
        var id = fileData.id;
        var packet = fileData.packet;
        var current = parseInt(fileData.c);
        var total = parseInt(fileData.t);
        var type = fileData.tp;
        AppRoomProvider.getInstance().getAppRoom().onFileData(id, packet, current, total, type);
    }
    return ReceiveFile;
}());
//# sourceMappingURL=ReceiveFile.js.map