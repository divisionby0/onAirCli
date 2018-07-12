var WebRTCPeerFactory = (function () {
    function WebRTCPeerFactory() {
    }
    WebRTCPeerFactory.create = function (isLocal, displayMyRemote, sdpOfferCallback, generateOffer, options, stream) {
        WebRTCPeerFactory.stream = stream;
        WebRTCPeerFactory.sdpOfferCallback = sdpOfferCallback;
        WebRTCPeerFactory.generateOffer = generateOffer;
        if (isLocal) {
            if (displayMyRemote) {
                return new kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function (error) {
                    if (error) {
                        return console.error(error);
                    }
                    WebRTCPeerFactory.generateOffer(WebRTCPeerFactory.sdpOfferCallback.bind(WebRTCPeerFactory.stream));
                });
            }
            else {
                return new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function (error) {
                    if (error) {
                        return console.error(error);
                    }
                    WebRTCPeerFactory.generateOffer(WebRTCPeerFactory.sdpOfferCallback.bind(WebRTCPeerFactory.stream));
                });
            }
        }
        else {
            return new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function (error) {
                if (error) {
                    return console.error(error);
                }
                WebRTCPeerFactory.generateOffer(WebRTCPeerFactory.sdpOfferCallback.bind(WebRTCPeerFactory.stream));
            });
        }
    };
    return WebRTCPeerFactory;
}());
//# sourceMappingURL=WebRTCPeerFactory.js.map