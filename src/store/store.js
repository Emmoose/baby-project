import Vue from "vue";
import Vuex from "vuex";
import actions from "./actions";
import mutations from "./mutations";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    // LOGIN INFORMATION
    userProfile: {},
    userLoggedIn: false,
    loginError: false,
    userIsAdmin: false,

    // GAME DATA
    players: [
      {
        name: "player1",
        score: 0,
        roundScore: 0,
        inRound: true
      },
      {
        name: "player2",
        score: 0,
        roundScore: 0,
        inRound: true
      },
      {
        name: "player3",
        score: 0,
        roundScore: 0,
        inRound: true
      },
      {
        name: "player4",
        score: 0,
        roundScore: 0,
        inRound: true
      }
    ],
    playersInRound: [0, 1, 2, 3]
  },
  mutations,
  actions
});

export default store;
