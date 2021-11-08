// import { set } from "vue/types/umd";
import Vue from "vue";

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

  SET_SHOW_GLOBAL_LOADER(state, val) {
    state.showGlobalLoader = val;
  },

  SET_LAST_LOADED_STORY(state, val) {
    state.lastLoadedStory = val;
  },

  SET_STORIES(state, val) {
    state.stories = val;
  },

  SET_LOAD_MORE_STORIES(state, val) {
    state.loadMoreStories = val;
  },

  DELETE_STORY(state, val) {
    state.stories = state.stories.filter(story => story.id != val.storyId);
  },

  ADD_STORIES(state, val) {
    var storiesLength = state.stories.length;

    val.forEach(story => {
      Vue.set(state.stories, storiesLength, story);
      storiesLength = storiesLength + 1;
    });
  },

  ADD_STORY_COMMENTS(state, val) {
    Vue.set(state.storiesComments, val.storyId, val.storyComments);
  },

  ADD_LIKES_ON_STORY(state, val) {
    const index = state.stories.findIndex(story => story.id == val.storyId);
    Vue.set(state.stories[index], "likes", val.likes);
  },

  SET_LOAD_MORE_IMAGES(state, val) {
    state.loadMoreImages = val;
  },

  SET_SCROLL_TO_DATE(state, val) {
    state.scrollToDate = val;
  },

  ADD_IMAGES_URLS(state, val) {
    var setTop = state.allImageUrls.length == 0 ? true : false;
    var imageUrlsLength = state.allImageUrls.length;
    const savedImageUrlsLength = state.allImageUrls.length;

    val.imageLinks.forEach(imageUrl => {
      Vue.set(state.allImageUrls, imageUrlsLength, imageUrl);
      imageUrlsLength = imageUrlsLength + 1;
    });

    // If first image loaded
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

  INSERT_IMAGE_URLS(state, val) {
    var copyallImageUrls = JSON.parse(JSON.stringify(state.allImageUrls));

    // Find Index of first item in allImageUrlArray that is older than
    // first item in val (array to insert)
    var startIndex = copyallImageUrls.findIndex(
      imageUrl =>
        val.imageLinks[0].createdOn.seconds > imageUrl.createdOn.seconds
    );

    var howMany = 0;
    for (let index = 0; index < val.imageLinks.length; index++) {
      if (
        val.imageLinks[index].createdOn.seconds >
        copyallImageUrls[startIndex].createdOn.seconds
      ) {
        howMany++;
      }
    }

    for (let index = 0; index < howMany; index++) {
      copyallImageUrls.splice(startIndex + index, 0, val.imageLinks[index]);
    }

    if (val.listLocation == "center" && howMany == val.imageLinks.length) {
      copyallImageUrls[startIndex - 1].location = null;
      copyallImageUrls[startIndex + howMany - 1].location = "last";
    }

    if (val.listLocation == "center" && howMany < val.imageLinks.length) {
      copyallImageUrls[startIndex - 1].location = null;
      copyallImageUrls[startIndex + howMany - 1].location = null;
      copyallImageUrls[startIndex + howMany].location = null;
    }

    if (val.listLocation == "newMonthIn") {
      copyallImageUrls[startIndex].location = "first";
    }

    if (val.listLocation == "newMonthIn" && howMany == val.imageLinks.length) {
      copyallImageUrls[startIndex + howMany - 1].location = "last";
    } else if (
      val.listLocation == "newMonthIn" &&
      howMany < val.imageLinks.length
    ) {
      copyallImageUrls[startIndex + howMany - 1].location = null;
      copyallImageUrls[startIndex + howMany].location = null;
    }

    state.allImageUrls = copyallImageUrls;
  },

  SET_LOADED_LAST_IMAGE(state, val) {
    state.loadedLastImage = val;
  },

  SET_EDIT_STORY(state, val) {
    state.editStory = val;
  },

  SET_LOGIN_ERROR(state, val) {
    state.loginError = val;
  },

  SET_BABY_DATA(state, val) {
    state.babyData = val;
  }
};
