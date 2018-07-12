///<reference path="lib/events/EventBus.ts"/>
///<reference path="RoomFile.ts"/>
///<reference path="errorsView/ErrorView.ts"/>
///<reference path="call/SubscriberCurrentImageView.ts"/>
var AppRoom = (function () {
    function AppRoom(isOwner, kurentoRoom, stream) {
        var _this = this;
        this.isOwner = false;
        this.files = new Map("images");
        this.isOwner = isOwner;
        this.kurentoRoom = kurentoRoom;
        this.stream = stream;
        EventBus.addEventListener("ON_CALL_APPROVED", function () { return _this.onCallApproved(); });
        EventBus.addEventListener("STOP_CONVERSATION_REQUEST", function (data) { return _this.onStopConversation(data); });
        EventBus.addEventListener("ON_FILE_LOAD_COMPLETE", function (fileData) { return _this.onFileLoadComplete(fileData); });
    }
    AppRoom.prototype.init = function () {
        console.log("AppRoom init() isOwner:", this.isOwner);
        if (this.isOwner) {
            this.stream.publish();
        }
        else {
            console.log("unable to auto publish because of im not an owner");
        }
    };
    AppRoom.prototype.onFileData = function (id, packet, current, total, type) {
        if (this.files.has(id)) {
            var currentFile = this.files.get(id);
            currentFile.addPacket(packet, current, total);
        }
        else {
            var currentFile = new RoomFile(id, packet, type, current, total);
            this.files.add(id, currentFile);
        }
    };
    AppRoom.prototype.getFile = function (id) {
        if (this.files.has(id)) {
            return this.files.get(id);
        }
        else {
            new ErrorView("No file with id " + id);
        }
    };
    AppRoom.prototype.startPublish = function () {
        console.log("start publishing...");
        this.stream.publish();
    };
    AppRoom.prototype.stopPublish = function () {
        console.log("stop publishing...");
        //console.log("executing onParticipantLeft message:",message);
        //this.kurentoRoom.onParticipantLeft();
        this.stream.unpublish();
    };
    AppRoom.prototype.onFileLoadComplete = function (fileData) {
        console.log("onFileLoadComplete", fileData);
        var fileId = fileData.id;
        var fileType = fileData.type;
        if (fileType == "img") {
            console.log("loading image...");
            var imageView = new SubscriberCurrentImageView();
            imageView.loadImage(this.files.get(fileId).getContent());
        }
    };
    AppRoom.prototype.onCallApproved = function () {
        console.log("onCall approved");
        this.startPublish();
    };
    AppRoom.prototype.removeParticipant = function (data) {
        this.kurentoRoom.onParticipantLeft(data);
    };
    AppRoom.prototype.sendData = function (data) {
        var dataChannelOpened = this.stream.isDataChannelOpened();
        if (dataChannelOpened) {
            //this.stream.getWebRtcPeer().send(data);
            this.stream.sendData(data);
        }
        else {
            console.error("data channel is NOT opened");
        }
    };
    AppRoom.prototype.onStopConversation = function (data) {
        console.log("onStopConversation data:", data);
        console.log("executing onParticipantLeft message:", data);
        //this.kurentoRoom.onParticipantLeft(data);
        this.removeParticipant(data);
        this.stopPublish();
    };
    return AppRoom;
}());
//# sourceMappingURL=AppRoom.js.map