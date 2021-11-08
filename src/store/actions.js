import * as fb from "../firebase";
import router from "../router/index";
import "firebase/auth";

export default {
  async login({ dispatch, commit }, form) {
    // sign user in
    try {
      const { user } = await fb.auth.signInWithEmailAndPassword(
        form.email,
        form.password
      );
      dispatch("fetchUserProfile", user);
      commit("SET_LOGIN_ERROR", false);
    } catch (err) {
      commit("SET_LOGIN_ERROR", true);
    }

    // fetch user profile and set in state
  },
  async signup({ dispatch }, form) {
    // sign user up
    const { user } = await fb.auth.createUserWithEmailAndPassword(
      form.email,
      form.password
    );

    // create user object in userCollections
    await fb.usersCollection.doc(user.uid).set({
      name: form.name,
      email: form.email,
      relation: "",
      picked: "2", // default to both babies
      userId: user.uid
    });

    // create record that user has not guessed that yet
    await fb.guessDateCollection.doc(user.uid).set({
      guessedDate: "",
      createdOn: ""
    });

    // fetch user profile and set in state
    dispatch("fetchUserProfile", user);
  },
  async fetchUserProfile({ commit }, user) {
    // fetch user profile
    const userProfile = await fb.usersCollection.doc(user.uid).get();

    // Check if user is admin
    fb.auth.currentUser
      .getIdTokenResult(/* forceRefresh */ true)
      .then(function(tokenResult) {
        if (tokenResult.claims.admin === true) {
          commit("SET_USER_IS_ADMIN", true);
        } else {
          commit("SET_USER_IS_ADMIN", false);
        }
      })
      .catch(function() {
        commit("SET_USER_IS_ADMIN", false);
      });

    commit("SET_USER_PROFILE", userProfile.data());
    commit("SET_USER_LOGGED_IN", true);

    // change route to dashboard
    if (router.currentRoute.path === "/login") {
      router.push("/admin");
    }
  },
  async logout({ commit }) {
    // log user out
    await fb.auth.signOut();

    // clear user data from state
    commit("SET_USER_PROFILE", {});
    commit("SET_USER_LOGGED_IN", false);

    // redirect to login view
    router.push("/login");
  },

  async updateProfile({ dispatch }, user) {
    const userId = fb.auth.currentUser.uid;
    // eslint-disable-next-line
    const userRef = await fb.usersCollection.doc(userId).update({
      name: user.name,
      relation: user.relation,
      picked: user.picked
    });

    dispatch("fetchUserProfile", { uid: userId });
  },

  async updatePlayers({ commit }, players) {
    commit("SET_PLAYERS", players);
  },

  async updatePlayersInRound({ commit }, players) {
    commit("SET_PLAYERS_IN_ROUND", players);
  }
};
