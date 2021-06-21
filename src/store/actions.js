import * as fb from "../firebase";
import firebase from "firebase";
import router from "../router/index";
import imageRangesImported from "../utility/image-ranges";

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

  async setShowGlobalLoader({ commit }, { value }) {
    commit("setShowGlobalLoader", value);
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

  async fetchAdditionalStories({ commit, dispatch, state }) {
    const next = fb.storiesContentCollection
      .orderBy("createdOn", "desc")
      .where("pickedBaby", "in", ["0", "1", "2"])
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
    dispatch("setLoadMoreStories", true);
  },

  async setLoadMoreStories({ commit }, value) {
    commit("setLoadMoreStories", value);
  },

  // eslint-disable-next-line
  async deleteStory({ commit, dispatch }, storyId) {
    const docs = await fb.storiesContentCollection.doc(storyId).get();

    docs.data().image.forEach(url => dispatch("removeImageLink", url));
    docs.data().referenceImages.forEach(reference => {
      firebase
        .storage()
        .ref(reference)
        .delete();
    });

    // Also delete comments

    await fb.storiesContentCollection.doc(storyId).delete();
    commit("deleteStory", { storyId });
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
    const unsubscribe = fb.storiesContentCollection
      .doc(storyId)
      .onSnapshot(docs => {
        if (docs.exists) {
          commit("updateLikesOnStory", { likes: docs.data().likes, storyId });
        } else {
          unsubscribe();
        }
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
      url: payload.url,
      imageOrientation: payload.imageOrientation
    });
  },

  // eslint-disable-next-line
  async removeImageLink({ commit }, payload) {
    const docs = await fb.allImageUrlsCollection
      .where("url", "==", payload)
      .get();

    docs.forEach(doc => {
      fb.allImageUrlsCollection.doc(doc.id).delete();
    });
  },

  // Times (startTime, endTime) are in milliseconds Unix epoch
  // eslint-disable-next-line
  async fetchImageLinksTimeStamp({ commit, dispatch }, month = null) {
    dispatch("setLoadMoreImages", false);
    const numberOfImages = 4;
    var newDate,
      startTime,
      imageLinks = [],
      monthEnd;

    // Case 1 - No month and List is empty - Load from today
    if (month == null && imageRangesImported.isListEmpty()) {
      newDate = new Date();

      // Case 2 - No month and List is not empty - Load endTime in last range
    } else if (month == null && !imageRangesImported.isListEmpty()) {
      newDate = new Date(imageRangesImported.getEndValue());

      // Case 3 - Month selected - Load from beginning of month
    } else if (month) {
      newDate = new Date(month);
      newDate.setMonth(newDate.getMonth() + 1); // Since going backwards
      newDate.setHours(0, 0, 0, 0);
    }

    startTime = newDate.getTime();
    monthEnd = imageRangesImported.IsValueAtEnd(startTime); // Check if month is at the end or middle

    const first = fb.allImageUrlsCollection
      .orderBy("createdOn", "desc")
      .where("createdOn", "<", newDate)
      .limit(numberOfImages);

    const snapshot = await first.get();

    snapshot.forEach(doc => {
      let imageLink = doc.data();
      imageLink.id = doc.id;
      imageLinks.push(imageLink);
    });

    // If last image then set endTime to 0 (Unix epoch)
    var endTime =
      imageLinks.length > 0
        ? imageLinks[imageLinks.length - 1].createdOn.seconds * 1000
        : 0;

    imageRangesImported.addTimeRange(startTime, endTime);

    // CASE 1 - month empty - Add images at end
    if (month == null) {
      commit("updateImagesUrls", { imageLinks, listLocation: "append" });

      // CASE 2 - month not empty and at end - Add images at end and scroll to there
    } else if (month != null && monthEnd) {
      commit("updateImagesUrls", { imageLinks, listLocation: "new" });
      commit("setScrollToDate", month);

      // CASE 3 - month not empty and at not end  - Insert images and scroll to there
    } else if (month != null && !monthEnd) {
      commit("insertImagesUrls", {
        imageLinks,
        listLocation: "newMonthIn"
      });
      // { imageLinks, listLocation: "newMonth" }
      commit("setScrollToDate", month);
    }

    dispatch("setLoadMoreImages", true);

    if (imageLinks.length < numberOfImages) {
      commit("setLoadedLastImages", true);
    }
  },

  // Times (timeStampTopView, timeStampBottomView) are in milliseconds Unix epoch
  async fetchImageLinksTimeStampMiddle(
    { commit, dispatch },
    { timeStampTopView, timeStampBottomView }
  ) {
    const numberOfImages = 4,
      imageLinks = [],
      areTwoRegionsInView = imageRangesImported.areTwoRegionsInView(
        timeStampTopView,
        timeStampBottomView
      );

    if (areTwoRegionsInView.inView) {
      var newDate = new Date(areTwoRegionsInView.endTimeTopRange);
      const first = fb.allImageUrlsCollection
        .orderBy("createdOn", "desc")
        .where("createdOn", "<", newDate)
        .limit(numberOfImages);

      const snapshot = await first.get();

      snapshot.forEach(doc => {
        let imageLink = doc.data();
        imageLink.id = doc.id;
        imageLinks.push(imageLink);
      });

      imageRangesImported.addTimeRange(
        areTwoRegionsInView.endTimeTopRange,
        imageLinks[imageLinks.length - 1].createdOn.seconds * 1000
      );

      commit("insertImagesUrls", { imageLinks, listLocation: "center" });
      dispatch("setLoadMoreImages", true);
    }
  },

  async setLoadMoreImages({ commit }, value) {
    commit("setLoadMoreImages", value);
  },

  async addEditStory({ commit }, data) {
    commit("setEditStory", data);
  },

  async updateScrollToDate({ commit }, data) {
    commit("setScrollToDate", data);
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
