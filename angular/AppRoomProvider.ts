///<reference path="AppRoom.ts"/>
class AppRoomProvider{
    private static instance:AppRoomProvider;
    private room:AppRoom;

    constructor(){
        //console.error("Unable to instantiate AppRoomProvider. Class is singleton. Use AppRoomProvider.getIsnstance()");
    }

    public static getInstance():AppRoomProvider{
        if(!this.instance){
            this.instance = new this();
        }
        return this.instance;
    }

    public setAppRoom(appRoom:AppRoom):void{
        this.room = appRoom;
    }

    public getAppRoom():AppRoom{
        return this.room;
    }
}
