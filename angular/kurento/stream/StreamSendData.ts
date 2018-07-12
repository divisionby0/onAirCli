class StreamSendData{
    constructor(data:any, wp:any, dataChannelOpened:boolean){
        if (wp === undefined) {
            throw new Error('WebRTC peer has not been created yet');
        }
        if (!dataChannelOpened) {
            throw new Error('Data channel is not opened');
        }
        console.log("Sending through data channel: " + data);
        wp.send(data);
    }
}
