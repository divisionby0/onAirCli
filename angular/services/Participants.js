function AppParticipant(stream) {

    this.stream = stream;
    this.videoElement;
    this.thumbnailId;
    
    var that = this;

    this.j = jQuery.noConflict();
    var that = this;

    this.getStream = function() {
		return this.stream;
	}

    this.setMain = function () {
        var mainVideo = document.getElementById("main-video");
        var oldVideo;

        if(mainVideo){
            oldVideo = mainVideo.firstChild;
        }

        stream.playOnlyVideo("main-video", that.thumbnailId);

        that.videoElement.className += " active-video";

        if (oldVideo !== null) {
            mainVideo.removeChild(oldVideo);
        }
    }

    this.removeMain = function () {
        that.j(that.videoElement).removeClass("active-video");
    }

    this.remove = function () {
        if (that.videoElement !== undefined) {
            if (that.videoElement.parentNode !== null) {
                that.videoElement.parentNode.removeChild(that.videoElement);
            }
        }
    }

    function playVideo() {

        that.thumbnailId = "video-" + stream.getGlobalID();

        that.videoElement = document.createElement('div');
        that.videoElement.setAttribute("id", that.thumbnailId);
        that.videoElement.className = "video participantSmallScreen";

        var buttonVideo = document.createElement('button');
        buttonVideo.className = 'action btn btn--m btn--orange btn--fab mdi md-desktop-mac';
        
        //FIXME this won't work, Angular can't get to bind the directive ng-click nor lx-ripple
        buttonVideo.setAttribute("ng-click", "disconnectStream();$event.stopPropagation();");
        buttonVideo.setAttribute("lx-ripple", "");
        buttonVideo.style.position = "absolute";
        buttonVideo.style.left = "75%";
        buttonVideo.style.top = "60%";
        buttonVideo.style.zIndex = "100";
        that.videoElement.appendChild(buttonVideo);
        
        var speakerSpeakingVolumen = document.createElement('div');
        speakerSpeakingVolumen.setAttribute("id","speaker" + that.thumbnailId);
        speakerSpeakingVolumen.className = 'btn--m btn--green btn--fab mdi md-volume-up blinking';
        speakerSpeakingVolumen.style.position = "absolute";
        speakerSpeakingVolumen.style.left = "3%";
        speakerSpeakingVolumen.style.top = "60%";
        speakerSpeakingVolumen.style.zIndex = "100";
        speakerSpeakingVolumen.style.display = "none";
        that.videoElement.appendChild(speakerSpeakingVolumen);

        document.getElementById("participants").appendChild(that.videoElement);
        that.stream.playThumbnail(that.thumbnailId);
    }

    playVideo();
}

function Participants() {
    var mainParticipant;
    var localParticipant;
    var mirrorParticipant;
    var participants = {};
    var roomName;
    var that = this;
    var connected = true;
    var displayingRelogin = false;
    var mainSpeaker = true;

    that.callerRenderers = new Map("callerRenderers");
    that.currentConversationUserName;

    this.j = jQuery.noConflict();
    var that = this;

    this.setCurrentConversationUserName = function(userName){
        //that.currentConversationUserName = userName;
        //console.log("setCurrentConversationUserName "+that.currentConversationUserName);
    }

    this.callApproved = function(callerName){
        var callerRenderer = that.callerRenderers.get(callerName);
        that.currentConversationUserName = callerName;
        callerRenderer.destroy();
    }
    this.showSimpleError = function(errorText){
        new ErrorView(errorText);
    }

    this.isConnected = function() {
    	return connected;
    }
    
    this.getRoomName = function () {
        console.log("room - getRoom " + roomName);
        roomName = room.name;
        return roomName;
    };

    this.getMainParticipant = function() {
		return mainParticipant;
	}
    
    function updateVideoStyle() {
        //var MAX_WIDTH = 14;
        var MAX_WIDTH = 49;
        var numParticipants = Object.keys(participants).length;
        var maxParticipantsWithMaxWidth = 98 / MAX_WIDTH;

        if (numParticipants > maxParticipantsWithMaxWidth) {
            that.j('.video').css({"width": (98 / numParticipants) + "%"});
        } else {
            that.j('.video').css({"width": MAX_WIDTH + "%"});
        }
    };

    function updateMainParticipant(participant) {
        if (mainParticipant) {
        	mainParticipant.removeMain();
        }
        mainParticipant = participant;
        mainParticipant.setMain();
    }

    this.addLocalParticipant = function (stream) {
        localParticipant = that.addParticipant(stream);
        mainParticipant = localParticipant;
        mainParticipant.setMain();
    };

    this.addLocalMirror = function (stream) {
		mirrorParticipant = that.addParticipant(stream);
	};
    
    this.addParticipant = function (stream) {
        console.log("addParticipant stream=",stream);
        console.log("stream id: ",stream.getID());
        console.log("stream GlobalID: ",stream.getGlobalID());
        console.log("stream isDataChannelEnabled: ",stream.isDataChannelEnabled());

        var streamGlobalId = stream.getGlobalID();
        var participantName = streamGlobalId.split("_")[0];
        console.log("participantName:",participantName);

        var isOwner = ParticipantsUtil.getInstance().isOwner(participantName);
        var isSelf = ParticipantsUtil.getInstance().isSelf(participantName);
        console.log("isOwner:",isOwner);

        console.log("is self participant: ",isSelf);

        var participant = new AppParticipant(stream);
        participants[stream.getGlobalID()] = participant;

        updateVideoStyle();

        that.j(participant.videoElement).click(function (e) {
            updateMainParticipant(participant);
        });


        // auto show main video
        updateMainParticipant(participant);

        return participant;
    };
    
    this.removeParticipantByStream = function (stream) {
        this.removeParticipant(stream.getGlobalID());
    };

    this.disconnectParticipant = function (appParticipant) {
    	this.removeParticipant(appParticipant.getStream().getGlobalID());
    };

    this.removeParticipant = function (streamId) {
    	var participant = participants[streamId];
        delete participants[streamId];
        participant.remove();
        
        if (mirrorParticipant) {
        	var otherLocal = null;
        	if (participant === localParticipant) {
        		otherLocal = mirrorParticipant;
        	}
        	if (participant === mirrorParticipant) {
        		otherLocal = localParticipant;
        	}
        	if (otherLocal) {
        		console.log("Removed local participant (or mirror) so removing the other local as well");
        		delete participants[otherLocal.getStream().getGlobalID()];
        		otherLocal.remove();
        	}
        }
        
        //setting main
        if (mainParticipant && mainParticipant === participant) {
        	var mainIsLocal = false;
        	if (localParticipant) {
        		if (participant !== localParticipant && participant !== mirrorParticipant) {
        			mainParticipant = localParticipant;
        			mainIsLocal = true;
        		} else {
        			localParticipant = null;
                	mirrorParticipant = null;
        		}
        	}
        	if (!mainIsLocal) {
        		var keys = Object.keys(participants);
        		if (keys.length > 0) {
        			mainParticipant = participants[keys[0]];
        		} else {
        			mainParticipant = null;
        		}
        	}
        	if (mainParticipant) {
        		mainParticipant.setMain();
        		console.log("Main video from " + mainParticipant.getStream().getGlobalID());
        	} else
        		console.error("No media streams left to display");
        }

        updateVideoStyle();
    };

    //only called when leaving the room
    this.removeParticipants = function () {
    	connected = false;
        for (var index in participants) {
            var participant = participants[index];
            participant.remove();
        }
    };

    this.getParticipants = function () {
        return participants;
    };

    this.enableMainSpeaker = function () {
    	mainSpeaker = true;
    }

    this.disableMainSpeaker = function () {
    	mainSpeaker = false;
    }

    // Open the chat automatically when a message is received
    function autoOpenChat() {
        var selectedEffect = "slide";
        var options = {direction: "right"};
        if (that.j("#effect").is(':hidden')) {
            that.j("#content").animate({width: '80%'}, 500);
            that.j("#effect").toggle(selectedEffect, options, 500);
        }
    };

    this.updateInfo = function(infoText){
        that.j("#infoContainer").text(infoText);
    }
    
    this.onStateChanged=function(state){
        switch(state){
            case "CALLING":
                that.updateInfo("Вы пытаетесь дозвониться");
                that.j("#buttonCallRequest").hide();
                that.j("#buttonCancelCall").show();
                break;
            case "NORMAL":
                that.updateInfo("");
                that.j("#buttonCallRequest").show();
                that.j("#buttonCancelCall").hide();
                break;
            case "SPEAKING":
                if(that.currentConversationUserName){
                    that.updateInfo("Вы ведете диалог с "+that.currentConversationUserName);
                }
                else{
                    that.updateInfo("Вы ведете диалог");
                }

                that.j("#buttonCancelCall").show();
                that.j("#buttonCallRequest").hide();
                break;
        }
    }

    this.onCallRequest = function(callerName){
        var renderer = new CallerRenderer($, callerName);
        that.callerRenderers.add(callerName, renderer);
    }

    this.onCancelCallRequest = function(callerName){
        var callerRenderer = that.callerRenderers.get(callerName);
        if(callerRenderer){
            callerRenderer.destroy();
        }
        that.callerRenderers.remove(callerName);
    }

    this.showMessage = function (room, user, message) {
        var ul = document.getElementsByClassName("list");

        var chatDiv = document.getElementById('chatDiv');
        var messages = that.j("#messages");
        var updateScroll = true;

        if (messages.outerHeight() - chatDiv.scrollTop > chatDiv.offsetHeight) {
        	updateScroll = false;
        }
        console.log("localParticipant:",localParticipant);
        var localUser = localParticipant.thumbnailId.replace("_webcam", "").replace("video-", "");
        if (room === roomName && user === localUser) { 
            //me
            var li = document.createElement('li');
            li.className = "list-row list-row--has-primary list-row--has-separator";
            var div1 = document.createElement("div1");
            div1.className = "list-secondary-tile";
            var img = document.createElement("img");
            img.className = "list-primary-tile__img";
            img.setAttribute("src", "http://ui.lumapps.com/images/placeholder/2-square.jpg");
            var div2 = document.createElement('div');
            div2.className = "list-content-tile list-content-tile--two-lines";
            var strong = document.createElement('strong');
            strong.innerHTML = user;
            var span = document.createElement('span');
            span.innerHTML = message;
            div2.appendChild(strong);
            div2.appendChild(span);
            div1.appendChild(img);
            li.appendChild(div1);
            li.appendChild(div2);
            ul[0].appendChild(li);
        } else {
            //others
            var li = document.createElement('li');
            li.className = "list-row list-row--has-primary list-row--has-separator";
            var div1 = document.createElement("div1");
            div1.className = "list-primary-tile";
            var img = document.createElement("img");
            img.className = "list-primary-tile__img";
            img.setAttribute("src", "http://ui.lumapps.com/images/placeholder/1-square.jpg");
            var div2 = document.createElement('div');
            div2.className = "list-content-tile list-content-tile--two-lines";
            var strong = document.createElement('strong');
            strong.innerHTML = user;
            var span = document.createElement('span');
            span.innerHTML = message;
            div2.appendChild(strong);
            div2.appendChild(span);
            div1.appendChild(img);
            li.appendChild(div1);
            li.appendChild(div2);
            ul[0].appendChild(li);
            autoOpenChat();
        }
        
        if (updateScroll) {
        	chatDiv.scrollTop = messages.outerHeight();
        }
    };

    this.showError = function ($window, LxNotificationService, e) {
        if (displayingRelogin) {
            console.warn('Already displaying an alert that leads to relogin');
            return false;
          }
        displayingRelogin = true;
        that.removeParticipants();
        LxNotificationService.alert('Error!', e.error.message, 'Reconnect', function(answer) {
        	displayingRelogin = false;
            $window.location.href = '/';
        });
    };
    
    this.forceClose = function ($window, LxNotificationService, msg) {
        if (displayingRelogin) {
            console.warn('Already displaying an alert that leads to relogin');
            return false;
          }
        displayingRelogin = true;
        that.removeParticipants();
        LxNotificationService.alert('Warning!', msg, 'Reload', function(answer) {
        	displayingRelogin = false;
            $window.location.href = '/';
        });
    };
    
    this.alertMediaError = function ($window, LxNotificationService, msg, callback) {
        if (displayingRelogin) {
            console.warn('Already displaying an alert that leads to relogin');
            return false;
          }
    	LxNotificationService.confirm('Warning!', 'Server media error: ' + msg
    			+ ". Please reconnect.", { cancel:'Disagree', ok:'Agree' }, 
    			function(answer) {
    	            console.log("User agrees upon media error: " + answer);
    	            if (answer) {
    	            	that.removeParticipants();
    	                $window.location.href = '/';
    	            }
    	            if (typeof callback === "function") {
    	            	callback(answer);
    	            }
    			});
	};

    this.streamSpeaking = function(participantId) {
    	if (participants[participantId.participantId] != undefined) {
            try {
                document.getElementById("speaker" + participants[participantId.participantId].thumbnailId).style.display = '';
            }
            catch (error) {

            }
        }
    }

    this.streamStoppedSpeaking = function(participantId) {
    	if (participants[participantId.participantId] != undefined)
    		document.getElementById("speaker" + participants[participantId.participantId].thumbnailId).style.display = "none";
    }

    this.updateMainSpeaker = function(participantId) {
    	if (participants[participantId.participantId] != undefined) {
    		if (mainSpeaker)
    			updateMainParticipant(participants[participantId.participantId]);
    	}
    }
}