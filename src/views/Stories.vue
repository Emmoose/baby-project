<template>
  <div class="stories-view page-wrapper">
    <GuessDate />
    <ul class="stories">
      <li class="story card" v-for="story in stories" :key="story.id">
        <div class="story__post-information">
          <div>
            <p class="story__username">{{ story.userName }}</p>
            <p class="story__post-date">{{ story.createdOn | formatDate }}</p>
          </div>
          <a
            v-if="story.userId == userProfile.userId"
            class="story__edit-story"
            href="#"
            @click="editStory(story.id)"
            >Redigera</a
          >
        </div>

        <ImageCarousel :imageList="story.image" />
        <p class="story__text">{{ story.story }}</p>
        <CommentsStory :storyId="story.id" v-bind:likes="story.likes" />
      </li>
    </ul>
  </div>
</template>

<script>
import CommentsStory from "@/components/CommentsStory";
import ImageCarousel from "@/components/ImageCarousel";
import GuessDate from "@/components/GuessDate";
import { mapState } from "vuex";

export default {
  title: "babyGram - Poster",
  components: {
    CommentsStory,
    ImageCarousel,
    GuessDate
  },
  computed: {
    ...mapState(["stories", "lastLoadedStory", "userProfile"])
  },
  methods: {
    editStory(storyId) {
      this.$store.dispatch("addEditStory", {
        storyId: storyId,
        editMode: true
      });

      // Hack fix
      this.$router.push("/manage-content").catch(() => {
        this.$router.push("/manage-content");
      });
    },

    scrollToBottom() {
      window.onscroll = () => {
        let bottomOfWindow =
          Math.max(
            window.pageYOffset,
            document.documentElement.scrollTop,
            document.body.scrollTop
          ) +
            window.innerHeight ===
          document.documentElement.offsetHeight;

        // Hacky fix here, remove this instead when loaded all
        // Instead of checking against undefined
        if (bottomOfWindow && this.lastLoadedStory != undefined) {
          this.$store.dispatch("fetchAdditionalStories");
        }
      };
    }
  },
  mounted() {
    this.$store.dispatch("fetchStories");
    this.$store.dispatch("fetchGuessedDate");
    this.scrollToBottom();
  }
};
</script>
<style lang="less" src="../assets/less/views/_Stories.less" scoped />
