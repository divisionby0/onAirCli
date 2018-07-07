var EnterRoom = function($http, $scope, roomName, userName, ServiceRoom, ServiceParticipant, LxNotificationService){

    $scope.userName = userName;
    $scope.roomName = roomName;

    $scope.updateSpeakerInterval = Settings.updateSpeakerInterval;
    $scope.thresholdSpeaker = Settings.thresholdSpeaker;

    register();


    function register(){
        console.log("Enter room register()");
        var registration = new Registration($scope, ServiceParticipant, ServiceRoom, LxNotificationService);
        registration.register();
    }
}