import Vue from "vue";
import VueRouter from "vue-router";
import Game from "../views/Game.vue";
import { auth } from "../firebase";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Game",
    component: Game
  },
  {
    path: "/settings",
    name: "Settings",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/Settings.vue")
  },
  {
    path: "/login",
    name: "Login",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/Login.vue"),
    meta: {
      title: "Login"
    }
  },
  {
    path: "/admin",
    name: "Admin",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/Admin.vue"),
    meta: {
      title: "Admin",
      requiresAuth: true
    }
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

// navigation guard to check for logged in users
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(x => x.meta.requiresAuth);

  if (requiresAuth && !auth.currentUser) {
    next("/login");
  } else {
    next();
  }

  //   if (to.path === "/manage-content") {
  //     auth.currentUser
  //       .getIdTokenResult(/* forceRefresh */ true)
  //       .then(function(tokenResult) {
  //         if (tokenResult.claims.admin === true) {
  //           next();
  //         } else {
  //           next("/");
  //         }
  //       })
  //       .catch(function() {
  //         next("/");
  //       });
  //   } else {
  //     const requiresAuth = to.matched.some(x => x.meta.requiresAuth);

  //     if (requiresAuth && !auth.currentUser) {
  //       next("/login");
  //     } else {
  //       next();
  //     }
  //   }
});

export default router;
