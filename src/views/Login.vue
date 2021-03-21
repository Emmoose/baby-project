<template>
  <div class="login-view">
    <div class="hero-area">
      <h1>babyGram</h1>
      <img class="hero-area__image" src="@/assets/images/start-page2.png" />
    </div>
    <div
      :class="{ 'signup-form': !showLoginForm }"
      class="col2 authentication-area"
    >
      <form
        class="authentication-area__form"
        v-if="showLoginForm"
        @submit.prevent
      >
        <h1 class="authentication-area__header">Hej, Välkommen!</h1>
        <div>
          <label for="email1">E-post</label>
          <input
            v-model.trim="loginForm.email"
            type="text"
            placeholder="din@e-post.com"
            id="email1"
          />
        </div>
        <div>
          <label for="password1">Lösenord</label>
          <input
            v-model.trim="loginForm.password"
            type="password"
            placeholder="******"
            id="password1"
          />
        </div>
        <div class="authentication-area__error" v-show="loginError">
          Fel lösenord
        </div>
        <button @click="login()" class="button">Logga in</button>
        <div class="authentication-area__link-container">
          <a @click="togglePasswordReset()">Glömt lösenord</a>
          <a @click="toggleForm()">Skapa konto</a>
        </div>
      </form>
      <form v-else @submit.prevent class="authentication-area__form">
        <h1 class="authentication-area__header">Skapa Konto</h1>
        <div>
          <label for="name">Namn</label>
          <input
            v-model.trim="signupForm.name"
            type="text"
            placeholder="Ditt namn"
            id="name"
          />
        </div>
        <div>
          <label for="email2">E-post</label>
          <input
            v-model.trim="signupForm.email"
            type="text"
            placeholder="din@e-post.com"
            id="email2"
          />
        </div>
        <div>
          <label for="password2">Lösenord</label>
          <input
            v-model.trim="signupForm.password"
            type="password"
            placeholder="Minst 6 tecken"
            id="password2"
          />
        </div>
        <button @click="signup()" class="button">Registrera</button>
        <div class="authentication-area__link-container">
          <a @click="toggleForm()">Tillbaka till inloggning</a>
        </div>
      </form>
      <Modal v-if="showPasswordReset" @close="togglePasswordReset()"
        ><PasswordReset
      /></Modal>
    </div>
  </div>
</template>

<script>
import PasswordReset from "@/components/PasswordReset";
import Modal from "@/components/Modal";
import { mapState } from "vuex";

export default {
  title: "BabyGram - Logga in",
  computed: {
    ...mapState(["loginError"])
  },
  components: {
    PasswordReset,
    Modal
  },
  data() {
    return {
      loginForm: {
        email: "",
        password: ""
      },
      signupForm: {
        name: "",
        email: "",
        password: ""
      },
      showLoginForm: true,
      showPasswordReset: false
    };
  },
  methods: {
    toggleForm() {
      this.showLoginForm = !this.showLoginForm;
    },
    togglePasswordReset() {
      this.showPasswordReset = !this.showPasswordReset;
    },
    login() {
      this.$store.dispatch("login", {
        email: this.loginForm.email,
        password: this.loginForm.password
      });
    },
    signup() {
      this.$store.dispatch("signup", {
        email: this.signupForm.email,
        password: this.signupForm.password,
        name: this.signupForm.name
      });
    }
  }
};
</script>
<style lang="less" src="../assets/less/views/_Login.less" scoped />
