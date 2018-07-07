kurento_room.controller('loginController', function ($scope, $http, ServiceParticipant, $window, ServiceRoom, LxNotificationService, $routeParams) {

    var version = "0.0.2";
	var options;
    console.log("login controller ver "+version);
    console.log("routeParams:",$routeParams);

    var type = $routeParams.type;
    var roomName = $routeParams.roomName;
    var userName = $routeParams.userName;
    $scope.window = $window;
	$scope.state = "LOGIN";

    $scope.clientConfig = {loopbackRemote:false, loopbackAndLocal:false};

    switch(type){
        case Settings.isPublisher:
            console.log("is publisher");
            new PublisherLoginController($http, $scope, roomName, userName, ServiceRoom, ServiceParticipant, LxNotificationService);
            break;
        case Settings.isSubscriber:
            console.log("is subscriber");
            new SubscriberLoginController($http, $scope, roomName, userName, ServiceRoom, ServiceParticipant, LxNotificationService);
            break;
    }
   
    $scope.clear = function () {
        $scope.room = "";
        $scope.userName = "";
        $scope.roomName = "";
    };
});


