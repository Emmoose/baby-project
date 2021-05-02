<template>
  <div id="app">
    <SiteNav v-if="showNav"></SiteNav>
    <div v-show="showGlobalLoader" class="global-loader">
      <div class="global-loader__spinner"></div>
    </div>
    <router-view />
  </div>
</template>

<script>
import { mapState } from "vuex";
import SiteNav from "@/components/SiteNav";

export default {
  components: {
    SiteNav
  },
  computed: {
    ...mapState(["userProfile", "showGlobalLoader"]),
    showNav() {
      return Object.keys(this.userProfile).length > 1;
    }
  }
};
</script>

<style lang="less" src="./assets/less/views/_App.less">


</style>
