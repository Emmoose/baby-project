import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store/store";
import { auth } from "./firebase";
import titleMixin from "./mixins/titleMixin";
import "./assets/less/app.less";
import "@/plugins/apexcharts";
import "@/utility/filters.js";
import "@/utility/directives.js";
Vue.mixin(titleMixin);
Vue.config.productionTip = false;

let app;
auth.onAuthStateChanged(user => {
  if (!app) {
    app = new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount("#app");
  }

  if (user) {
    store.dispatch("fetchUserProfile", user);
  }
});
