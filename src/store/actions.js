import * as fb from "../firebase";
import router from "../router/index";

export default {
  async login({ dispatch, commit }, form) {
    // sign user in
    try {
      const { user } = await fb.auth.signInWithEmailAndPassword(
        form.email,
        form.password
      );
      dispatch("fetchUserProfile", user);
      commit("toggleLoginError", false);
    } catch (err) {
      commit("toggleLoginError", true);
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
      createdOn: "",
      hasGuessedDate: false
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
          commit("setUserIsAdmin", true);
        } else {
          commit("setUserIsAdmin", false);
        }
      })
      .catch(function() {
        commit("setUserIsAdmin", false);
      });

    commit("setUserProfile", userProfile.data());
    commit("setUserLoggedIn", true);

    // change route to dashboard
    if (router.currentRoute.path === "/login") {
      router.push("/");
    }
  },
  async logout({ commit }) {
    // log user out
    await fb.auth.signOut();

    // clear user data from state
    commit("setUserProfile", {});
    commit("setUserLoggedIn", false);

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

  async fetchGuessedDates({ commit }) {
    const docs = await fb.guessDateCollection.get();
    var datesArray = [];
    var dataArray = [];
    var yourDate = "";

    docs.forEach(doc => {
      let date = doc.data();

      if (fb.auth.currentUser.uid == doc.id) {
        yourDate = date.guessedDate;
      }
      date.id = doc.id;

      if (datesArray.includes(date.guessedDate) && date.guessedDate != "") {
        var indexElement = datesArray.indexOf(date.guessedDate);
        dataArray[indexElement] += 1;
      } else if (date.guessedDate != "") {
        datesArray.push(date.guessedDate);
        dataArray.push(1);
      }
    });

    datesArray.sort();

    // Rename this at some point
    var guessedDates = [datesArray, dataArray, yourDate];

    commit("setGuessedDates", guessedDates);
  },

  // Actions - Working with stories

  // eslint-disable-next-line
  async createStory({commit}, payload) {
    await fb.storiesContentCollection.add(payload);
  },

  async updateStory({ dispatch }, payload) {
    await fb.storiesContentCollection.doc(payload.storyId).update({
      image: payload.image,
      story: payload.story,
      pickedBaby: payload.pickedBaby,
      referenceImages: payload.referenceImages,
      userName: payload.userName
    });

    dispatch("addEditStory", {
      editMode: false,
      storyId: null
    });
  },

  async fetchStories({ commit }) {
    const first = fb.storiesContentCollection
      .orderBy("createdOn", "desc")
      .where("pickedBaby", "in", ["0", "1", "2"]) // 2 is for both options
      .limit(8);
    var stories = [];

    const snapshot = await first.get();
    commit("setLastLoadedStory", snapshot.docs[snapshot.docs.length - 1]);

    snapshot.forEach(doc => {
      let story = doc.data();
      story.id = doc.id;
      stories.push(story);
    });

    commit("setStories", stories);
  },

  async fetchAdditionalStories({ commit, state }) {
    const next = fb.storiesContentCollection
      .orderBy("createdOn", "desc")
      .startAfter(state.lastLoadedStory.data().createdOn)
      .limit(4);
    var stories = [];

    const snapshot = await next.get();
    commit("setLastLoadedStory", snapshot.docs[snapshot.docs.length - 1]);
    snapshot.forEach(doc => {
      let story = doc.data();
      story.id = doc.id;
      stories.push(story);
    });

    commit("updateStories", stories);
  },

  // eslint-disable-next-line
  async postComment({ commit }, comment) {
    await fb.storiesCommentsCollection.add(comment);
  },

  async subscribeComments({ commit }, storyId) {
    fb.storiesCommentsCollection
      .where("storyId", "==", storyId)
      .onSnapshot(docs => {
        var tempStoryComments = [];
        docs.forEach(doc => {
          let comment = doc.data();
          comment.id = doc.id;
          tempStoryComments.push(comment);
        });

        // Investigate this and fix it, should be sorted in api-call
        // Need to add index on server afaik
        var storyComments = tempStoryComments.sort((a, b) =>
          a.createdOn > b.createdOn ? 1 : -1
        );

        commit("updateStoryComments", { storyComments, storyId });
      });
  },

  // eslint-disable-next-line
  async deleteComment({ commit }, comment) {
    await fb.storiesCommentsCollection.doc(comment.id).delete();
  },

  async subscribeLikes({ commit }, storyId) {
    fb.storiesContentCollection.doc(storyId).onSnapshot(docs => {
      commit("updateLikesOnStory", { likes: docs.data().likes, storyId });
    });
  },

  async postLikesStory({ state }, storyId) {
    const story = await fb.storiesContentCollection.doc(storyId).get();
    const userId = state.userProfile.userId;

    const likesData = {
      userId: state.userProfile.userId,
      name: state.userProfile.name,
      time: new Date()
    };

    var likesCopy = [];
    const prevLiked =
      story.data().likes.filter(like => like.userId == userId).length > 0;

    //If not liked before - Add to likes array
    // if liked before - remove it from likes array
    // Sync with FB
    if (prevLiked) {
      likesCopy = story.data().likes.filter(like => like.userId != userId);
    } else {
      likesCopy = story.data().likes.slice();
      likesCopy.push(likesData);
    }

    await fb.storiesContentCollection.doc(storyId).update({
      likes: likesCopy
    });
  },

  // eslint-disable-next-line
  async addImageLink({ commit }, payload) {
    await fb.allImageUrlsCollection.add({
      createdOn: payload.createdOn,
      url: payload.url
    });
  },

  // eslint-disable-next-line
  async removeImageLink({ commit }, payload) {
    console.log(payload);

    const docs = await fb.allImageUrlsCollection
      .where("url", "==", payload)
      .get();

    docs.forEach(doc => {
      fb.allImageUrlsCollection.doc(doc.id).delete();
    });
  },

  async fetchImageLinks({ commit }) {
    const first = fb.allImageUrlsCollection
      .orderBy("createdOn", "desc")
      .limit(4);

    var imageLinks = [];

    const snapshot = await first.get();
    commit("setLastLoadedImageUrl", snapshot.docs[snapshot.docs.length - 1]);

    snapshot.forEach(doc => {
      let imageLink = doc.data();
      imageLink.id = doc.id;
      imageLinks.push(imageLink);
    });

    commit("setImagesUrls", imageLinks);
  },

  async fetchAdditionalImageLinks({ commit, state }) {
    const next = fb.allImageUrlsCollection
      .orderBy("createdOn", "desc")
      .startAfter(state.lastLoadedImageUrl.data().createdOn)
      .limit(2);

    var imageLinks = [];

    const snapshot = await next.get();
    commit("setLastLoadedImageUrl", snapshot.docs[snapshot.docs.length - 1]);
    snapshot.forEach(doc => {
      let imageLink = doc.data();
      imageLinks.id = doc.id;
      imageLinks.push(imageLink);
    });

    commit("updateImagesUrls", imageLinks);
  },

  async addEditStory({ commit }, data) {
    commit("setEditStory", data);
  },

  // Actions - Working with baby metrics

  // eslint-disable-next-line
  async addHeightDataPoint({ commit }, payload) {
    await fb.weightCollection.add({
      createdOn: payload.createdOn,
      weight: payload.weight
    });
  },

  async fetchHeightDataPoint({ commit }) {
    const docs = await fb.heightCollection.get();
    var heightsData = [];

    docs.forEach(doc => {
      let height = doc.data();
      height.id = doc.id;
      heightsData.push({ y: height.height, x: height.createdOn });
    });

    heightsData = heightsData.sort((a, b) => a.x - b.x);

    commit("setHeightsData", heightsData);
  },

  // eslint-disable-next-line
  async addHeightDataPoints({ commit }, payload) {
    await fb.heightCollection.add({
      createdOn: payload.createdOn,
      height: payload.height
    });
  },

  async fetchWeightDataPoint({ commit }) {
    const docs = await fb.weightCollection.get();
    var weightsData = [];

    docs.forEach(doc => {
      let weight = doc.data();
      weight.id = doc.id;

      weightsData.push({ y: weight.weight, x: weight.createdOn });
    });

    weightsData = weightsData.sort((a, b) => a.x - b.x);
    commit("setWeightsData", weightsData);
  }
};
