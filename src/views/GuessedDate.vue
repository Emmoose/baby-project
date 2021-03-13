<template>
  <div class="guessed-date-view page-wrapper">
    <GuessDate />
    <div class="guess-graph card">
      <div class="guess-graph__your-guess-info" v-if="showGuess">
        <p>Du gissade på</p>
        <p class="guess-graph__your-guess">{{ yourGuess }}</p>
        <p>Här är fördelningen av gissningarna</p>
      </div>
      <div class="guess-graph__no-guess-info" v-if="!showGuess">
        <p class="guess-graph__no-guess">Du har inte gissat på något datum.</p>
      </div>

      <BabyDateChart
        v-bind:data-sent="guessedDates"
        v-bind:graph-title="'Baby Heights (g)'"
        v-bind:your-guess="this.guessedDates[2]"
      />
    </div>
  </div>
</template>

<script>
import moment from "moment";

import BabyDateChart from "@/components/charts/BabyDateChart";
import GuessDate from "@/components/GuessDate";
import { mapState } from "vuex";

export default {
  title: "BabyGram - Gissade datum",
  components: {
    BabyDateChart,
    GuessDate
  },
  computed: {
    ...mapState(["guessedDates"]),
    yourGuess() {
      return moment(this.guessedDates[2]).format("D/M");
    },
    showGuess() {
      return this.guessedDates[2] !== "";
    }
  },

  mounted() {
    this.$store.dispatch("fetchGuessedDates");
    this.$store.dispatch("fetchGuessedDate");
  }
};
</script>

<style lang="less" src="../assets/less/views/_GuessedDate.less" scoped />
