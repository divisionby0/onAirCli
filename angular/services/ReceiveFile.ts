///<reference path="../AppRoomProvider.ts"/>

class ReceiveFile{
    constructor(fileData:any){

        //console.log("New ReceiveFile: " + JSON.stringify(fileData));
        
        var id:string = fileData.id;
        var packet:string = fileData.packet;
        var current:number = parseInt(fileData.c);
        var total:number = parseInt(fileData.t);
        var type:string = fileData.tp;
        
        AppRoomProvider.getInstance().getAppRoom().onFileData(id, packet, current, total, type);
    }
}
