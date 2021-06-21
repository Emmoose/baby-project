// import { set } from "vue/types/umd";
import Vue from "vue";

export default {
  setUserProfile(state, val) {
    state.userProfile = val;
  },

  setUserLoggedIn(state, val) {
    state.userLoggedIn = val;
  },

  setUserIsAdmin(state, val) {
    state.userIsAdmin = val;
  },

  setShowGlobalLoader(state, val) {
    state.showGlobalLoader = val;
  },

  setLastLoadedStory(state, val) {
    state.lastLoadedStory = val;
  },

  setStories(state, val) {
    state.stories = val;
  },

  setLoadMoreStories(state, val) {
    state.loadMoreStories = val;
  },

  deleteStory(state, val) {
    state.stories = state.stories.filter(story => story.id != val.storyId);
  },

  updateStories(state, val) {
    var storiesLength = state.stories.length;

    val.forEach(story => {
      Vue.set(state.stories, storiesLength, story);
      storiesLength = storiesLength + 1;
    });
  },

  updateStoryComments(state, val) {
    Vue.set(state.storiesComments, val.storyId, val.storyComments);
  },

  updateLikesOnStory(state, val) {
    const index = state.stories.findIndex(story => story.id == val.storyId);
    Vue.set(state.stories[index], "likes", val.likes);
  },

  removeLikesOnStory(state, val) {
    const index = state.stories.findIndex(story => story.id == val.storyId);
    var copyLikes = state.stories[index].likes.filter(
      like => like.userId != val.userId
    );
    Vue.set(state.stories[index], "likes", copyLikes);
  },

  setLoadMoreImages(state, val) {
    state.loadMoreImages = val;
  },

  setScrollToDate(state, val) {
    state.scrollToDate = val;
  },

  updateImagesUrls(state, val) {
    var setTop = state.allImageUrls.length == 0 ? true : false;
    var imageUrlsLength = state.allImageUrls.length;
    const savedImageUrlsLength = state.allImageUrls.length;

    val.imageLinks.forEach(imageUrl => {
      Vue.set(state.allImageUrls, imageUrlsLength, imageUrl);
      imageUrlsLength = imageUrlsLength + 1;
    });

    // If first images loaded
    if (setTop) {
      state.allImageUrls[0].location = "first";
    }

    if (val.listLocation == "append" && !setTop) {
      state.allImageUrls[savedImageUrlsLength - 1].location = null;
    }

    if (val.listLocation == "new") {
      state.allImageUrls[savedImageUrlsLength].location = "first";
    }

    state.allImageUrls[state.allImageUrls.length - 1].location = "last";
  },

  insertImagesUrls(state, val) {
    var copyAllImageUrls = JSON.parse(JSON.stringify(state.allImageUrls));

    // Find Index of first item in allImageUrlArray that is older than
    // first item in val (array to insert)
    var startIndex = copyAllImageUrls.findIndex(
      imageUrl =>
        val.imageLinks[0].createdOn.seconds > imageUrl.createdOn.seconds
    );

    var howMany = 0;
    for (let index = 0; index < val.imageLinks.length; index++) {
      if (
        val.imageLinks[index].createdOn.seconds >
        copyAllImageUrls[startIndex].createdOn.seconds
      ) {
        howMany++;
      }
    }

    for (let index = 0; index < howMany; index++) {
      copyAllImageUrls.splice(startIndex + index, 0, val.imageLinks[index]);
    }

    if (val.listLocation == "center" && howMany == val.imageLinks.length) {
      copyAllImageUrls[startIndex - 1].location = null;
      copyAllImageUrls[startIndex + howMany - 1].location = "last";
    }

    if (val.listLocation == "center" && howMany < val.imageLinks.length) {
      copyAllImageUrls[startIndex - 1].location = null;
      copyAllImageUrls[startIndex + howMany - 1].location = null;
      copyAllImageUrls[startIndex + howMany].location = null;
    }

    if (val.listLocation == "newMonthIn") {
      copyAllImageUrls[startIndex].location = "first";
    }

    if (val.listLocation == "newMonthIn" && howMany == val.imageLinks.length) {
      copyAllImageUrls[startIndex + howMany - 1].location = "last";
    } else if (
      val.listLocation == "newMonthIn" &&
      howMany < val.imageLinks.length
    ) {
      copyAllImageUrls[startIndex + howMany - 1].location = null;
      copyAllImageUrls[startIndex + howMany].location = null;
    }

    state.allImageUrls = copyAllImageUrls;
  },

  setLoadedLastImages(state, val) {
    state.loadedLastImage = val;
  },

  setEditStory(state, val) {
    state.editStory = val;
  },

  setHeightsData(state, val) {
    state.heightsData = val;
  },

  setWeightsData(state, val) {
    state.weightsData = val;
  },

  toggleLoginError(state, val) {
    state.loginError = val;
  }
};
