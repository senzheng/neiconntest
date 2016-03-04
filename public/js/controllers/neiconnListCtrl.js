angular.module('neiconn')
       .constant("ListActiveClass", "btn-primary")
       .constant("ListPageCount", 6)
       .controller('neiconnListCtrl', function ($scope){
       	    var selectedCategory = "westcoast"; // the result should be returned from backend; but at this point we need to match the role who is in westcoast
            
            $scope.categoryFilter = function(city){
            	//return if the category match the category given
            	return selectedCategory == null || city.category == selectedCategory;
            }
           
       })
       .controller('eventListCtrl', function ($scope, $window, $filter,
        ListActiveClass, ListPageCount) {

        var selectedCategory = null;
        
        $scope.selectedPage = 1;
        $scope.pageSize = ListPageCount;

        
        
        $scope.selectCategory = function (newCategory) {
        	//window.location.href="search-result.html";
        	$scope.currentCategory = "hahha";
            selectedCategory = newCategory;
            $scope.selectedPage = 1;

        }

        $scope.selectPage = function (newPage) {
            $scope.selectedPage = newPage;
        }

        $scope.categoryFilterFn = function (product) {
            return selectedCategory == null ||
                product.location == selectedCategory;
        }

        $scope.getCategoryClass = function (category) {
            return selectedCategory == category ? ListActiveClass : "";
        }

        $scope.getPageClass = function (page) {
            return $scope.selectedPage == page ? ListActiveClass : "";
        }
       
        


        
    });