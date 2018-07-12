function KurentoRoom(wsUri, callback) {
    if (!(this instanceof KurentoRoom))
        return new KurentoRoom(wsUri, callback);

    var that = this;

    var room;

    var userName;

    var jsonRpcClient;

    function initJsonRpcClient() {

        var config = {
            heartbeat: 3000,
            sendCloseMessage: false,
            ws: {
                uri: wsUri,
                useSockJS: false,
                onconnected: connectCallback,
                ondisconnect: disconnectCallback,
                onreconnecting: reconnectingCallback,
                onreconnected: reconnectedCallback
            },
            rpc: {
                requestTimeout: 15000,
                //notifications
                participantJoined: onParticipantJoined,
                participantPublished: onParticipantPublished,
                participantUnpublished: onParticipantLeft,
                participantLeft: onParticipantLeft,
                participantEvicted: onParticipantEvicted,
                sendMessage: onNewMessage,
                sendFile: onNewFile,
                roomClosed: onRoomClosed,
                onCallRequest: onCallRequest,
                onCallRequestError: onCallRequestError,
                onCancelCallRequest: onCancelCallRequest,
                onRoomNotExists: onRoomNotExists,
                callApproved: callApproved,
                dropConversation: dropConversation,
                iceCandidate: iceCandidateEvent,
                mediaError: onMediaError
            }
        };

        jsonRpcClient = new RpcBuilder.clients.JsonRpcClient(config);
    }

    function connectCallback(error) {
        if (error) {
            callback(error);
        } else {
            callback(null, that);
        }
    }

    function isRoomAvailable() {
        if (room !== undefined && room instanceof Room) {
            return true;
        } else {
            console.warn('Room instance not found');
            return false;
        }
    }

    function disconnectCallback() {
        console.log('Websocket connection lost');
        if (isRoomAvailable()) {
            room.onLostConnection();
        } else {
            alert('Connection error. Please reload page.');
        }
    }

    function reconnectingCallback() {
        console.log('Websocket connection lost (reconnecting)');
        if (isRoomAvailable()) {
            room.onLostConnection();
        } else {
            alert('Connection error. Please reload page.');
        }
    }

    function reconnectedCallback() {
        console.log('Websocket reconnected');
    }

    function onParticipantJoined(params) {
        if (isRoomAvailable()) {
            room.onParticipantJoined(params);
        }
    }

    function onParticipantPublished(params) {
        if (isRoomAvailable()) {
            room.onParticipantPublished(params);
        }
    }

    function onParticipantLeft(params) {
        if (isRoomAvailable()) {
            room.onParticipantLeft(params);
        }
    }

    function onParticipantEvicted(params) {
        if (isRoomAvailable()) {
            room.onParticipantEvicted(params);
        }
    }

    function onNewMessage(params) {
        if (isRoomAvailable()) {
            room.onNewMessage(params);
        }
    }
    function onNewFile(params){
        if (isRoomAvailable()) {
            room.onNewFile(params);
        }
    }

    function iceCandidateEvent(params) {
        if (isRoomAvailable()) {
            room.recvIceCandidate(params);
        }
    }

    function onRoomClosed(params) {
        if (isRoomAvailable()) {
            room.onRoomClosed(params);
        }
    }
    function onCallRequest(params){
        if (isRoomAvailable()) {
            room.onCallRequest(params);
        }
    }
    function onCallRequestError(params){
        if (isRoomAvailable()) {
            room.onCallRequestError(params);
        }
    }
    function onCancelCallRequest(params){
        if (isRoomAvailable()) {
            room.onCancelCallRequest(params);
        }
    }

    function onRoomNotExists(params){
        if (isRoomAvailable()) {
            room.onRoomNotExists(params);
        }
    }

    function callApproved(params){
        if (isRoomAvailable()) {
            room.callApproved(params);
        }
    }
    function dropConversation(params){
        if (isRoomAvailable()) {
            room.dropConversation(params);
        }
    }

    function onMediaError(params) {
        if (isRoomAvailable()) {
            room.onMediaError(params);
        }
    }

    var rpcParams;

    this.setRpcParams = function (params) {
        rpcParams = params;
    }

    this.sendRequest = function (method, params, callback) {
        if (params && params instanceof Function) {
            callback = params;
            params = undefined;
        }
        params = params || {};

        if (rpcParams && rpcParams !== "null" && rpcParams !== "undefined") {
            for(var index in rpcParams) {
                if (rpcParams.hasOwnProperty(index)) {
                    params[index] = rpcParams[index];
                    console.log('RPC param added to request {' + index + ': ' + rpcParams[index] + '}');
                }
            }
        }
        //console.log('Sending request: { method:"' + method + '", params: ' + JSON.stringify(params) + ' }');
        jsonRpcClient.send(method, params, callback);
    };

    this.close = function (forced) {
        if (isRoomAvailable()) {
            room.leave(forced, jsonRpcClient);
        }
    };

    this.disconnectParticipant = function(stream) {
        if (isRoomAvailable()) {
            room.disconnect(stream);
        }
    };

    this.Stream = function (room, options) {
        options.participant = room.getLocalParticipant();
        return new Stream(that, true, room, options);
    };

    this.Room = function (options) {
        room = new Room(that, options);
        return room;
    };

    this.cancelCallRequest = function(room, user){
        this.sendRequest('cancelCallRequest', {room: room, callerName: user}, function (error, response) {
            if (error) {
                //console.error(error);
            }
        });
    }
    this.ownerDropConversationRequest = function(room, user){
        this.sendRequest('dropConversationRequest', {room: room, callerName: user}, function (error, response) {
            if (error) {
                //console.error(error);
            }
        });
    }

    this.callRequest = function(room, user){
        this.sendRequest('callRequest', {room: room, callerName: user}, function (error, response) {
            if (error) {
                //console.error(error);
            }
        });
    }
    this.approveIncomingCall = function(room, callerName){
        console.log("room approve incoming call from "+callerName);
        this.sendRequest('callApproved', {room:room, callerName: callerName}, function (error, response) {
            if (error) {
                //console.error(error);
            }
        });
    }
    this.receiveIncomingCallsChangeStateRequest = function(room, state){
        console.log("room receiveIncomingCallsChangeStateRequest room:", room, "state:",state);
        this.sendRequest('setCanReceiveIncomingCalls', {room:room, state: state}, function (error, response) {
            if (error) {
                console.error(error);
            }
        });
    }

    //CHAT
    this.sendMessage = function (room, user, message) {
        this.sendRequest('sendMessage', {message: message, userMessage: user, roomMessage: room}, function (error, response) {
            if (error) {
                console.error(error);
            }
        });
    };

    this.sendFile = function(room, currentPacketData, packetProperties){
        console.log("sending image currentPacketData ",currentPacketData);
        console.log("packetProperties:",packetProperties);

        this.sendRequest('sendFile', {room:room, packet:currentPacketData, id:packetProperties.id, c:packetProperties.current, t:packetProperties.total, tp:packetProperties.type}, function (error, response) {
            if (error) {
                //console.error(error);
            }
            else{
                console.log("sendImage response: ",response);
            }
        });
    }

    this.sendCustomRequest = function (params, callback) {
        this.sendRequest('customRequest', params, callback);
    };

    initJsonRpcClient();
}
