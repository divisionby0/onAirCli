declare var kurentoUtils:any;
class WebRTCPeerFactory{

    public static sdpOfferCallback:Function;
    public static generateOffer:Function;
    public static stream:any;

    public static create(isLocal:boolean, displayMyRemote:boolean, sdpOfferCallback:Function, generateOffer:Function, options:any, stream:any):any{

        WebRTCPeerFactory.stream = stream;
        WebRTCPeerFactory.sdpOfferCallback = sdpOfferCallback;
        WebRTCPeerFactory.generateOffer = generateOffer;

        if(isLocal){
            if(displayMyRemote){
                return new kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function (error) {
                    if(error) {
                        return console.error(error);
                    }
                    WebRTCPeerFactory.generateOffer(WebRTCPeerFactory.sdpOfferCallback.bind(WebRTCPeerFactory.stream));
                });
            }
            else{
                return new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function (error) {
                    if(error) {
                        return console.error(error);
                    }
                    WebRTCPeerFactory.generateOffer(WebRTCPeerFactory.sdpOfferCallback.bind(WebRTCPeerFactory.stream));
                });
            }
        }
        else{
            return new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function (error) {
                if(error) {
                    return console.error(error);
                }
                WebRTCPeerFactory.generateOffer(WebRTCPeerFactory.sdpOfferCallback.bind(WebRTCPeerFactory.stream));
            });
        }
    }
}
