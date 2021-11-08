<template>
  <div class="show-who-liked">
    <h3 class="show-who-liked__header">Gillade</h3>
    <ul class="show-who-liked__list">
      <li
        class="show-who-liked__item"
        v-for="like in likes"
        v-bind:key="like.userId"
      >
        {{ like.name }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    likes: Array
  }
};
</script>
<style lang="less" src="../assets/less/components/_ShowWhoLiked.less" scoped />
