<template>
  <div id="app">
    <SiteNav></SiteNav>
    <keep-alive>
      <router-view />
    </keep-alive>
  </div>
</template>

<script>
import SiteNav from "@/components/SiteNav";

export default {
  components: {
    SiteNav
  }
};
</script>

<style lang="less" src="./assets/less/views/_App.less"></style>
