//This is template that can 

angular.module('tempOne',['ui.bootstrap'])
       .factory('friendData',['$http' ,function ($http){
            var baseUrl = "/getGroup";
            var friendData = {};

            friendData.getFriendsList = function (){
               return $http.get(baseUrl);
            };

            
            
           
            return friendData;
       }])
       .controller('tempOneCtrl',function ($scope, $http, $interval){
             //when you click the send then the message will save in the database. 
             //for the real application the database will be unined by database user.

               
              //$scope.test = user;
               loadMessage();
               $interval(function(){
               	 loadMessage();
               	 //changeStatus();
               },3000)
                function loadMessage(){
                  
                	$http.get("/getMessage").success(function (data){ 
                	      for(var i = 0; i < data.length; i++){
                               if(data[i].new){

                                if (!("Notification" in window)) {
							    alert("This browser does not support desktop notification");
							  }
							  else if (Notification.permission === "granted") {
							        var options = {
							                 body: data[i].content
							             };
							          var notification = new Notification("Hi there",options);
							  }
							  else if (Notification.permission !== 'denied') {
							    Notification.requestPermission(function (permission) {
							      if (!('permission' in Notification)) {
							        Notification.permission = permission;
							      }
							    
							      if (permission === "granted") {
							        var options = {
							              body: data[i].content
							          };
							        var notification = new Notification("Hi there",options);
							      }
							    });
							  }

							}
                	      }
                         
                          $scope.messagelist = data;
                          
                         

                	});
                      $http.put("/marknew").success(function (data){
                        
                   });

                }

                function MarkRead() {
                	$http.put("/markread").success(function (data){
                          
                	});
                }

       })
     .controller('navbarCtrl', function ($scope, $http, $interval){
                 $scope.city = "loading";
                 $scope.weather = "loading";

          if (navigator.geolocation) {
                                       navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
                                    $interval(function(){
                                       navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
                                    },1800000);
                                  }
                                    else{
                                      showError("Your browser does not support Geolocation!");
                                    }

           function locationSuccess(position) {
                     var lat = position.coords.latitude;
                     var lon = position.coords.longitude;
                     
                     //search the user's current location's weather info (by using the openweathermap API)
                     var cityinfo = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat+ "&lon=" + lon +"&cnt=0&mode=json&appid=2de143494c0b295cca9337e1e96b00e0&units=metric";
                     $http.get(cityinfo).success(function (data){
                          $scope.city = data.name;
                          $scope.weather = data.weather[0].main;
                          //$scope.icon = 
                          var popdisplay = "<table class=" + "\"" + "table table-striped" + "\""+">" +
                                             "<tr>" +
                                                data.weather[0].description + " currently. It's " + data.main.temp + "C ; the high today was forecast as " + data.main.temp_max + "C"+//+ data.list[0].weather[0].
                                              "</tr>" + 
                                              "<tr>" + 
                                                 "<td>" + 
                                                     "sunrise" +
                                                 "</td>" + 
                                                 "<td>" + 
                                                      convertTimestamp(data.sys.sunrise) + 
                                                 "</td>" + 
                                              
                                                 "<td>" + 
                                                     "sunset" +
                                                 "</td>" + 
                                                 "<td>" + 
                                                      convertTimestamp(data.sys.sunset) + 
                                                 "</td>" + 
                                              "</tr>" + 
                                              "<tr>" + 
                                                 "<td>" +
                                                      "Wind" +
                                                 "</td>" + 
                                                 "<td>" +
                                                      getDirection(data.wind.deg) + " " + data.wind.speed +
                                                 "</td>" + 
                                                 "<td>" +
                                                       "humidity" +
                                                 "</td>" + 
                                                 "<td>" +
                                                       data.main.humidity + " %" +
                                                 "</td>" + 
                                              "</tr>" + 
                                           "</table>";
                          $(".pop").popover({
                                  title: 'Today \'s weahter',
                                   html: true,
                                   placement: 'bottom',
                                   container: 'body',
                                   content: function () {
                                    
                                        return popdisplay;
                                    
                                  }
                               });
                            });
                      }

           function convertTimestamp (timestamp){
                    var date = new Date(timestamp*1000);
                      // Hours part from the timestamp
                      var hours = date.getHours();
                      // Minutes part from the timestamp
                      var minutes = "0" + date.getMinutes();
                      // Seconds part from the timestamp
                      var seconds = "0" + date.getSeconds();

                      // Will display time in 10:30:23 format
                      var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

                      return formattedTime;
           }
            // Get Wind Direction
           function getDirection (degree){
                     var direction = "N";
                     if(degree >= 315 || degree < 45 ){
                         direction  = "N";
                     }else if(degree >= 45 && degree < 135){
                         direction = "E";
                     }else if(degree >= 135 && degree < 225){
                        direction = "S";
                     }else if(degree >= 225 && degree < 315){
                         direction = "W";
                     }

                     return direction;
           }
           function locationError(error){
                      switch(error.code) {
                      case error.TIMEOUT:
                      showError("A timeout occured! Please try again!");
                         break;
                      case error.POSITION_UNAVAILABLE:
                         showError('We can\'t detect your location. Sorry!');
                          break;
                      case error.PERMISSION_DENIED:
                           showError('Please allow geolocation access for this to work.');
                          break;
                       case error.UNKNOWN_ERROR:
                           showError('An unknown error occured!');
                          break;
                       }
           }

            function showError(msg){
                     weatherDiv.addClass('error').html(msg);
                  }

     })
     .controller("chatCtrl", function ($scope, $http, $uibModal, friendData, $interval){
                    
                   var message = [];
               var group =  friendData.getFriendsList().success(function (data){
                     $scope.friends = data;
                   socket.on('test_connection' , function (data){
                        message = [{
                          "name" : "neiconn",
                          "message" : data
                     }];
                  });

                   for(var i = 0; i < data.length; i++){
                    socket.on(data[i]._id, function (data){
                         message.push({
                          "name" : "neiconn",
                          "message" : data
                         });
                      });
                   }


                   $interval(function(){
                 loadMessage();
                 //changeStatus();
               },1000)

             function loadMessage() {
                   $scope.socket = message;
             }

            });
                  
           
         var socket = io();
         
             
         
           //changeStatus();
         $scope.Reciver = "Chat Here"
         $scope.deletes = false;
         $scope.send = function (message,reciever) {
             socket.emit('server', {"reciever" : reciever , "message" : message});

             
         }

          
         $scope.delete = function (){
            $scope.deletes = true;
         }

         $scope.recover = function(){
          $scope.deletes = false;
         }
          
         $scope.DeleteItem = function(friend){
           friendData.DeleteFriend(friend).success(function (data){
             
         });

           friendData.getFriendsList().success(function (data){
                     $scope.friends = data[0].friends;
                  });
         };

         $scope.chat = function (friend){
            $scope.Reciver = friend.event.event_title;
            $scope.groupNumber = "(" + friend.event.event_amount + ")";
            $scope.group_id = friend._id;
            room = friend._id;

         }
           
          $scope.open = function () {

                var modalInstance = $uibModal.open({
                  //animation: $scope.animationsEnabled,
                  templateUrl: 'addfriend.html',
                  controller: 'addFriendCtrl',
                  //size: 'sm',
             });


                modalInstance.result.then(function () {
                    friendData.getFriendsList().success(function (data){
                     $scope.friends = data[0].friends;
                  });
                  }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                  });
          };


     })
     .controller('addFriendCtrl', function ($scope, $http, friendData, $interval, $uibModalInstance){
          $scope.show = true;
          


          $scope.add = function (friend){

              $http.get('/check' + friend).success(function (data){
                 if(data.length == 0){
                   $scope.message = "The username is not existed";
                  $scope.show = false;
                 }else{
                   $http.put('/addfriends/' + friend).success(function (data){});
                   $scope.message = friend + "has in your chatting list press <cancel> and start to chat";
                   $scope.show = false;
                   $uibModalInstance.close();
                 }
                 
                   
              });

              
          };
           
          $scope.cancel = function () {
               $uibModalInstance.dismiss('cancel');
            };
            
         
     });


