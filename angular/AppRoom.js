///<reference path="lib/events/EventBus.ts"/>
var AppRoom = (function () {
    function AppRoom(isOwner, kurentoRoom, stream) {
        var _this = this;
        this.isOwner = false;
        this.isOwner = isOwner;
        this.kurentoRoom = kurentoRoom;
        this.stream = stream;
        EventBus.addEventListener("ON_CALL_APPROVED", function () { return _this.onCallApproved(); });
        EventBus.addEventListener("STOP_CONVERSATION_REQUEST", function (data) { return _this.onStopConversation(data); });
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
    AppRoom.prototype.onCallApproved = function () {
        console.log("onCall approved");
        this.startPublish();
    };
    AppRoom.prototype.removeParticipant = function (data) {
        this.kurentoRoom.onParticipantLeft(data);
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