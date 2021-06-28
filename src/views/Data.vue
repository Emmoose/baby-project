<template>
  <div class="data-view page-wrapper">
    <div class="graphs card">
      <BabyMetricChart
        v-bind:data="weightsData"
        v-bind:graph-title="'Bebisvikt (g)'"
      />
    </div>
    <div class="graphs card">
      <BabyMetricChart
        v-bind:data="heightsData"
        v-bind:graph-title="'Bebislängd (cm)'"
      />
    </div>
  </div>
</template>

<script>
import BabyMetricChart from "@/components/charts/BabyMetricChart";
import { mapState } from "vuex";

export default {
  title: "BabyGram - Bebisdata",
  components: {
    BabyMetricChart
  },
  computed: {
    ...mapState(["heightsData", "weightsData"])
  },

  mounted() {
    this.$store.dispatch("fetchWeightDataPoints");
    this.$store.dispatch("fetchHeightDataPoint");
  }
};
</script>

<style lang="less" src="../assets/less/views/_Data.less" scoped />
