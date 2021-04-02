<template>
  <header class="header-view">
    <div
      class="mobile-overlay"
      :class="{ 'mobile-overlay--is-open': mobileMenuIsOpen }"
      @click="toggleMobileMenu"
    >
      Mobile
    </div>
    <div class="header-container">
      <div class="header-top">
        <div class="header-top__mobile-nav-button" @click="toggleMobileMenu">
          <svg viewBox="0 0 100 80" width="20" height="20">
            <rect width="100" height="20"></rect>
            <rect y="30" width="100" height="20"></rect>
            <rect y="60" width="100" height="20"></rect>
          </svg>
        </div>
        <router-link to="/">
          <h2>babyGram</h2>
        </router-link>
        <div v-if="userLoggedIn" class="username">
          <span>{{ userProfile.name }}</span>
        </div>
      </div>

      <div
        class="header-bottom header-bottom--mobile-menu"
        :class="{ 'header-bottom--is-open': mobileMenuIsOpen }"
      >
        <h3 class="header-bottom__mobile-menu-header">Meny</h3>
        <ul class="navigation-links" @click="toggleMobileMenu">
          <li class="navigation-links__item">
            <router-link class="navigation-links__link" to="/"
              >Poster</router-link
            >
          </li>
          <li class="navigation-links__item">
            <router-link class="navigation-links__link" to="/Data"
              >Bebisdata</router-link
            >
          </li>
          <li class="navigation-links__item">
            <router-link class="navigation-links__link" to="/guessed-date"
              >Gissade datum</router-link
            >
          </li>
          <li class="navigation-links__item">
            <router-link class="navigation-links__link" to="/photo-album"
              >Fotoalbum</router-link
            >
          </li>
          <li class="navigation-links__item" v-if="isUserAdmin">
            <router-link class="navigation-links__link" to="/manage-content"
              >Skapa</router-link
            >
          </li>
          <li class="navigation-links__item">
            <router-link class="navigation-links__link" to="/profile"
              >Inställningar</router-link
            >
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script>
import { mapState } from "vuex";
import config from "../utility/config";

export default {
  data() {
    return {
      mobileMenuIsOpen: false
    };
  },
  methods: {
    toggleMobileMenu() {
      if (this.mobileMenuIsOpen) {
        this.mobileMenuIsOpen = false;
        document.documentElement.classList.remove("mobile-menu--open");
      } else {
        this.mobileMenuIsOpen = true;
        document.documentElement.className = "mobile-menu--open";
      }
    }
  },
  computed: {
    ...mapState(["userProfile", "userLoggedIn"]),
    isUserAdmin() {
      // Check if logged in
      if (this.userProfile) {
        return config.adminEmails.includes(this.userProfile.email);
      }
      return false;
    }
  }
};
</script>
<style lang="less" src="../assets/less/components/_siteNav.less" scoped />
