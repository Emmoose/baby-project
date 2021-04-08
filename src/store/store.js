import Vue from "vue";
import Vuex from "vuex";
import actions from "./actions";
import mutations from "./mutations";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    userProfile: {},
    userLoggedIn: false,
    loginError: false,
    userIsAdmin: false,

    // Stories
    stories: [],
    lastLoadedStory: {},
    storiesComments: {},

    // Images
    lastLoadedImageUrl: {},
    allImageUrls: [],

    // Edit mode settings
    editStory: {
      editMode: false,
      storyId: null
    },

    // Guessed Dates
    guessedDates: [[], [], ""],

    // Baby Metrics
    heightsData: [],
    weightsData: []
  },
  mutations,
  actions
});

export default store;
