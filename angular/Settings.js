///<reference path="Host.ts"/>
var Settings = (function () {
    function Settings() {
    }
    Settings.setHost = function (host) {
        Host.getInstance().setHost(host);
    };
    Settings.getHost = function () {
        return Host.getInstance().getHost();
    };
    Settings.getServerUri = function () {
        return Settings.webSocketUriPrefix + Host.getInstance().getHost() + Settings.webSocketUriPostfix;
    };
    //public static webSocketUriPrefix:string = "wss://";
    Settings.webSocketUriPrefix = "ws://";
    Settings.webSocketUriPostfix = "/room";
    Settings.isPublisher = "0";
    Settings.isSubscriber = "1";
    Settings.callTimeoutInterval = 60000;
    Settings.updateSpeakerInterval = 1800;
    Settings.thresholdSpeaker = -50;
    return Settings;
}());
//# sourceMappingURL=Settings.js.map