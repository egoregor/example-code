(function() {
'use strict';
angular.module('webApp').factory('UserService', userService);

/** @ngInject */
function userService(Api, localStorageService, $location) {
    var service = {
    	getUser: getUser,
    	setUser: setUser,
        login: login,
        isLogged: isLogged,
        logout: logout
    };
    return service;
    function setUserGuest(){
	    if (!getUser()) {
	    	setUser({role: 'guest'});
	    };
    }
    setUserGuest();

    function setUser(data) {
    	localStorageService.set('user', data);
    }
    function getUser() {
    	return localStorageService.get('user');
    };
	function login(userData) {
		return Api.save({section: 'auth', cmd: 'login', email: userData.email, password: userData.password}).then(
			function(res) {
					localStorageService.set('jwtToken', res.result.data.token);
					localStorageService.set('tokenDate', new Date());
					setUser(res.result.data.user);

			},
			function(err){
			  	console.log(err);
			}
		)
	}
	function isLogged() {
		var userIsSet = false;
		if (localStorageService.get('jwtToken')) userIsSet = true;
		return userIsSet;
	}
	function logout() {
		localStorageService.remove('jwtToken');
		localStorageService.remove('user');
		setUserGuest();
		$location.path('/login');
	}
}
})();