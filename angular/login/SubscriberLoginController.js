var SubscriberLoginController = function($http, $scope, roomName, userName, ServiceRoom, ServiceParticipant, LxNotificationService){
    console.log("Im subscriber login controller roomName="+roomName);

    $scope.isOwner = false;

    var _that = this;

    EventBus.addEventListener("ON_ROOM_NOT_EXISTS", function (roomName) {
        return _that.onRoomNotExists(roomName);
    });

    this.onRoomNotExists = function(roomName){
        new ErrorView("Эфира с названием "+roomName+" не существует !");
        new RedirectToLogin($scope.window);
    };

    new EnterRoom($http, $scope, roomName, userName, ServiceRoom, ServiceParticipant, LxNotificationService);
};
