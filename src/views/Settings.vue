<template>
  <div class="settings-view">
    <p>Number of players</p>
    <ul>
      <li v-for="(player, index) in players" v-bind:key="index">
        <input v-model="players[index].name" type="text" name="" id="" /><button
          v-show="index > 0"
          v-on:click="deletePlayer(index)"
        >
          Delete
        </button>
      </li>
    </ul>
    <button v-on:click="addPlayer">Add another player</button>
    <p>Select Final score, if empty forever mode</p>
    <input type="number" v-model.number="scoreLimit" />
    <p>Pick question category or mix</p>
    <p>toDO</p>
    <button v-on:click="startGame">Start Game</button>
  </div>
</template>
<script>
export default {
  title: "Quiz - Settings",
  data() {
    return {
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
        }
      ]
    };
  },

  methods: {
    deletePlayer(index) {
      this.players.splice(index, 1);
    },

    addPlayer() {
      this.players.push({
        name: "",
        score: 0,
        roundScore: 0,
        inRound: true
      });
    },

    startGame() {
      this.$root.$emit("gamestart", {
        players: this.players,
        scoreLimit: this.scoreLimit
      });

      this.$router.push("./");

      // Set score goal
      // Set Questions
    }
  }
};
</script>

<style lang="less" src="../assets/less/views/_Settings.less" scoped />
