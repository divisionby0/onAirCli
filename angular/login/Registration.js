var Registration = function($scope, ServiceParticipant, ServiceRoom, LxNotificationService){

    var _room;
    var _that = this;
    var _scope = $scope;
    ParticipantsUtil.getInstance().setSelfName($scope.userName);

    EventBus.addEventListener("APPROVE_INCOMING_CALL_REQUEST", function (callerName) {
        return _that.onApproveIncomingCall(callerName);
    });

    this.onApproveIncomingCall = function(callerName){
        var kurento = ServiceRoom.getKurento();
        kurento.approveIncomingCall($scope.roomName, callerName);
    }

    this.register = function(){
        console.log("Registration.register()");
        $scope.register({userName:$scope.userName, roomName:$scope.roomName});
    }


    $scope.register = function (room) {
        console.log("$scope.register isOwner = "+$scope.isOwner);
        if (!room)
            ServiceParticipant.showError($scope.window, LxNotificationService, {
                error: {
                    message:"Username and room fields are both required"
                }
            });

        
        //var wsUri = Settings.webSocketUriPrefix + location.host + Settings.webSocketUriPostfix;
        var wsUri = Settings.getServerUri();

        //show loopback stream from server
        var displayPublished = $scope.clientConfig.loopbackRemote || false;

        //also show local stream when display my remote
        //var mirrorLocal = $scope.clientConfig.loopbackAndLocal || false;

        var mirrorLocal =  false;

        var kurento = KurentoRoom(wsUri, function (error, kurento) {

            if (error)
                return console.log(error);

            //TODO token should be generated by the server or a 3rd-party component
            //kurento.setRpcParams({token : "securityToken"});


            room = kurento.Room({
                room: $scope.roomName,
                user: $scope.userName,
                isOwner:$scope.isOwner,
                updateSpeakerInterval: $scope.updateSpeakerInterval,
                thresholdSpeaker: $scope.thresholdSpeaker
            });

            console.log("new KurentoRoom ",room);

            var localStreamOptions = {
                audio: true,
                video: true,
                data: true
            }

            var localStream = kurento.Stream(room, localStreamOptions);

            console.log("new KurentoRoom localStreamOptions:",localStreamOptions);

            _room = new AppRoom($scope.isOwner, room, localStream);
            $scope.localStream = localStream;
            AppRoomProvider.getInstance().setAppRoom(_room);
            //$scope.appRoom = _room;

            localStream.addEventListener("access-accepted", function () {
                room.addEventListener("room-connected", function (roomEvent) {
                    var streams = roomEvent.streams;
                    if (displayPublished ) {
                        localStream.subscribeToMyRemote();
                    }

                    _room.init();
                    
                    for (var i = 0; i < streams.length; i++) {
                        ServiceParticipant.addParticipant(streams[i]);
                    }
                });

                room.addEventListener("stream-published", function (streamEvent) {

                    ServiceParticipant.addLocalParticipant(localStream);

                    console.log("stream-published  localStream = ", localStream);

                    $scope.localStream = localStream;

                    if (mirrorLocal && localStream.displayMyRemote()) {
                        var localVideo = kurento.Stream(room, {
                            video: true,
                            data:true,
                            id: "localStream"
                        });
                        localVideo.mirrorLocalStream(localStream.getWrStream());
                        ServiceParticipant.addLocalMirror(localVideo);
                    }
                });

                room.addEventListener("stream-added", function (streamEvent) {
                    ServiceParticipant.addParticipant(streamEvent.stream);
                });

                room.addEventListener("stream-removed", function (streamEvent) {
                    ServiceParticipant.removeParticipantByStream(streamEvent.stream);
                });

                room.addEventListener("newMessage", function (msg) {
                    ServiceParticipant.showMessage(msg.room, msg.user, msg.message);
                });

                room.addEventListener("onCallRequest", function (data) {
                    ServiceParticipant.onCallRequest(data.callerName);
                });
                room.addEventListener("onCancelCallRequest", function (data) {
                    ServiceParticipant.onCancelCallRequest(data.callerName);
                });

                room.addEventListener("error-room", function (error) {
                    ServiceParticipant.showError($scope.window, LxNotificationService, error);
                });

                room.addEventListener("error-media", function (msg) {
                    ServiceParticipant.alertMediaError($scope.window, LxNotificationService, msg.error, function (answer) {
                        console.warn("Leave room because of error: " + answer);
                        if (answer) {
                            kurento.close(true);
                        }
                    });
                });

                room.addEventListener("room-closed", function (msg) {
                    if (msg.room !== $scope.roomName) {
                        console.error("Closed room name doesn't match this room's name",
                            msg.room, $scope.roomName);
                    } else {
                        kurento.close(true);
                        ServiceParticipant.forceClose($scope.window, LxNotificationService, 'Room '
                            + msg.room + ' has been forcibly closed from server');
                    }
                });

                room.addEventListener("lost-connection", function(msg) {
                    kurento.close(true);
                    ServiceParticipant.forceClose($scope.window, LxNotificationService,
                        'Lost connection with room "' + msg.room +
                        '". Please try reloading the webpage...');
                });

                room.addEventListener("stream-stopped-speaking", function (participantId) {
                    ServiceParticipant.streamStoppedSpeaking(participantId);
                });

                room.addEventListener("participant-left", function (participantId) {
                    console.log("on participant left "+participantId);
                    //ServiceParticipant.streamStoppedSpeaking(participantId);
                });

                room.addEventListener("stream-speaking", function (participantId) {
                    ServiceParticipant.streamSpeaking(participantId);
                });

                room.addEventListener("update-main-speaker", function (participantId) {
                    ServiceParticipant.updateMainSpeaker(participantId);
                });

                console.log("connecting to room...");
                room.connect();
            });

            localStream.addEventListener("access-denied", function () {
                ServiceParticipant.showError($scope.window, LxNotificationService, {
                    error : {
                        message : "Access not granted to camera and microphone"
                    }
                });
            });
            localStream.init();
        });

        //save kurento & roomName & userName in service
        ServiceRoom.setKurento(kurento);
        ServiceRoom.setRoomName($scope.roomName);
        ServiceRoom.setUserName($scope.userName);

        new RedirectToCall($scope.window, $scope.isOwner);
    };
}