<template>
  <div class="photo-album-view page-wrapper">
    <div class="image-album card">
      <p class="image-album__info-text">
        Samling av alla bilder som har lagts upp på poster. Klicka på en bild
        för att se den i full storlek.
      </p>
      <ul class="image-list">
        <li
          class="image-list__items"
          v-for="image in allImageUrls"
          :key="image.id"
        >
          <img
            @click="openLargeImage(image.url)"
            class="image-list__image"
            :src="image.url"
          />
        </li>
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
import { mapState } from "vuex";

export default {
  title: "babyGram - Fotoalbum",
  data() {
    return {
      largeImageUrl: "",
      showLargeImage: false
    };
  },
  computed: {
    ...mapState(["allImageUrls", "lastLoadedImageUrl"])
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
            window.innerHeight ===
          document.documentElement.offsetHeight;

        // Hacky fix here, remove this instead when loaded all
        // Instead of checking against undefined
        if (bottomOfWindow && this.lastLoadedImageUrl != undefined) {
          this.$store.dispatch("fetchAdditionalImageLinks");
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
