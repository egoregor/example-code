'use strict';

angular.module('app').controller('CurrenciesCtrl', function ($scope, currencies, ApiConsoleService, counts, sortBy, checkAll, sectionsService) {

  $scope.rangePageSize = [20,50,100,200];
  $scope.pageSize = $scope.rangePageSize[2];
  $scope.totalItems = counts['count'];
  $scope.currencies = currencies;
	$scope.checklist = [];
  $scope.pageNumber = 0;

  $scope.order = "displayName";
  $scope.sort = "asc";
  $scope.sortBy = {
      displayName: "Currency",
      updatedAt: "Prices Update"
  };
  $scope.sortByList = sortBy.get($scope.sortBy);

	$scope.changeOrder = function (order) {
		if ($scope.order == order) {
		  $scope.sort = $scope.sort == "desc" ? "asc" : "desc";
		} else {
		  $scope.sort = "asc";
		}
		$scope.order = order;
		$scope.getCurrencies();
	};

  $scope.getCurrencies = function(pageNumber) {
    $scope.pageNumber = (pageNumber >= 0) ? pageNumber : $scope.pageNumber;

    var queryObj = {
      type: 'currencies',
      pageNumber: $scope.pageNumber,
      pageSize: $scope.pageSize,
      orderBy: $scope.order,
      sort: $scope.sort
    };

    var queryCountObj = {
      type: 'currencies',
      cmd: 'counts'
    };

    sectionsService.get(queryObj, queryCountObj).then(function(result){
      $scope.currencies = result.sections;
      $scope.checklist.splice(0, $scope.checklist.length);
      $scope.checkAll = false;
      $scope.totalItems = result.counts['count'];
    });
  };

  $scope.pageChanged = function(newPage) {
    $scope.getCurrencies(newPage);
  };

  $scope.$watch('checkAll', function (check) {
    $scope.checklist = checkAll.get(check, $scope.currencies, $scope.checklist);
  });

  $scope.remove = function () {
    $scope.checklist.forEach(function(id) {
      ApiConsoleService.Tech.remove({ type: 'currencies', id: id}, function(data) {
        if ($scope.checklist.lastIndexOf(id) == $scope.checklist.length-1) {
          $scope.checkAll = false;
          $scope.checklist = [];
          $scope.getCurrencies();
          $scope.isDelete = false;
        }
      });
    });
  };

  $scope.changeCurrency = function(id) {
    ApiConsoleService.Tech.get(
      { type: 'currencies', id: id},
      function(data) {
        console.log(data);
        $scope.currency = data;
        $scope.currencyName = data.displayName;
        // console.log($scope.currency);
        $scope.isChangeCurrency = true;
      });
  };

  $scope.saveCurrency = function() {
    ApiConsoleService.Tech.update({ type: 'currencies', id: $scope.currency.id},
      $scope.currency,
      function(data) {
        $scope.getCurrencies();
        $scope.isChangeCurrency = false;
        $scope.currency = {};
      }, function(error) {
        console.log(error);
      }
    );
  };

  });
