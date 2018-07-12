function Room(kurento, options) {
    var that = this;

    that.name = options.room;

    var ee = new EventEmitter();
    var streams = {};
    var participants = {};
    var participantsSpeaking = [];
    var connected = false;
    var localParticipant;
    var subscribeToStreams = options.subscribeToStreams || true;
    var updateSpeakerInterval = options.updateSpeakerInterval || 1500;
    var thresholdSpeaker = options.thresholdSpeaker || -50;

    setInterval(updateMainSpeaker, updateSpeakerInterval);

    function updateMainSpeaker() {
        if (participantsSpeaking.length > 0) {
            ee.emitEvent('update-main-speaker', [{
                participantId: participantsSpeaking[participantsSpeaking.length - 1]
            }]);
        }
    }

    this.getLocalParticipant = function () {
        return localParticipant;
    }

    this.addEventListener = function (eventName, listener) {
        ee.addListener(eventName, listener);
    }

    this.emitEvent = function (eventName, eventsArray) {
        ee.emitEvent(eventName, eventsArray);
    }

    this.connect = function () {
        var joinParams = {
            user: options.user,
            room: options.room,
            isOwner:options.isOwner,
            dataChannels:true
        };
        if (localParticipant) {
            if (Object.keys(localParticipant.getStreams()).some(function (streamId) {
                    return streams[streamId].isDataChannelEnabled();
                })) {
                joinParams.dataChannels = true;
            }
        }
        kurento.sendRequest('joinRoom', joinParams, function (error, response) {
            if (error) {
                console.warn('Unable to join room', error);
                ee.emitEvent('error-room', [{
                    error: error
                }]);
            } else {
                connected = true;
                var exParticipants = response.value;

                var roomEvent = {
                    participants: [],
                    streams: []
                }

                var length = exParticipants.length;
                for (var i = 0; i < length; i++) {

                    var participant = new Participant(kurento, false, that, exParticipants[i]);

                    participants[participant.getID()] = participant;

                    roomEvent.participants.push(participant);

                    var streams = participant.getStreams();
                    for (var key in streams) {
                        roomEvent.streams.push(streams[key]);
                        if (subscribeToStreams) {
                            streams[key].subscribe();
                        }
                    }
                }
                ee.emitEvent('room-connected', [roomEvent]);
            }
        });
    }

    this.subscribe = function (stream) {
        stream.subscribe();
    }

    this.onParticipantPublished = function (options) {
        var participant = new Participant(kurento, false, that, options);

        var pid = participant.getID();
        if (!(pid in participants)) {
            console.info("Publisher not found in participants list by its id", pid);
        } else {
            console.log("Publisher found in participants list by its id", pid);
        }
        //replacing old participant (this one has streams)
        participants[pid] = participant;

        ee.emitEvent('participant-published', [{
            participant: participant
        }]);

        var streams = participant.getStreams();
        for (var key in streams) {
            var stream = streams[key];

            if (subscribeToStreams) {
                stream.subscribe();
                ee.emitEvent('stream-added', [{
                    stream: stream
                }]);
            }
        }
    }

    this.onParticipantJoined = function (msg) {
        var participant = new Participant(kurento, false, that, msg);
        var pid = participant.getID();
        if (!(pid in participants)) {
            console.log("New participant to participants list with id", pid);
            participants[pid] = participant;
        } else {
            //use existing so that we don't lose streams info
            console.info("Participant already exists in participants list with " +
                "the same id, old:", participants[pid], ", joined now:", participant);
            participant = participants[pid];
        }

        ee.emitEvent('participant-joined', [{
            participant: participant
        }]);
    }

    this.onParticipantLeft = function (msg) {

        var participant = participants[msg.name];

        EventBus.dispatchEvent("ON_PARTICIPANT_LEFT", msg.name);

        if (participant !== undefined) {
            delete participants[msg.name];

            ee.emitEvent('participant-left', [{
                participant: participant
            }]);

            var streams = participant.getStreams();
            for (var key in streams) {
                ee.emitEvent('stream-removed', [{
                    stream: streams[key]
                }]);
            }

            participant.dispose();
        } else {
            console.warn("Participant " + msg.name + " unknown. Participants: " + JSON.stringify(participants));
        }
    };

    this.onParticipantEvicted = function (msg) {
        ee.emitEvent('participant-evicted', [{
            localParticipant: localParticipant
        }]);
    };

    this.onCallRequest = function(params){
        console.log("onCallRequest: " + JSON.stringify(params));
        var callerName = params.callerName;

        ee.emitEvent('onCallRequest', [{
            callerName: callerName
        }]);
    }
    this.onCallRequestError = function(params){
        EventBus.dispatchEvent("ON_CALL_REQUEST_ERROR", params);
    }
    this.onCancelCallRequest = function(params){
        console.log("onCancelCallRequest: " + JSON.stringify(params));
        var callerName = params.callerName;

        EventBus.dispatchEvent("ON_CANCEL_CALL_REQUEST", callerName);

        ee.emitEvent('onCancelCallRequest', [{
            callerName: callerName
        }]);
    }
    this.onRoomNotExists = function(params){
        console.log("onRoomNotExists: " + JSON.stringify(params));
        EventBus.dispatchEvent("ON_ROOM_NOT_EXISTS",params.roomName);
    }

    this.callApproved = function(params){
        console.log("callApproved: " + JSON.stringify(params));
        EventBus.dispatchEvent("ON_CALL_APPROVED",null);
    }
    this.dropConversation = function(params){
        console.log("dropConversation: " + JSON.stringify(params));
        console.log("owned dropped conversation");
        EventBus.dispatchEvent("DROP_CONVERSATION", null);
    }

    this.onNewFile = function(fileData){
        new ReceiveFile(fileData);
    }

    this.onNewMessage = function (msg) {
        console.log("New message: " + JSON.stringify(msg));
        var room = msg.room;
        var user = msg.user;
        var message = msg.message;

        if (user !== undefined) {
            ee.emitEvent('newMessage', [{
                room: room,
                user: user,
                message: message
            }]);
        } else {
            console.error("User undefined in new message:", msg);
        }
    }

    this.recvIceCandidate = function (msg) {
        var candidate = {
            candidate: msg.candidate,
            sdpMid: msg.sdpMid,
            sdpMLineIndex: msg.sdpMLineIndex
        }
        var participant = participants[msg.endpointName];
        if (!participant) {
            console.error("Participant not found for endpoint " +
                msg.endpointName + ". Ice candidate will be ignored.",
                candidate);
            return false;
        }
        var streams = participant.getStreams();
        for (var key in streams) {
            var stream = streams[key];
            stream.getWebRtcPeer().addIceCandidate(candidate, function (error) {
                if (error) {
                    console.error("Error adding candidate for " + key
                        + " stream of endpoint " + msg.endpointName
                        + ": " + error);
                    return;
                }
            });
        }
    }

    this.onRoomClosed = function (msg) {
        console.log("Room closed: " + JSON.stringify(msg));
        var room = msg.room;
        if (room !== undefined) {
            ee.emitEvent('room-closed', [{
                room: room
            }]);
        } else {
            console.error("Room undefined in on room closed", msg);
        }
    }

    this.onLostConnection = function() {
        if (!connected) {
            console.warn('Not connected to room, ignoring lost connection notification');
            return false;
        }

        console.log('Lost connection in room ' + that.name);
        var room = that.name;
        if (room !== undefined) {
            ee.emitEvent('lost-connection', [{
                room: room
            }]);
        } else {
            console.error('Room undefined when lost connection');
        }
    }

    this.onMediaError = function(params) {
        console.error("Media error: " + JSON.stringify(params));
        var error = params.error;
        if (error) {
            ee.emitEvent('error-media', [{
                error: error
            }]);
        } else {
            console.error("Received undefined media error. Params:", params);
        }
    }

    /*
     * forced means the user was evicted, no need to send the 'leaveRoom' request
     */
    this.leave = function (forced, jsonRpcClient) {
        forced = !!forced;
        console.log("Leaving room (forced=" + forced + ")");

        if (connected && !forced) {
            kurento.sendRequest('leaveRoom', function(error, response) {
                if (error) {
                    console.error(error);
                }
                jsonRpcClient.close();
            });
        } else {
            jsonRpcClient.close();
        }
        connected = false;
        if (participants) {
            for (var pid in participants) {
                participants[pid].dispose();
                delete participants[pid];
            }
        }
    }

    this.disconnect = function (stream) {
        var participant = stream.getParticipant();
        if (!participant) {
            console.error("Stream to disconnect has no participant", stream);
            return false;
        }

        delete participants[participant.getID()];
        participant.dispose();

        if (participant === localParticipant) {
            console.log("Unpublishing my media (I'm " + participant.getID() + ")");
            delete localParticipant;
            kurento.sendRequest('unpublishVideo', function (error, response) {
                if (error) {
                    console.error(error);
                } else {
                    console.info("Media unpublished correctly");
                }
            });
        } else {
            console.log("Unsubscribing from " + stream.getGlobalID());
            kurento.sendRequest('unsubscribeFromVideo', {
                    sender: stream.getGlobalID()
                },
                function (error, response) {
                    if (error) {
                        console.error(error);
                    } else {
                        console.info("Unsubscribed correctly from " + stream.getGlobalID());
                    }
                });
        }
    }

    this.getStreams = function () {
        return streams;
    }

    this.addParticipantSpeaking = function(participantId) {
        participantsSpeaking.push(participantId);
    }

    this.removeParticipantSpeaking = function(participantId) {
        var pos = -1;
        for (var i = 0; i < participantsSpeaking.length; i++) {
            if (participantsSpeaking[i] == participantId) {
                pos = i;
                break;
            }
        }
        if (pos != -1) {
            participantsSpeaking.splice(pos, 1);
        }
    }

    localParticipant = new Participant(kurento, true, that, {id: options.user});
    participants[options.user] = localParticipant;
}
