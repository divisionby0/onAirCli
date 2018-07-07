var kurento_room = angular.module('kurento_room', ['ngRoute', 'FBAngular', 'lumx']);

var appVersion = "0.0.2";

kurento_room.config(function ($routeProvider) {

    console.log("app version: "+appVersion);
    console.log("route provider: ",$routeProvider);

    console.log("Host:",Settings.getHost());
    console.log("AppServer uri:",Settings.getServerUri());

    $routeProvider
            .when('/', {
                templateUrl: 'angular/login/login.html',
                controller: 'loginController'
            })
            .when('/login', {
                templateUrl: 'angular/login/login.html',
                controller: 'loginController'
            })
            .when('/publisherLogin', {
                templateUrl: 'angular/login/publisherLogin.html',
                controller: 'loginController'
            })
            .when('/subscriberLogin', {
                templateUrl: 'angular/login/subscriberLogin.html',
                controller: 'loginController'
            })
            .when('/subscriberCall', {
                templateUrl: 'angular/call/subscriberCall.html',
                controller: 'callController'
            })
            .when('/publisherCall', {
                templateUrl: 'angular/call/publisherCall.html',
                controller: 'callController'
            });
});



