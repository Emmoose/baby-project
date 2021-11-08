<template>
  <li
    class="image"
    v-bind:class="listClass"
    :data-date="createdOn.seconds"
    :data-anchor="anchorClass"
    :data-location="location"
  >
    <p class="image__published-date">
      <span> {{ createdOn | formatDate }}</span>
    </p>
    <img
      @click="$emit('open')"
      class="image__image"
      v-bind:title="createdOn | formatDate"
      v-bind:class="{
        'image__image--loading': loading
      }"
      :src="image.src"
      alt=""
    />
    <div
      class="image__spinner"
      v-bind:class="{
        'image__spinner--loading': loading
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
        "image--landscape": this.landscape,
        "image--loading": this.loading,
        first: this.location == "first",
        last: this.location == "last",
        middle: this.location == "middle"
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
<style lang="less" src="../assets/less/components/_ImageView.less" scoped />
