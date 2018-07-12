///<reference path="lib/events/EventBus.ts"/>
class RoomFile{
    private content:string = "";
    private type:string;
    private id:string;
    private currentLoadedPackets:number = 0;
    private totalPackets:number = 0;
    private isLoaded:boolean = false;
    
    constructor(id:string, content:string, type:string, currentLoadedPackets:number, totalPackets:number){
        this.id = id;
        this.content = content;
        this.type = type;
        this.currentLoadedPackets = currentLoadedPackets;
        this.totalPackets = totalPackets;
        
        if(currentLoadedPackets-1 == totalPackets){
            this.isLoaded = true;
            this.onLoadComplete();
        }
    }
    
    public addPacket(packet:string, currentLoadedPackets:number, totalPackets:number):void{
        this.content+=packet;
        this.currentLoadedPackets = currentLoadedPackets;
        this.totalPackets = totalPackets;
        var progress:number = Math.round(this.currentLoadedPackets/this.totalPackets*100);

        EventBus.dispatchEvent("ON_FILE_LOAD_PROGRESS", progress);
        console.log("download progress: ",progress);
        
        if(currentLoadedPackets == (totalPackets - 1)){
            this.isLoaded = true;
            this.onLoadComplete();
        }
    }
    
    public getContent():string{
        return this.content;
    }
    
    public getIsLoaded():boolean{
        return this.isLoaded;
    }
    
    private onLoadComplete():void{
        console.log("File ",this.id, "load complete");
        EventBus.dispatchEvent("ON_FILE_LOAD_COMPLETE", {id:this.id, type:this.type});
    }
}
