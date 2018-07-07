var PublisherLoginController = function($http, $scope, roomName, userName, ServiceRoom, ServiceParticipant, LxNotificationService){
    $scope.isOwner = true;
    ParticipantsUtil.getInstance().setOwnerName(userName);

    new EnterRoom($http, $scope, roomName, userName, ServiceRoom, ServiceParticipant, LxNotificationService);
}
