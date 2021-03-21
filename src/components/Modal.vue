<template>
  <div class="modal">
    <div class="modal__content">
      <div @click="$emit('close')" class="modal__close">X</div>
      <slot></slot>
    </div>
  </div>
</template>

<script></script>
<style lang="less" src="../assets/less/components/_Modal.less" scoped />
