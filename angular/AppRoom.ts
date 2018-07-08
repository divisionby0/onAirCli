///<reference path="lib/events/EventBus.ts"/>
class AppRoom{
    private kurentoRoom:any;
    private stream:any;
    private isOwner:boolean = false;

    constructor(isOwner:boolean, kurentoRoom:any, stream:any){
        this.isOwner = isOwner;
        this.kurentoRoom = kurentoRoom;
        this.stream = stream;
        EventBus.addEventListener("ON_CALL_APPROVED",()=>this.onCallApproved());
        EventBus.addEventListener("STOP_CONVERSATION_REQUEST",(data)=>this.onStopConversation(data));
    }

    public init():void{
        console.log("AppRoom init() isOwner:",this.isOwner);
        if(this.isOwner){
            this.stream.publish();
        }
        else{
            console.log("unable to auto publish because of im not an owner");
        }
    }

    public startPublish():void{
        console.log("start publishing...");
        this.stream.publish();
    }
    public stopPublish():void{
        console.log("stop publishing...");
        //console.log("executing onParticipantLeft message:",message);
        //this.kurentoRoom.onParticipantLeft();
        this.stream.unpublish();
    }

    private onCallApproved() {
        console.log("onCall approved");
        this.startPublish();
    }

    public removeParticipant(data:any):void{
        this.kurentoRoom.onParticipantLeft(data);
    }
    public sendData(data:any):void{
        var dataChannelOpened:boolean = this.stream.isDataChannelOpened();
        if(dataChannelOpened){
            this.stream.getWebRtcPeer().send(data);
        }
        else{
            console.error("data channel is NOT opened");
        }
        
    }

    private onStopConversation(data:any):void {
        console.log("onStopConversation data:",data);
        console.log("executing onParticipantLeft message:",data);
        //this.kurentoRoom.onParticipantLeft(data);
        this.removeParticipant(data);
        this.stopPublish();
    }
}
