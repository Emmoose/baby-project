<template>
  <div class="stories-view page-wrapper">
    <ul class="stories">
      <li class="story card" v-for="story in stories" :key="story.id">
        <div class="story__post-information">
          <div>
            <p class="story__username">{{ story.userName }}</p>
            <p class="story__post-date">{{ story.createdOn | formatDate }}</p>
          </div>
          <div v-if="true" class="story__edit-story">
            <a href="#" @click="editStory(story.id)">Redigera</a>
            <span class="story__divider">|</span>
            <a href="#" @click="deleteStory(story.id)">Ta bort</a>
          </div>
        </div>
        <Story :story="story" />
      </li>
    </ul>
  </div>
</template>

<script>
import Story from "@/components/Story";

import { mapState } from "vuex";

export default {
  title: "babyGram - Poster",
  components: {
    Story
  },
  computed: {
    ...mapState([
      "stories",
      "lastLoadedStory",
      "loadMoreStories",
      "userIsAdmin"
    ])
  },

  methods: {
    editStory(storyId) {
      this.$store.commit("SET_EDIT_STORY", {
        storyId: storyId,
        editMode: true
      });

      // Hack fix
      this.$router.push("/manage-content").catch(() => {
        this.$router.push("/manage-content");
      });
    },

    deleteStory(storyId) {
      this.$store.dispatch("deleteStory", storyId);
    },

    scrollToBottom() {
      window.onscroll = () => {
        let bottomOfWindow =
          Math.max(
            window.pageYOffset,
            document.documentElement.scrollTop,
            document.body.scrollTop
          ) +
            window.innerHeight +
            600 >
          document.documentElement.offsetHeight;
        // Hacky fix here, remove this instead when loaded all
        // Instead of checking against undefined
        if (
          bottomOfWindow &&
          this.lastLoadedStory != undefined &&
          this.loadMoreStories
        ) {
          this.$store.dispatch("fetchAdditionalStories");
          this.$store.commit("SET_LOAD_MORE_STORIES", false);
        }
      };
    }
  },
  mounted() {
    this.$store.dispatch("fetchStories");
    this.scrollToBottom();
  }
};
</script>
<style lang="less" src="../assets/less/views/_Stories.less" scoped />
