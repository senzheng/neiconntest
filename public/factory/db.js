angular.module('tempage')
       .factory('db', function ($http){
            var item = {}; //The item will hold the value of the http.res
            var result = {};
            //Backend will recieve the all comments
            item.getComments = function () {
                $http.get('/getComments')
                      .then(function (data){
		                	result = data;
		                })
                      .catch(function(data, status){
                      	console.error('error', response.status, response.data)
                      })
                      .finally (function (){
                        console.log("finish the get from comments")
                      });

              }

              return item;
       })