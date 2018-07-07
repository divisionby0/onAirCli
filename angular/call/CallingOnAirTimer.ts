///<reference path="../lib/events/EventBus.ts"/>
class CallingOnAirTimer{
    private interval:number = 60000;
    private timeoutId:number = -1;

    constructor(interval:number){
        this.interval = interval;
    }

    public start():void{
        this.timeoutId = setTimeout(function(){
            console.log("onIntervalComplete");
            EventBus.dispatchEvent("ON_CALLING_TIMED_OUT",null);
        }, this.interval);
    }

    public stop():void{
        clearTimeout(this.timeoutId);
    }
}
