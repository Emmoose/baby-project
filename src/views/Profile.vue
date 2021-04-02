<template>
  <div class="profile-view page-wrapper">
    <div class="profile-settings card">
      <div class="profile-settings__top-section">
        <h3 class="profile-settings__header">Profil</h3>
        <button @click="logout" class="profile-settings__logout-button">
          Logga ut
        </button>
      </div>

      <transition name="fade">
        <p v-if="showSuccess" class="profile-settings__success-message">
          profile updated
        </p>
      </transition>

      <form @submit.prevent class="profile-settings__form">
        <label for="name">Namn</label>
        <input
          class="profile-settings__input input-field"
          v-model.trim="name"
          type="text"
          :placeholder="userProfile.name"
          id="name"
        />

        <label for="relation">Relation</label>
        <input
          class="profile-settings__input input-field"
          v-model.trim="relation"
          type="text"
          :placeholder="userProfile.relation"
          id="relation"
        />
        <!-- <h3 class="profile-settings__second-header">Synlighet</h3>
        <form @submit.prevent class="profile-settings__visibility-form">
          <p class="profile-settings__text">
            Bestäm vilka bebisar som skall visas på "Poster"
          </p>
          <label class="radio-button">
            Ingrid
            <input type="radio" id="ingrid" value="0" v-model="picked" />
            <span class="radio-button__checkmark"></span>
          </label>
          <label class="radio-button">
            Axel
            <input type="radio" id="axel" value="1" v-model="picked" />
            <span class="radio-button__checkmark"></span>
          </label>
          <label class="radio-button">
            Båda bebisarna
            <input type="radio" id="both" value="2" v-model="picked" />
            <span class="radio-button__checkmark"></span>
          </label>
        </form> -->
        <button
          @click="updateProfile()"
          class="profile-settings__form-button button"
        >
          Uppdatera inställningar
        </button>
      </form>
      <div class="profile-settings__icon-tutorial card">
        <h3 class="profile-settings__icon-tutorial-header">
          Tips - Webbsidan som appikon
        </h3>
        <span>Obs - Guiden är för iPhone.</span>

        <ol class="profile-settings__icon-tutorial-list">
          <li class="profile-settings__icon-tutorial-step">
            <span
              >När du är på babyGram-hemsidan, som nu, klicka
              <img
                class="profile-settings__svg-icon"
                src="@/assets/svg-icons/profile__box-arrow-up.svg"
              />
              längst nere i Safari (Webbläsaren).</span
            >
          </li>
          <li class="profile-settings__icon-tutorial-step">
            <span>
              Scrolla ner en bit tills du ser "Lägg till på hemskärmen", med
              ikonen
              <img
                class="profile-settings__svg-icon"
                src="@/assets/svg-icons/profile__box-plus.svg"
              />, klicka på den.</span
            >
          </li>
          <li class="profile-settings__icon-tutorial-step">
            <span> Klicka "klar" eller "lägg till".</span>
          </li>
          <li class="profile-settings__icon-tutorial-step">
            <span
              >Klar! Nu ska babyGram finnas någonstans bland appikonerna.</span
            >
          </li>
        </ol>
        <span
          >Obs - För att komma direkt in på sidan med poster när du öppnar
          appen, gör stegen ovan när du har sidan med poster öppen.</span
        >
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  title: "The Baby 2103 - Profile",
  data() {
    return {
      name: "",
      relation: "",

      showSuccess: false
    };
  },
  computed: {
    ...mapState(["userProfile"]),

    picked: {
      get() {
        return this.userProfile.picked;
      },
      set(value) {
        this.$store.dispatch("updateProfile", {
          name: this.name !== "" ? this.name : this.userProfile.name,
          relation:
            this.relation !== "" ? this.relation : this.userProfile.relation,
          picked: value
        });
      }
    }
  },
  methods: {
    updateProfile() {
      this.$store.dispatch("updateProfile", {
        name: this.name !== "" ? this.name : this.userProfile.name,
        relation:
          this.relation !== "" ? this.relation : this.userProfile.relation,
        picked: this.picked !== "" ? this.picked : this.userProfile.picked
      });

      this.name = "";
      this.relation = "";

      this.showSuccess = true;

      setTimeout(() => {
        this.showSuccess = false;
      }, 2000);
    },

    logout() {
      this.$store.dispatch("logout");
    }
  }
};
</script>
<style lang="less" src="../assets/less/views/_Profile.less" scoped />
