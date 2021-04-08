<template>
  <header class="header-view">
    <div class="header-container">
      <div class="header-container__left">
        <router-link to="/">
          <h2>babyGram</h2>
        </router-link>
      </div>

      <div class="header-container__right">
        <ul class="navigation-links">
          <li class="navigation-links__item">
            <router-link class="navigation-links__link" to="/">
              <img
                class="navigation-links__svg-icon navigation-links__svg-icon--normal"
                src="@/assets/svg-icons/camera.svg"/>
              <img
                class="navigation-links__svg-icon navigation-links__svg-icon--active"
                src="@/assets/svg-icons/camera--filled.svg"
            /></router-link>
          </li>
          <li class="navigation-links__item">
            <router-link class="navigation-links__link" to="/photo-album"
              ><img
                class="navigation-links__svg-icon navigation-links__svg-icon--normal"
                src="@/assets/svg-icons/gallery.svg"/><img
                class="navigation-links__svg-icon navigation-links__svg-icon--active"
                src="@/assets/svg-icons/gallery--filled.svg"
            /></router-link>
          </li>
          <li class="navigation-links__item">
            <router-link class="navigation-links__link" to="/Data">
              <img
                class="navigation-links__svg-icon navigation-links__svg-icon--normal"
                src="@/assets/svg-icons/trend.svg"/>
              <img
                class="navigation-links__svg-icon navigation-links__svg-icon--active"
                src="@/assets/svg-icons/trend--filled.svg"
            /></router-link>
          </li>

          <li class="navigation-links__item" v-if="userIsAdmin">
            <router-link class="navigation-links__link" to="/manage-content">
              <img
                class="navigation-links__svg-icon navigation-links__svg-icon--normal"
                src="@/assets/svg-icons/content-management.svg"/><img
                class="navigation-links__svg-icon navigation-links__svg-icon--active"
                src="@/assets/svg-icons/content-management--filled.svg"
            /></router-link>
          </li>
          <li class="navigation-links__item navigation-links__item--last">
            <div
              @click="toggleShowUserMenu"
              v-click-outside="clickedOutsideMenu"
            >
              <img
                v-if="!showUserMenu"
                class="navigation-links__svg-icon navigation-links"
                src="@/assets/svg-icons/user.svg"
              /><img
                v-if="showUserMenu"
                class="navigation-links__svg-icon navigation-links"
                src="@/assets/svg-icons/user--filled.svg"
              />
              <div class="user-menu" v-if="showUserMenu">
                <div class="user-menu__triangle"></div>
                <ul class="user-menu__list">
                  <li class="user-menu__item">
                    <router-link class="user-menu__link" to="/profile"
                      ><img
                        class="user-menu__svg-icon"
                        src="@/assets/svg-icons/settings.svg"
                      />Profil</router-link
                    >
                  </li>
                  <li class="user-menu__item">
                    <span class="user-menu__link" @click="logout"
                      ><img
                        class="user-menu__svg-icon"
                        src="@/assets/svg-icons/logout.svg"
                      />Logga ut</span
                    >
                  </li>
                </ul>
              </div>
            </div>
          </li>
        </ul>
        <div v-if="userLoggedIn" class="username">
          <span>{{ userProfile.name }}</span>
        </div>
      </div>
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
