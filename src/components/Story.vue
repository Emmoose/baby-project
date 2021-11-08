<template>
  <div class="">
    <Carousel
      @liked-story="proxyLikeStory"
      :image-list="story.image"
      v-bind:list-length="story.image.length"
    />
    <p class="story__text">{{ story.story }}</p>
    <CommentsStory :storyId="story.id" v-bind:likes="story.likes" />
  </div>
</template>

<script>
import Carousel from "@/components/Carousel";
import CommentsStory from "@/components/CommentsStory";

export default {
  components: {
    Carousel,
    CommentsStory
  },
  props: {
    story: Object
  },
  methods: {
    proxyLikeStory() {
      // Improve this solution
      this.$children[1].likeStory();
    }
  }
};
</script>
<style lang="less" src="../assets/less/components/_Story.less" scoped />
