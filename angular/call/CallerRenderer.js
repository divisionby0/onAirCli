///<reference path="../lib/events/EventBus.ts"/>
var CallerRenderer = (function () {
    function CallerRenderer(jQuery, callerName) {
        var _this = this;
        this.j = jQuery;
        this.callerName = callerName;
        var callersContainer = this.j("#callers");
        //this.callerContainer = this.j("<div class='row callerContainer' data-callername='"+callerName+"'>Звонок от "+callerName+"</div>")
        this.callerContainer = this.j("<button class='row callerContainer btn-info' data-callername='" + callerName + "' style='padding: 10px!important;'>Звонок от " + callerName + "</button>");
        this.callerContainer.appendTo(callersContainer);
        this.callerContainer.on("click", function (event) { return _this.onClick(event); });
    }
    CallerRenderer.prototype.destroy = function () {
        this.callerContainer.off("click");
        this.callerContainer.remove();
    };
    CallerRenderer.prototype.onClick = function (event) {
        var element = this.j(event.target);
        var callerName = element.data("callername");
        console.log("approve incoming call from " + callerName);
        EventBus.dispatchEvent("APPROVE_INCOMING_CALL", callerName);
    };
    return CallerRenderer;
}());
//# sourceMappingURL=CallerRenderer.js.map