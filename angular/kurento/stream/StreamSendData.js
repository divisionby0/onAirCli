var StreamSendData = (function () {
    function StreamSendData(data, wp, dataChannelOpened) {
        if (wp === undefined) {
            throw new Error('WebRTC peer has not been created yet');
        }
        if (!dataChannelOpened) {
            throw new Error('Data channel is not opened');
        }
        console.log("Sending through data channel: " + data);
        wp.send(data);
    }
    return StreamSendData;
}());
//# sourceMappingURL=StreamSendData.js.map