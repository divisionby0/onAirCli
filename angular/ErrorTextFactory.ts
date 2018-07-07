///<reference path="call/CallError.ts"/>
class ErrorTextFactory{
    private static instance:ErrorTextFactory;
    
    constructor(){
        //console.error("Unable to instantiate AppRoomProvider. Class is singleton. Use AppRoomProvider.getIsnstance()");
    }

    public static getInstance():ErrorTextFactory{
        if(!this.instance){
            this.instance = new this();
        }
        return this.instance;
    }
    
    public create(error:string):string{
        var errorText:string = "Неизвестная ошибка";
        switch(error){
            case CallError.OWNER_DENIED_CALLS:
                errorText = "Публикатор запретил звонки в эфир";
                break;
        }
        return errorText;
    }
}
