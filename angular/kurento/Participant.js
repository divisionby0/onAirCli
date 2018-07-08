function Participant(kurento, local, room, options) {

    console.log("new participant");
    var that = this;
    var id = options.id;

    var streams = {};
    var streamsOpts = [];

    console.log("options.streams:",options.streams);

    if (options.streams) {
        for (var i = 0; i < options.streams.length; i++) {
            var streamOpts = {
                id: options.streams[i].id,
                participant: that,
                recvVideo: (options.streams[i].recvVideo == undefined ? true : options.streams[i].recvVideo),
                recvAudio: (options.streams[i].recvAudio == undefined ? true : options.streams[i].recvAudio),
                recvData: (options.streams[i].recvData == undefined ? true : options.streams[i].recvData)
            }
            var stream = new Stream(kurento, false, room, streamOpts);
            addStream(stream);
            streamsOpts.push(streamOpts);
        }
    }
    console.log("New " + (local ? "local " : "remote ") + "participant " + id + ", streams opts: ", streamsOpts);

    that.setId = function (newId) {
        id = newId;
    }

    function addStream(stream) {
        streams[stream.getID()] = stream;
        room.getStreams()[stream.getID()] = stream;
    }

    that.addStream = addStream;

    that.getStreams = function () {
        return streams;
    }

    that.dispose = function () {
        for (var key in streams) {
            streams[key].dispose();
        }
    }

    that.getID = function () {
        return id;
    }

    this.sendIceCandidate = function (candidate) {
        console.debug((local ? "Local" : "Remote"), "candidate for",
            that.getID(), JSON.stringify(candidate));
        kurento.sendRequest("onIceCandidate", {
            endpointName: that.getID(),
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex
        }, function (error, response) {
            if (error) {
                console.error("Error sending ICE candidate: "
                    + JSON.stringify(error));
            }
        });
    }
}
