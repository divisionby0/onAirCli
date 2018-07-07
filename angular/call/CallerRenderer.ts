///<reference path="../lib/events/EventBus.ts"/>
class CallerRenderer{
    private j:any;
    private callerName:string;

    private callerContainer:any;

    constructor(jQuery:any, callerName:string){
        this.j = jQuery;
        this.callerName = callerName;

        var callersContainer = this.j("#callers");
        //this.callerContainer = this.j("<div class='row callerContainer' data-callername='"+callerName+"'>Звонок от "+callerName+"</div>")
        this.callerContainer = this.j("<button class='row callerContainer btn-info' data-callername='"+callerName+"' style='padding: 10px!important;'>Звонок от "+callerName+"</button>");
        this.callerContainer.appendTo(callersContainer);

        this.callerContainer.on("click", (event)=>this.onClick(event))
    }

    public destroy():void{
        this.callerContainer.off("click");
        this.callerContainer.remove();
    }

    private onClick(event:any):void{
        var element = this.j(event.target);
        var callerName = element.data("callername");
        console.log("approve incoming call from "+callerName);
        EventBus.dispatchEvent("APPROVE_INCOMING_CALL",callerName);
    }
}
