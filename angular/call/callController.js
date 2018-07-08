kurento_room.controller('callController', function ($scope, $window, ServiceParticipant, ServiceRoom, Fullscreen, LxNotificationService, $routeParams) {
    $scope.roomName = ServiceRoom.getRoomName();
    $scope.userName = ServiceRoom.getUserName();
    $scope.participants = ServiceParticipant.getParticipants();
    $scope.kurento = ServiceRoom.getKurento();
    $scope.callingOnAirTimer = new CallingOnAirTimer(Settings.callTimeoutInterval);

    var _that = this;

    // TODO разобратьтся в dataChannel на примере https://github.com/webrtc/samples/blob/gh-pages/src/content/datachannel/filetransfer/js/main.js
    // TODO убрать тестирование отсылки в dataChannel из lib/KurentoRoom.js:543
    // TODO также менял код в lib/kurento-utils.js:192
    
    $scope.state = "NORMAL";
    $scope.canReceiveCalls = true;

    console.log("call controller $=",$);
    _that.jQuery = $;

    this.removeListeners = function(){
        EventBus.removeEventListener("APPROVE_INCOMING_CALL", function (callerName) {
            return _that.onApproveIncomingCall(callerName);
        });

        EventBus.removeEventListener("ON_CALLING_TIMED_OUT", function () {
            return _that.onCallingTimedOut();
        });
        EventBus.removeEventListener("ON_CALL_APPROVED", function () {
            return _that.onCallApproved();
        });
        EventBus.removeEventListener("ON_PARTICIPANT_LEFT", function (participantName) {
            return _that.onParticipantLeft(participantName);
        });
        EventBus.removeEventListener("ON_CANCEL_CALL_REQUEST", function (participantName) {
            return _that.onParticipantLeft(participantName);
        });
        EventBus.removeEventListener("ON_CALL_REQUEST_ERROR", function (errorData) {
            return _that.onCallRequestError(errorData);
        });

        EventBus.removeEventListener("DROP_CONVERSATION", function () {
            console.log("Drop Conversation ");

            ServiceRoom.getKurento().close();
            ServiceParticipant.removeParticipants();

            _that.refreshSubscriberPage();
        });
        EventBus.removeEventListener("ON_IMAGE_LOADED", function (imageData) {
            return _that.onImageLoaded(imageData);
        });
    }

    this.createListeners = function(){
        EventBus.addEventListener("APPROVE_INCOMING_CALL", function (callerName) {
            return _that.onApproveIncomingCall(callerName);
        });

        EventBus.addEventListener("ON_CALLING_TIMED_OUT", function () {
            return _that.onCallingTimedOut();
        });
        EventBus.addEventListener("ON_CALL_APPROVED", function () {
            return _that.onCallApproved();
        });
        EventBus.addEventListener("ON_PARTICIPANT_LEFT", function (participantName) {
            return _that.onParticipantLeft(participantName);
        });
        EventBus.addEventListener("ON_CANCEL_CALL_REQUEST", function (participantName) {
            return _that.onParticipantLeft(participantName);
        });
        EventBus.addEventListener("ON_CALL_REQUEST_ERROR", function (errorData) {
            return _that.onCallRequestError(errorData);
        });

        EventBus.addEventListener("DROP_CONVERSATION", function () {
            console.log("Drop Conversation ");

            ServiceRoom.getKurento().close();
            ServiceParticipant.removeParticipants();

            _that.refreshSubscriberPage();
        });

        EventBus.addEventListener("ON_IMAGE_LOADED", function (imageData) {
            return _that.onImageLoaded(imageData);
        });
    }

    this.onImageLoaded = function(imageData){
        console.log("imageLoaded ",imageData);
        _that.jQuery("#insertImageModal").modal('hide');

        var kurento = ServiceRoom.getKurento();
        kurento.sendImage($scope.roomName, imageData);
        
    }

    this.refreshSubscriberPage = function(){
        _that.removeListeners();
        console.log("refreshSubscriberPage url="+'#/subscriberLogin?type=1&roomName='+$scope.roomName+'&userName='+$scope.userName);

        ServiceParticipant.updateInfo("Завершение звонка...");

        setTimeout(function(){
            window.location.href = '#/subscriberLogin?type=1&roomName='+$scope.roomName+'&userName='+$scope.userName;
        },3000);
    }

    this.onApproveIncomingCall = function(callerName){
        console.log("onApproveIncomingCall callerName="+callerName+"  state="+$scope.state);
        if($scope.state == "NORMAL"){
            EventBus.dispatchEvent("APPROVE_INCOMING_CALL_REQUEST", callerName);
            ServiceParticipant.callApproved(callerName);

            $scope.currentConversationCallerName = callerName;
            $scope.state = "SPEAKING";
            ServiceParticipant.onStateChanged($scope.state);
        }
        else if($scope.state == "SPEAKING"){

            // stop conversation with prev subscriber
            console.log("stop conversation with prev subscriber");
            $scope.cancelCall(true);

            setTimeout(function(callerName){
                $scope.state = "NORMAL";
                ServiceParticipant.setCurrentConversationUserName(callerName);
                ServiceParticipant.onStateChanged($scope.state);
                _that.onApproveIncomingCall(callerName);
            },500, callerName);
        }
    }

    this.showSimpleError = function(text){
        ServiceParticipant.showSimpleError(text);
    }

    this.onCallingTimedOut = function(){
        console.log("onCallingTimedOut callerName=",$scope.userName);

        $scope.state = "NORMAL";
        ServiceParticipant.onStateChanged($scope.state);

        var kurento = ServiceRoom.getKurento();
        kurento.cancelCallRequest($scope.roomName, $scope.userName);
    }
    this.onCallApproved = function(){
        $scope.state = "SPEAKING";
        ServiceParticipant.onStateChanged($scope.state);
        $scope.callingOnAirTimer.stop();
    }
    this.onParticipantLeft = function(userName){
        if($scope.state == "SPEAKING"){
            if($scope.currentConversationCallerName == userName){
                setNormalState();
                ServiceParticipant.onCancelCallRequest($scope.currentConversationCallerName);

                //var participants = ServiceParticipant.getParticipants();
                ServiceParticipant.removeParticipant(userName+"_webcam");
            }
        }
    }
    this.onCallRequestError = function(errorData){
        console.log("onCallRequestError");
        setNormalState();

        var error = errorData.errorText;
        var errorText = ErrorTextFactory.getInstance().create(error);

        ServiceParticipant.showSimpleError(errorText);
    }

    $scope.addImage = function(){
        _that.jQuery("#insertImageModal").modal('show');
        new LoadImage();
    }
    
    $scope.clearImageOverlay=function(){
        new ClearImageOverlay();
    }


    $scope.sendDataChannelMessage = function(){
        console.log("sending test data...");
        AppRoomProvider.getInstance().getAppRoom().sendData("test");
    }
    $scope.leaveRoom = function () {

        ServiceRoom.getKurento().close();

        ServiceParticipant.removeParticipants();

        //redirect to login
        $window.location.href = '#/login';
    };

    window.onbeforeunload = function () {
    	//not necessary if not connected
    	if (ServiceParticipant.isConnected()) {
    		ServiceRoom.getKurento().close();
    	}
    };

    $scope.goFullscreen = function () {
        if (Fullscreen.isEnabled())
            Fullscreen.cancel();
        else
            Fullscreen.all();

    };
    
    $scope.disableMainSpeaker = function (value) {
    	var element = document.getElementById("buttonMainSpeaker");
        if (element.classList.contains("md-person")) { //on
            element.classList.remove("md-person");
            element.classList.add("md-recent-actors");
            ServiceParticipant.enableMainSpeaker();
        } else { //off
            element.classList.remove("md-recent-actors");
            element.classList.add("md-person");
            ServiceParticipant.disableMainSpeaker();
        }
    }

    $scope.onOffVolume = function () {
        var localStream = ServiceRoom.getLocalStream();
        var element = document.getElementById("buttonVolume");
        if (element.classList.contains("md-volume-off")) { //on
            element.classList.remove("md-volume-off");
            element.classList.add("md-volume-up");
            localStream.audioEnabled = true;
        } else { //off
            element.classList.remove("md-volume-up");
            element.classList.add("md-volume-off");
            localStream.audioEnabled = false;

        }
    };

    $scope.onOffVideocam = function () {
        var localStream = ServiceRoom.getLocalStream();
        var element = document.getElementById("buttonVideocam");
        if (element.classList.contains("md-videocam-off")) {//on
            element.classList.remove("md-videocam-off");
            element.classList.add("md-videocam");
            localStream.videoEnabled = true;
        } else {//off
            element.classList.remove("md-videocam");
            element.classList.add("md-videocam-off");
            localStream.videoEnabled = false;
        }
    };

    $scope.disconnectStream = function() {
    	var localStream = ServiceRoom.getLocalStream();
    	var participant = ServiceParticipant.getMainParticipant();
    	if (!localStream || !participant) {
    		LxNotificationService.alert('Error!', "Not connected yet", 'Ok', function(answer) {
            });
    		return false;
    	}
    	ServiceParticipant.disconnectParticipant(participant);
    	ServiceRoom.getKurento().disconnectParticipant(participant.getStream());
    }

    $scope.cancelCall = function(isOwner){
        console.log("Cancel calling... is Owner: ",isOwner);

        if(isOwner){
            ownerDropConversation();
        }
        else{
            if($scope.state == "CALLING"){
                dropCallRequest();
            }
            else if($scope.state == "SPEAKING"){
                //dropConversation();

                ServiceRoom.getKurento().close();
                ServiceParticipant.removeParticipants();

                _that.refreshSubscriberPage();
                //redirect to login
                //$window.location.href = '#/login';
            }
        }
    }

    function dropCallRequest(){
        setNormalState();

        var kurento = ServiceRoom.getKurento();
        kurento.cancelCallRequest($scope.roomName, $scope.userName);
    }

    function dropConversation(){
        console.log("Caller drop conversation");
        ServiceRoom.getKurento().close();
        ServiceParticipant.removeParticipants();

        // refresh page
        window.location.href = '#/subscriberLogin?type=1&roomName='+$scope.roomName+'&userName='+$scope.userName;
    }
    function ownerDropConversation(){
        setNormalState();

        console.log("ownerDropConversation() $scope.currentConversationCallerName ", $scope.currentConversationCallerName);

        var kurento = ServiceRoom.getKurento();
        kurento.ownerDropConversationRequest($scope.roomName, $scope.currentConversationCallerName);

        var message = {name:$scope.currentConversationCallerName};
        var appRoom = AppRoomProvider.getInstance().getAppRoom();
        console.log("appRoom ",appRoom);
        appRoom.removeParticipant(message);

        ServiceParticipant.onCancelCallRequest($scope.currentConversationCallerName);
    }

    function setNormalState(){
        $scope.state = "NORMAL";
        ServiceParticipant.onStateChanged($scope.state);
        $scope.callingOnAirTimer.stop();
    }

    $scope.toggleReceiveCalls = function(){
        switch($scope.canReceiveCalls){
            case true:
                $scope.canReceiveCalls = false;
                break;
            case false:
                $scope.canReceiveCalls = true;
                break;
        }

        _that.onReceiveCallsStateChanged();
    }

    this.onReceiveCallsStateChanged = function(){
        var element = document.getElementById("buttonReceiveCalls");
        switch($scope.canReceiveCalls){
            case true:
                element.classList.remove("md-call-missed");
                element.classList.add("md-phone");
                break;
            case false:
                element.classList.remove("md-phone");
                element.classList.add("md-call-missed");
                break;
        }

        var kurento = ServiceRoom.getKurento();
        kurento.receiveIncomingCallsChangeStateRequest($scope.roomName, $scope.canReceiveCalls);

        if($scope.state!="NORMAL" && !$scope.canReceiveCalls){
            // drop current call
            $scope.cancelCall(true);
        }
    }
    
    $scope.callRequest = function(){
        if($scope.state == "CALLING"){
            alert("Вы уже пытаетесь дозвониться.");
            return;
        }
        else if($scope.state == "SPEAKING"){
            alert("Вы уже в прямом эфире.");
            return;
        }

        $scope.state = "CALLING";
        ServiceParticipant.onStateChanged($scope.state);

        // start calling timeout
        $scope.callingOnAirTimer.start();

        var kurento = ServiceRoom.getKurento();
        kurento.callRequest($scope.roomName, $scope.userName);
    }

    $scope.approveIncomingCall = function(callerName){
        var kurento = ServiceRoom.getKurento();
        kurento.approveIncomingCall($scope.roomName, callerName);
    }

    //chat
    $scope.message;

    $scope.sendMessage = function () {
        console.log("Sending message", $scope.message);
        var kurento = ServiceRoom.getKurento();
        kurento.sendMessage($scope.roomName, $scope.userName, $scope.message);
        $scope.message = "";
    };

    //open or close chat when click in chat button
    $scope.toggleChat = function () {
        var selectedEffect = "slide";
        // most effect types need no options passed by default
        var options = {direction: "right"};
        if ($("#effect").is(':visible')) {
            $("#content").animate({width: '100%'}, 500);
        } else {
            $("#content").animate({width: '80%'}, 500);
        }
        // run the effect
        $("#effect").toggle(selectedEffect, options, 500);
    };

    $scope.showImage = function(){

    }

    $scope.showHat = function () {
    	var targetHat = false;
    	var offImgStyle = "md-mood";
    	var offColorStyle = "btn--deep-purple";
    	var onImgStyle = "md-face-unlock";
    	var onColorStyle = "btn--purple";
    	var element = document.getElementById("hatButton");
        if (element.classList.contains(offImgStyle)) { //off
            element.classList.remove(offImgStyle);
            element.classList.remove(offColorStyle);
            element.classList.add(onImgStyle);
            element.classList.add(onColorStyle);
            targetHat = true;
        } else if (element.classList.contains(onImgStyle)) { //on
            element.classList.remove(onImgStyle);
            element.classList.remove(onColorStyle);
            element.classList.add(offImgStyle);
            element.classList.add(offColorStyle);
            targetHat = false;
        }
    	
        var hatTo = targetHat ? "on" : "off";
    	console.log("Toggle hat to " + hatTo);
    	ServiceRoom.getKurento().sendCustomRequest({hat: targetHat}, function (error, response) {
    		if (error) {
                console.error("Unable to toggle hat " + hatTo, error);
                LxNotificationService.alert('Error!', "Unable to toggle hat " + hatTo, 'Ok', function(answer) {});
        		return false;
            } else {
            	console.debug("Response on hat toggle", response);
            }
    	});
    };

    this.createListeners();
});


