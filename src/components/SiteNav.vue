<template>
  <header class="header-view">
    <router-link class="header-view__link" to="/">
      Game
    </router-link>

    <router-link class="header-view__link" to="/settings">
      Settings
    </router-link>

    <div v-if="userLoggedIn">
      <span>{{ userProfile.name }}</span>
      <span @click="logout">Logga ut</span>
    </div>
  </header>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      showUserMenu: false
    };
  },
  methods: {
    clickedOutsideMenu() {
      this.showUserMenu = false;
    },

    toggleShowUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },

    logout() {
      this.$store.dispatch("logout");
    }
  },
  computed: {
    ...mapState(["userProfile", "userLoggedIn", "userIsAdmin"])
  }
};
</script>
<style lang="less" src="../assets/less/components/_siteNav.less" scoped />
