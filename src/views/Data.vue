<template>
  <div class="data-view page-wrapper">
    <BabyChart />
  </div>
</template>
<script>
import BabyChart from "@/components/BabyChart";

export default {
  title: "BabyGram - Bebisdata",
  components: {
    BabyChart
  }
};
</script>

<style lang="less" src="../assets/less/views/_Data.less" scoped />
