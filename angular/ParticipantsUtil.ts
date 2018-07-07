class ParticipantsUtil{
    private static instance:ParticipantsUtil;

    private ownerName:string;
    private selfName:string;

    constructor(){
        //console.error("Unable to instantiate AppRoomProvider. Class is singleton. Use AppRoomProvider.getIsnstance()");
    }

    public static getInstance():ParticipantsUtil{
        if(!this.instance){
            this.instance = new this();
        }
        return this.instance;
    }

    public setOwnerName(name:string):void{
        this.ownerName = name;
    }
    public setSelfName(name:string):void{
        this.selfName = name;
    }
    public isOwner(name:string):boolean{
        return name == this.ownerName;
    }
    public isSelf(name:string):boolean{
        return name == this.selfName;
    }
}
