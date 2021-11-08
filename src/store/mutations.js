export default {
  SET_USER_PROFILE(state, val) {
    state.userProfile = val;
  },

  SET_USER_LOGGED_IN(state, val) {
    state.userLoggedIn = val;
  },

  SET_USER_IS_ADMIN(state, val) {
    state.userIsAdmin = val;
  },

  SET_LOGIN_ERROR(state, val) {
    state.loginError = val;
  },

  SET_PLAYERS(state, val) {
    state.players = val;
  },

  SET_PLAYERS_IN_ROUND(state, val) {
    state.playersInRound = val;
  }
};
