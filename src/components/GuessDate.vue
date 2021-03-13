<template>
  <div class="guess-date-modal" v-if="showGuessDate">
    <div class="guess-date-modal__content">
      <div @click="closeGuessDatetModal" class="guess-date-modal__close">
        Stäng
      </div>
      <div v-if="!dateSent">
        <div>
          <p class="guess-date-modal__text">Beräknat förlossningsdatum:</p>
          <div class="guess-date-modal__date">29/3</div>
        </div>
        <p class="guess-date-modal__text">
          Vad tror du? Klicka och välj datum.
        </p>
        <form>
          <input
            v-model="selectedDate"
            type="date"
            class="guess-date-modal__date-picker"
          />
          <button
            :disabled="selectedDate == ''"
            class="button guess-date-modal__button"
            @click="sendDate"
          >
            Skicka gissat datum
          </button>
        </form>
      </div>
      <div v-if="dateSent">
        <h3>Skickat!</h3>
        <p class="guess-date-modal__text">
          Kul gissning, vill du se vad andra har gissat i en tjusig graf?
        </p>
        <button
          @click="goToGuessedDates"
          class="button guess-date-modal__button"
        >
          JA
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      selectedDate: "",
      dateSent: false,
      showPlaceholderText: true
    };
  },
  computed: {
    ...mapState(["showGuessDate"])
  },
  methods: {
    closeGuessDatetModal() {
      this.$store.dispatch("updateShowGuessDate", false);
    },

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
