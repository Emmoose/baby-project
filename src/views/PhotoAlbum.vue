<template>
  <div class="photo-album-view page-wrapper">
    <div class="image-album">
      <ul class="image-list">
        <Photo
          v-for="image in allImageUrls"
          :key="image.id"
          v-bind:photo-url="image.url"
          v-bind:date-published="image.createdOn"
          @open="openLargeImage(image.url)"
        ></Photo>
      </ul>
    </div>
    <div
      v-if="showLargeImage"
      @click="closeLargeImage()"
      class="image-popup"
      :class="showLargeImage ? 'image-popup--show' : ''"
    >
      <img class="image-popup__image card" :src="largeImageUrl" />
    </div>
  </div>
</template>

<script>
import Photo from "@/components/Photo";
import { mapState } from "vuex";

export default {
  title: "babyGram - Fotoalbum",
  components: {
    Photo
  },
  data() {
    return {
      largeImageUrl: "",
      showLargeImage: false
    };
  },

  computed: {
    ...mapState(["allImageUrls", "loadMoreImages", "lastLoadedImageUrl"])
  },
  methods: {
    openLargeImage(imageUrl) {
      // only allow in desktop
      if (window.innerWidth > 991) {
        this.largeImageUrl = imageUrl;
        this.showLargeImage = true;
      }
    },

    closeLargeImage() {
      // only allow in desktop
      if (window.innerWidth > 991) {
        this.showLargeImage = false;
        this.largeImageUrl = "";
      }
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
            1600 >
          document.documentElement.offsetHeight;

        // Hacky fix here, remove this instead when loaded all
        // Instead of checking against undefined
        if (
          bottomOfWindow &&
          this.lastLoadedImageUrl != undefined &&
          this.loadMoreImages
        ) {
          this.$store.dispatch("fetchAdditionalImageLinks");
          this.$store.dispatch("setLoadMoreImages", false);
        }
      };
    }
  },

  mounted() {
    this.$store.dispatch("fetchImageLinks");
    this.scrollToBottom();
  }
};
</script>

<style lang="less" src="../assets/less/views/_PhotoAlbum.less" scoped />
