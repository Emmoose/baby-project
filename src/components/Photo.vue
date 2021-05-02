<template>
  <li
    class="photo"
    v-bind:class="{
      'photo--landscape': landscape,
      'photo--loading': loading
    }"
  >
    <img
      @click="$emit('open')"
      class="photo__image"
      v-bind:title="datePublished | formatDate"
      v-bind:class="{
        'photo__image--loading': loading
      }"
      :src="image.src"
      alt=""
    />
    <div
      class="photo__spinner"
      v-bind:class="{
        'photo__spinner--loading': loading
      }"
    ></div>
  </li>
</template>

<script>
export default {
  data() {
    return {
      image: { src: "" },
      landscape: false, //Move to computed?
      loading: true
    };
  },

  props: {
    photoUrl: String,
    datePublished: Object
  },

  mounted() {
    var image = new Image();
    image.src = this.photoUrl;
    image.onload = () => {
      this.image = image;
      this.loading = false;
      if (image.width > image.height) {
        this.landscape = true;
      }
    };
  }
};
</script>
<style lang="less" src="../assets/less/components/_Photo.less" scoped />
