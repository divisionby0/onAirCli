///<reference path="Host.ts"/>
class Settings{
    //public static webSocketUriPrefix:string = "wss://";
    public static webSocketUriPrefix:string = "ws://";
    public static webSocketUriPostfix:string = "/room";
    public static isPublisher:string = "0";
    public static isSubscriber:string = "1";
    public static callTimeoutInterval:number = 60000;
    public static updateSpeakerInterval:number = 1800;
    public static thresholdSpeaker:number = -50;
    public static sendFileMaxPacketSize:number = 6000;
    public static sendFilePacketInterval:number = 250;
    
    public static setHost(host:string):void{
        Host.getInstance().setHost(host);
    }
    public static getHost():string{
        return Host.getInstance().getHost();
    }
    
    public static getServerUri():string{
        return Settings.webSocketUriPrefix+Host.getInstance().getHost()+Settings.webSocketUriPostfix;
    }
    
    /*
    private static isOwner:boolean = false;
    private static ownerName:string;

    public static setOwnerName(name:string):void{
        this.ownerName = name;
    }
    public static isOwner():boolean{
        return this.isOwner;
    }
    */
}
