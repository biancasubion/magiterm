"use strict";
const axios = require('axios');

module.exports = {
  /**
   * Weather user is authencated
   * @return {Boolean}
   */
  isAuthenticated() {
    const token = _getToken();
    return !!token;
  },

  /**
   * Authenticate user on the server
   * @param  {object} data object with username and password props
   * @param  {Function} callback
   */
  authenticate(data, callback) {
    _setToken("");
    axios.post('/authenticate', data)
      .then(function (response) {
        callback(response.data);
      })
      .catch(function (error) {
        callback(false);
      });
  }
}

/**
 * Saves token in the sessionStorage and sets x-access-token header
 * @param {[type]} token
 */
function _setToken(token) {
  window.sessionStorage.setItem("token", token);
  $.ajaxSetup({
    headers: {
      'x-access-token': token
    }
  });
}

/**
 * Gets token from the sessionStorage
 * @return {string}
 */
function _getToken() {
  return window.localStorage.getItem("token");
}

(function _loadToken(){
  var token = _getToken();
  if (!token){
    return;
  }
  _setToken(token);
})();