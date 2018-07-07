var DetectRoomExists = function(roomName){
    $.ajax({
        url: "/detectRoomExists",
        data: {roomName: roomName},
        success: function(response) {
            EventBus.dispatchEvent("ON_ROOM_EXISTS_RESPONSE", response);
        },
        error: function(xhr) {
            console.error("error execute detectRoomExists data",data,"status",status,"headers",headers,"config",config);
        }
    });
}
