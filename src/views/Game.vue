<template>
  <div class="game">
    <div class="game__board">
      <div class="game__players">
        <div class="game__player-header">
          <span class="name">Name</span>
          <span class="score">Score</span>
          <span class="round-score">Score in Round</span>
        </div>
        <ul>
          <li
            class="game__player"
            v-bind:class="{
              'game__player--out-round': !player.inRound
            }"
            v-for="player in players"
            :key="player.name"
          >
            <span class="name">
              {{ player.name }}
            </span>
            <span class="score">{{ player.score }}</span>
            <span class="round-score">{{ player.roundScore }}</span>
          </li>
        </ul>
      </div>
      <Board
        :question-text="questionText"
        :question-options="questionOptions"
        :in-between-selection="inBetweenSelection"
        v-on:option-selected="selectOption"
      />
      <div class="game__info">
        <span v-show="roundGoing && !inBetweenSelection">
          {{ players[this.currentPlayerNumber].name }} turns - Pick option or
          pass.
        </span>
        <span v-show="inBetweenSelection">Did you answer correctly?</span>
        <span v-show="!roundGoing">{{ endRoundText }} </span>
      </div>
    </div>
    <div class="game__buttons">
      <button
        class="game__button game__button--pass"
        v-on:click="passAnswer"
        v-show="!inBetweenSelection && roundGoing"
      >
        Pass
      </button>
      <div class="game__correct" v-show="inBetweenSelection">
        <button
          class="game__button game__button--correct"
          v-on:click="correctAnswer"
        >
          Yes
        </button>
        <button
          class="game__button game__button--wrong"
          v-on:click="wrongAnswer"
        >
          No
        </button>
      </div>
      <button
        class="game__button game__button--next"
        v-show="!roundGoing"
        v-on:click="setUpNextRound"
      >
        Next Question
      </button>
    </div>
  </div>
</template>

<script>
import Board from "@/components/Board";

export default {
  name: "Game",
  components: {
    Board
  },

  data() {
    return {
      currentPlayerNumber: 0,
      inBetweenSelection: false,
      roundGoing: true,
      playerWon: false,
      endRoundText: " ",
      answeredQuestions: 0,
      scoreLimit: null,
      players: [
        {
          name: "Bengt",
          score: 0,
          roundScore: 0,
          inRound: true
        },
        {
          name: "Ake",
          score: 0,
          roundScore: 0,
          inRound: true
        },
        {
          name: "Rosa",
          score: 0,
          roundScore: 0,
          inRound: true
        },
        {
          name: "Goran",
          score: 0,
          roundScore: 0,
          inRound: true
        }
      ],
      playersInRound: [0, 1, 2, 3],
      playerIndex: 0,
      questionText: "Casualties WII (from 1 - 10)",
      questionOptions: [
        { option: "Sovjet", answer: 1, show: false },
        { option: "China", answer: 2, show: false },
        { option: "Germany", answer: 3, show: false },
        { option: "Poland", answer: 4, show: false },
        { option: "Indonesia", answer: 5, show: false },
        { option: "Japan", answer: 6, show: false },
        { option: "India", answer: 7, show: false },
        { option: "Yugoslavia", answer: 8, show: false },
        { option: "French Indochina", answer: 9, show: false },
        { option: "France", answer: 10, show: false }
      ]
    };
  },
  methods: {
    selectOption(index) {
      this.questionOptions[index].show = true;
      this.inBetweenSelection = true;
    },

    checkEndQuestion() {
      // All players are out of the round
      if (this.playersInRound.length == 0) {
        this.roundGoing = false;

        this.questionOptions.forEach(question => {
          question.show = true;
        });

        this.endRoundText =
          "All players out, click button to start new question";
      }

      // All questions answered with players left in round
      else if (this.answeredQuestions == 4) {
        // SHOULD BE 10 HERE
        console.log("Round over");
        var nameText = "";

        this.questionOptions.forEach(question => {
          question.show = true;
        });

        for (let index = 0; index < this.playersInRound.length; index++) {
          nameText = `${nameText} ${
            this.players[this.playersInRound[index]].name
          } (${this.players[this.playersInRound[index]].roundScore})`;

          this.players[this.playersInRound[index]].score += this.players[
            this.playersInRound[index]
          ].roundScore;

          if (
            this.players[this.playersInRound[index]].score >= this.scoreLimit
          ) {
            this.playerWon = true;
          }

          if (this.playerWon) {
            this.endRoundText = "GAME OVER - SOMEONE WON";
          } else {
            this.endRoundText = nameText;
          }
        }
      } else {
        this.currentPlayerNumber = this.playersInRound[this.playerIndex];
      }
    },

    correctAnswer() {
      this.answeredQuestions++;

      this.players[this.playersInRound[this.playerIndex]].roundScore += 1;
      this.playerIndex + 1 == this.playersInRound.length
        ? (this.playerIndex = 0)
        : this.playerIndex++;

      this.inBetweenSelection = false;
      this.checkEndQuestion();
    },

    wrongAnswer() {
      this.answeredQuestions++;

      this.players[this.playersInRound[this.playerIndex]].inRound = false;
      this.removePlayerFromRound();

      // IS THIS ALSO NEEDEDD IN PASS?
      if (this.playerIndex == this.playersInRound.length) {
        this.playerIndex = 0;
      }

      this.inBetweenSelection = false;
      this.checkEndQuestion();
    },
    passAnswer() {
      this.answeredQuestions++;
      this.players[this.playersInRound[this.playerIndex]].inRound = false;
      this.players[this.playersInRound[this.playerIndex]].score += this.players[
        this.playersInRound[this.playerIndex]
      ].roundScore;

      this.removePlayerFromRound();

      if (this.playerIndex == this.playersInRound.length) {
        this.playerIndex = 0;
      }
      this.checkEndQuestion();
    },

    removePlayerFromRound() {
      this.playersInRound = this.playersInRound.filter(
        (player, index) => index != this.playerIndex
      );
    },

    setUpNextRound() {
      console.log("TODO");
      //CLEAN OUT ROUND SCORE ETC
    },
    setUpNewGame(data) {
      this.playersInRound = [...Array(data.players.length).keys()];
      this.players = data.players.slice(); // DEEP COPY HERER?
      this.scoreLimit = data.scoreLimit;
      this.inBetweenSelection = false;
      this.currentPlayerNumber = 0;
      this.roundGoing = true;
      this.endRoundText = " ";
      this.answeredQuestions = 0;
    }
  },
  mounted() {
    this.$root.$on("gamestart", data => this.setUpNewGame(data));
  }
};
</script>
<style lang="less" src="../assets/less/views/_Game.less" scoped />
