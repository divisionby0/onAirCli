///<reference path="call/CallError.ts"/>
var ErrorTextFactory = (function () {
    function ErrorTextFactory() {
        //console.error("Unable to instantiate AppRoomProvider. Class is singleton. Use AppRoomProvider.getIsnstance()");
    }
    ErrorTextFactory.getInstance = function () {
        if (!this.instance) {
            this.instance = new this();
        }
        return this.instance;
    };
    ErrorTextFactory.prototype.create = function (error) {
        var errorText = "Неизвестная ошибка";
        switch (error) {
            case CallError.OWNER_DENIED_CALLS:
                errorText = "Публикатор запретил звонки в эфир";
                break;
        }
        return errorText;
    };
    return ErrorTextFactory;
}());
//# sourceMappingURL=ErrorTextFactory.js.map