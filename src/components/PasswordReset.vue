<template>
  <div class="reset-modal">
    <div class="reset-modal__content">
      <div @click="$emit('close')" class="reset-modal__close">stäng</div>
      <h3 class="reset-modal__header">Återställ lösenord</h3>
      <div v-if="!showSuccess">
        <p class="reset-modal__text">
          Fyll i E-post för att återställa lösenordet
        </p>
        <form @submit.prevent>
          <input
            v-model.trim="email"
            type="email"
            placeholder="din@e-post.com"
          />
        </form>
        <p v-if="errorMsg !== ''" class="reset-modal__error">{{ errorMsg }}</p>
        <button @click="resetPassword()" class="button">Återställ</button>
      </div>
      <p v-else>Titta i mailboxen för en åteställningslänk.</p>
    </div>
  </div>
</template>

<script>
import { auth } from "@/firebase";
export default {
  data() {
    return {
      email: "",
      showSuccess: false,
      errorMsg: ""
    };
  },
  methods: {
    async resetPassword() {
      this.errorMsg = "";
      try {
        await auth.sendPasswordResetEmail(this.email);
        this.showSuccess = true;
      } catch (err) {
        this.errorMsg = err.message;
      }
    }
  }
};
</script>
<style lang="less" src="../assets/less/components/_PasswordReset.less" scoped />
