///<reference path="lib/events/EventBus.ts"/>
///<reference path="RoomFile.ts"/>
///<reference path="errorsView/ErrorView.ts"/>
///<reference path="call/SubscriberCurrentImageView.ts"/>
class AppRoom{
    private kurentoRoom:any;
    private stream:any;
    private isOwner:boolean = false;
    private files:Map<RoomFile> = new Map<RoomFile>("images");

    constructor(isOwner:boolean, kurentoRoom:any, stream:any){
        this.isOwner = isOwner;
        this.kurentoRoom = kurentoRoom;
        this.stream = stream;
        EventBus.addEventListener("ON_CALL_APPROVED",()=>this.onCallApproved());
        EventBus.addEventListener("STOP_CONVERSATION_REQUEST",(data)=>this.onStopConversation(data));
        EventBus.addEventListener("ON_FILE_LOAD_COMPLETE",(fileData)=>this.onFileLoadComplete(fileData));
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

    public onFileData(id:string, packet:string, current:number, total:number, type:string):void{
        if(this.files.has(id)){
            var currentFile:RoomFile = this.files.get(id);
            currentFile.addPacket(packet, current, total);
        }
        else{
            var currentFile:RoomFile = new RoomFile(id, packet, type, current, total);
            this.files.add(id, currentFile);
        }
    }
    
    public getFile(id:string):RoomFile{
        if(this.files.has(id)){
            return this.files.get(id);
        }
        else{
            new ErrorView("No file with id "+id);
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

    private onFileLoadComplete(fileData:any):void{
        console.log("onFileLoadComplete",fileData);
        var fileId:string = fileData.id;
        var fileType:string = fileData.type;

        if(fileType == "img"){
            console.log("loading image...");
            var imageView:SubscriberCurrentImageView = new SubscriberCurrentImageView();
            imageView.loadImage(this.files.get(fileId).getContent());
        }
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
            //this.stream.getWebRtcPeer().send(data);
            this.stream.sendData(data);
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
