<template>
  <div class="image-carousel-view">
    <carousel
      :per-page="1"
      :center-mode="true"
      pagination-active-color="#91b352"
      :pagination-padding="10"
      :navigation-enabled="true"
      :navigation-next-label="'Nästa bild'"
      :navigation-prev-label="'Tidigare bild'"
      
    >
      <slide v-for="(image, index) in imageList" v-bind:key="index">
        <img class="preview" height="268" width="356" :src="image" />
      </slide>
    </carousel>
  </div>
</template>

<script>
// import { Carousel } from "vue-carousel";
import Carousel from "@/components/Carousel";
export default {
  components: {
    Carousel
  },
  props: {
    imageList: Array
  }
};
</script>
<style lang="less" src="../assets/less/components/_ImageCarousel.less" scoped />
