<template>
  <div class="board">
    <div
      class="board__container"
      :style="{
        '--m': 10, // MOVE TO STYLING?
        '--tan': Math.tan(Math.PI / 10).toFixed(2)
      }"
    >
      <div class="board__center">
        <div class="board__question">{{ questionText }}</div>
        <li
          class="board__option"
          v-for="(question, index) in questionOptions"
          :key="question.answer"
          :style="{
            '--i': index
          }"
        >
          <span class="board__option-text">
            {{ question.option }}
          </span>
        </li>
      </div>
      <li
        class="board__answer"
        v-for="(question, index) in questionOptions"
        :key="question.answer"
        :style="{ '--i': index }"
      >
        <span v-show="question.show" class="board__answer-text">
          {{ question.answer }}
        </span>
        <button
          :disabled="inBetweenSelection"
          v-show="!question.show"
          v-on:click="$emit('option-selected', index)"
          class="board__answer-button"
        ></button>
      </li>
    </div>
  </div>
</template>
<script>
export default {
  name: "Board",
  props: {
    questionOptions: Array,
    questionText: String,
    inBetweenSelection: Boolean
  }
};
</script>

<style lang="less" src="../assets/less/components/_Board.less" scoped />
