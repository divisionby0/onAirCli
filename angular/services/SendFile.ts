///<reference path="../Settings.ts"/>
class SendFile{
    private kurento:any;
    private fileData:string;
    private roomName:string;

    private packets:string[];
    private currentPacketNum:number = -1;
    private packetCollectionId:string = "p"+Math.round(Math.random()*10000);
    private totalPackets:number = 0;
    private type:string = "img";

    constructor(kurento:any, fileData:string, roomName:string, type:string){
        this.kurento = kurento;
        this.fileData = fileData;
        this.roomName = roomName;
        
        this.type = type;

        this.packets = this.splitPackets();
        this.totalPackets = this.packets.length;
        console.log("total packets",this.totalPackets);

        this.sendPacket();
    }

    private sendPacket():void{
        this.currentPacketNum+=1;
        if(this.currentPacketNum < this.totalPackets){
            var currentPacket:string = this.packets[this.currentPacketNum];
            console.log("currentPacket:",currentPacket);
            this.kurento.sendFile(this.roomName, currentPacket, {id:this.packetCollectionId,current:this.currentPacketNum, total:this.totalPackets, type:this.type});
            setTimeout(()=>this.sendPacket(), Settings.sendFilePacketInterval);
        }
        else{
            console.log("send complete");
        }
    }

    private splitPackets():string[]{
        var i:number;
        var packets:string[] = [];

        for (i = 0; i < this.fileData.length; i += Settings.sendFileMaxPacketSize) {
            packets.push(this.fileData.slice(i, i + Settings.sendFileMaxPacketSize));
        }
        return packets;
    }
}
