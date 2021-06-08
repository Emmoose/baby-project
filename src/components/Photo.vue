<template>
  <li class="photo" v-bind:class="listClass">
    <p class="photo__published-date">
      <!-- <span>{{ createdOn.seconds }}</span> -->
      <span> {{ createdOn | formatDate }}</span>
    </p>
    <div
      :data-anchor="anchorClass"
      :data-date="createdOn.seconds"
      :data-location="location"
    ></div>
    <img
      @click="$emit('open')"
      class="photo__image"
      v-bind:title=" createdOn | formatDate"
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
    location: String,
    createdOn: Object,
    imageUrl: String
  },

  computed: {
    listClass() {
      return {
        "photo--landscape": this.landscape,
        "photo--loading": this.loading,
        "first": this.location == "first",
        "last": this.location == "last",
        "middle": this.location == "middle"
      };
    },

    anchorClass() {
      const date = new Date(this.createdOn.seconds * 1000),
        month = date.getMonth() + 1,
        newMonth = String(month).padStart("2", 0),
        dateFormatted = date.getFullYear() + "-" + newMonth;
      return dateFormatted;
    }
  },

  mounted() {
    var image = new Image();
    image.src = this.imageUrl;
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
