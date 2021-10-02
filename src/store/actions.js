import * as fb from "../firebase";
import router from "../router/index";
import "firebase/auth";
import imageRangesImported from "../utility/image-ranges";
import config from "../utility/config";

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
      router.push("/");
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

  // Actions - Working with stories

  // eslint-disable-next-line
  async createStory({commit}, payload) {
    await fb.storiesContentCollection.add(payload);
  },

  async updateStory({ commit }, payload) {
    await fb.storiesContentCollection.doc(payload.storyId).update({
      image: payload.image,
      story: payload.story,
      pickedBaby: payload.pickedBaby,
      referenceImages: payload.referenceImages,
      userName: payload.userName
    });

    commit("SET_EDIT_STORY", {
      editMode: false,
      storyId: null
    });
  },

  async fetchStories({ commit }) {
    const first = fb.storiesContentCollection
      .orderBy("createdOn", "desc")
      .where("pickedBaby", "in", ["0", "1", "2"]) // 2 is for both options
      .limit(config.initialLoadStories);
    var stories = [];

    const snapshot = await first.get();
    commit("SET_LAST_LOADED_STORY", snapshot.docs[snapshot.docs.length - 1]);

    snapshot.forEach(doc => {
      let story = doc.data();
      story.id = doc.id;
      stories.push(story);
    });

    commit("SET_STORIES", stories);
  },

  async fetchAdditionalStories({ commit, state }) {
    const next = fb.storiesContentCollection
      .orderBy("createdOn", "desc")
      .where("pickedBaby", "in", ["0", "1", "2"])
      .startAfter(state.lastLoadedStory.data().createdOn)
      .limit(4);
    var stories = [];

    const snapshot = await next.get();
    commit("SET_LAST_LOADED_STORY", snapshot.docs[snapshot.docs.length - 1]);
    snapshot.forEach(doc => {
      let story = doc.data();
      story.id = doc.id;
      stories.push(story);
    });

    commit("ADD_STORIES", stories);
    commit("SET_LOAD_MORE_STORIES", true);
  },

  // eslint-disable-next-line
  async deleteStory({ commit, dispatch }, storyId) {
    const docs = await fb.storiesContentCollection.doc(storyId).get();

    docs.data().image.forEach(url => dispatch("removeImageLink", url));
    docs.data().referenceImages.forEach(reference => {
      fb.storage.ref(reference).delete();
    });

    // Also delete comments
    await fb.storiesContentCollection.doc(storyId).delete();
    const docs2 = await fb.storiesCommentsCollection
      .where("storyId", "==", storyId)
      .get();

    docs2.forEach(doc => {
      fb.storiesCommentsCollection.doc(doc.id).delete();
    });
    commit("DELETE_STORY", { storyId });
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

        commit("ADD_STORY_COMMENTS", { storyComments, storyId });
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
          commit("ADD_LIKES_ON_STORY", { likes: docs.data().likes, storyId });
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
  async fetchImageLinksWithTimeStamp({ commit }, month = null) {
    commit("SET_LOAD_MORE_IMAGES", false);
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
      commit("ADD_IMAGES_URLS", { imageLinks, listLocation: "append" });

      // CASE 2 - month not empty and at end - Add images at end and scroll to there
    } else if (month != null && monthEnd) {
      commit("ADD_IMAGES_URLS", { imageLinks, listLocation: "new" });
      commit("SET_SCROLL_TO_DATE", month);

      // CASE 3 - month not empty and at not end  - Insert images and scroll to there
    } else if (month != null && !monthEnd) {
      commit("INSERT_IMAGE_URLS", {
        imageLinks,
        listLocation: "newMonthIn"
      });
      // { imageLinks, listLocation: "newMonth" }
      commit("SET_SCROLL_TO_DATE", month);
    }

    commit("SET_LOAD_MORE_IMAGES", true);

    if (imageLinks.length < numberOfImages) {
      commit("SET_LOADED_LAST_IMAGE", true);
    }
  },

  // Times (timeStampTopView, timeStampBottomView) are in milliseconds Unix epoch
  async fetchImageLinksWithTimeStampMiddle(
    { commit },
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

      commit("INSERT_IMAGE_URLS", { imageLinks, listLocation: "center" });
      commit("SET_LOAD_MORE_IMAGES", true);
    }
  },

  async addEditStory({ commit }, data) {
    commit("SET_EDIT_STORY", data);
  },

  // Actions - Working with baby metrics

  // eslint-disable-next-line
  async addHeightDataPoint({ commit }, payload) {
    await fb.weightCollection.add({
      createdOn: payload.createdOn,
      weight: payload.weight
    });
  },

  // eslint-disable-next-line
  async addHeightDataPoints({ commit }, payload) {
    await fb.heightCollection.add({
      createdOn: payload.createdOn,
      height: payload.height
    });
  },

  async fetchChartDataPoints({ commit }) {
    const docs1 = await fb.heightCollection.get(),
      docs2 = await fb.weightCollection.get();

    var heightsData = [],
      weightsData = [],
      mergedArray = [],
      tempNewDataPoint,
      tempHeight;

    docs1.forEach(doc => {
      let height = doc.data();
      height.id = doc.id;
      heightsData.push({ y: height.height, x: height.createdOn });
    });

    docs2.forEach(doc => {
      let weight = doc.data();
      weight.id = doc.id;

      weightsData.push({ y: weight.weight, x: weight.createdOn });
    });

    // Bad solution, assuming weight has all times in length
    weightsData.forEach(dataWeight => {
      (tempNewDataPoint = { timeStamp: dataWeight.x, weight: dataWeight.y }),
        (tempHeight = heightsData.filter(
          dataHeight => dataHeight.x == dataWeight.x
        ));
      if (tempHeight[0]) {
        tempNewDataPoint.height = tempHeight[0].y;
      }

      mergedArray.push(tempNewDataPoint);
    });

    mergedArray = mergedArray.sort(
      (timeA, timeB) => timeA.timeStamp - timeB.timeStamp
    );

    commit("SET_BABY_DATA", mergedArray);
  }
};
