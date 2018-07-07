///<reference path="../lib/events/EventBus.ts"/>
var CallingOnAirTimer = (function () {
    function CallingOnAirTimer(interval) {
        this.interval = 60000;
        this.timeoutId = -1;
        this.interval = interval;
    }
    CallingOnAirTimer.prototype.start = function () {
        this.timeoutId = setTimeout(function () {
            console.log("onIntervalComplete");
            EventBus.dispatchEvent("ON_CALLING_TIMED_OUT", null);
        }, this.interval);
    };
    CallingOnAirTimer.prototype.stop = function () {
        clearTimeout(this.timeoutId);
    };
    return CallingOnAirTimer;
}());
//# sourceMappingURL=CallingOnAirTimer.js.map