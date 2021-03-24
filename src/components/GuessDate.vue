<template>
  <div class="guess-date">
    <div v-if="!dateSent">
      <div>
        <p class="guess-date__text">Beräknat förlossningsdatum:</p>
        <div class="guess-date__date">29/3</div>
      </div>
      <p class="guess-date__text">
        Vad tror du? Klicka och välj datum.
      </p>
      <form>
        <input
          v-model="selectedDate"
          type="date"
          class="guess-date__date-picker input-field"
        />
        <button
          :disabled="selectedDate == ''"
          class="button guess-date__button"
          @click="sendDate"
        >
          Skicka gissat datum
        </button>
      </form>
    </div>
    <div v-if="dateSent">
      <h3>Skickat!</h3>
      <p class="guess-date__text">
        Kul gissning, vill du se vad andra har gissat i en tjusig graf?
      </p>
      <button @click="goToGuessedDates" class="button guess-date__button">
        JA
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedDate: "",
      dateSent: false
    };
  },
  methods: {
    sendDate() {
      this.$store.dispatch("selectGuessedDate", this.selectedDate);
      // TEMPORARY SOLUTION, not actually sure here that it was successfull
      this.dateSent = true;

      // Close modal if already on guessedDate view
      if (this.$router.currentRoute.name == "guessedDate") {
        this.$store.dispatch("updateShowGuessDate", false);
      }
    },

    goToGuessedDates() {
      this.$router.push("guessed-date");
    }
  }
};
</script>
<style lang="less" src="../assets/less/components/_GuessDate.less" scoped />
