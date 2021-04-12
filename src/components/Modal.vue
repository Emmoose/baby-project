<template>
  <div class="modal">
    <div class="modal__content">
      <img
        @click="$emit('close')"
        class="modal__svg-close"
        src="@/assets/svg-icons/remove.svg"
      />
      <slot></slot>
    </div>
  </div>
</template>

<script></script>
<style lang="less" src="../assets/less/components/_Modal.less" scoped />
