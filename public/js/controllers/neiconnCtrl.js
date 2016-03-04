
angular.module("neiconn")
       .controller("neiconnCtrl",function ($scope){
       	  //http request to the backend and return the data to the front-end
   
          $scope.test = events;
           $scope.data = {
                 popular_city : [
                               { name: "San Fransico",img:"images/sf.jpeg" ,category: "westcoast"},
                               { name: "Los Angeles",img:"images/la.jpg" ,category: "westcoast"},
                               { name: "Seattle",img:"images/sea.jpg" ,category: "westcoast"},
                               { name: "Portland",img:"images/pdx.jpg" ,category: "westcoast"},
                               { name: "New York",img:"images/nyc.jpg" ,category: "eastcoast"},
                               { name: "Boston",img:"images/bos.jpg" ,category: "eastcoast"},
                               { name: "D.C.",img:"images/DC.jpg" ,category: "eastcoast"},
                               { name: "Miami",img:"images/mia.jpg" ,category: "eastcoast"}
                             ]
         
          }

       	  var data_event = events

          $scope.data = data_event;


          var initMap = function () {
           var homeLatLng = new google.maps.LatLng(49.47805, -123.84716);

           var map = new google.maps.Map(document.getElementById('map_canvas'), {
             zoom: 9,
             center: {lat: 37.7833, lng: -122.4167},
             mapTypeId: google.maps.MapTypeId.ROADMAP
           });
                 var infoWindow = new google.maps.InfoWindow({map: map});

                 if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(function(position) {
                        var pos = {
                          lat: position.coords.latitude,
                          lng: position.coords.longitude
                        };

                        infoWindow.setPosition(pos);
                        infoWindow.setContent('Your location');
                        map.setCenter(pos);
                      }, function() {
                        handleLocationError(true, infoWindow, map.getCenter());
                      });
                    } else {
                      // Browser doesn't support Geolocation
                      handleLocationError(false, infoWindow, map.getCenter());
                    }
                  


           var beaches = [
                
 
              ];
              alert(data_event.length);
              for(var i = 0; i < data_event.length; i++){
                var price = data_event[i].content.price;
                 beaches.push([data_event[i].content.title, parseFloat(data_event[i].content.location.lat), parseFloat(data_event[i].content.location.lon),i,price]);
              }
            

              alert(beaches + "   " + beaches.length);
           var image = {
                url: 'images/iconmap.png',
                // This marker is 20 pixels wide by 32 pixels high.
                size: new google.maps.Size(40, 25),
                // The origin for this image is (0, 0).
                origin: new google.maps.Point(0, 0),
                // The anchor for this image is the base of the flagpole at (0, 32).
                anchor: new google.maps.Point(0, 40)
              };

           var shape = {
              coords: [1, 1, 1, 20, 18, 20, 18, 1],
              type: 'poly'
            };
          for (var i = 0; i < beaches.length; i++) {
          var beach = beaches[i];
           var marker1 = new MarkerWithLabel({
             position: {lat: beach[1], lng: beach[2]},
             map: map,
             labelContent:"$ " +  beach[4],
             labelAnchor: new google.maps.Point(-5, 35),
             icon: image,
             shape: shape,
             title: beach[0],
             zIndex: beach[3]
           });

           }
             }

             initMap();

       })
       .controller('appCtrl', function($scope){
           $scope.temps = temps;

           $scope.accept = function (id, photo, name) {
               
           }
       })