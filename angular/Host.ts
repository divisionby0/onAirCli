class Host{
    private static instance:Host;
    private host:string = "localhost:8443";
    

    constructor(){
        //console.error("Unable to instantiate AppRoomProvider. Class is singleton. Use AppRoomProvider.getIsnstance()");
    }

    public static getInstance():Host{
        if(!this.instance){
            this.instance = new this();
        }
        return this.instance;
    }

    public setHost(host:string):void{
        this.host = host;
    }

    public getHost():string{
        return this.host;
    }
}
