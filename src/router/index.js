import Vue from "vue";
import VueRouter from "vue-router";
import Stories from "../views/Stories.vue";
import { auth } from "../firebase";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Stories",
    component: Stories,
    meta: {
      requiresAuth: true,
      title: "Stories"
    }
  },
  {
    path: "/data",
    name: "Data",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/Data.vue"),
    meta: {
      requiresAuth: true,
      title: "Data"
    }
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
    path: "/photo-album",
    name: "photoAlbum",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/PhotoAlbum.vue"),
    meta: {
      title: "Photo Album"
    }
  },
  {
    path: "/guessed-date",
    name: "guessedDate",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/GuessedDate.vue"),
    meta: {
      title: "Guess Date"
    }
  },
  {
    path: "/profile",
    name: "profle",
    component: () =>
      import(/* webpackChunkName: "settings" */ "../views/Profile.vue"),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/manage-content",
    name: "manageContent",
    component: () =>
      import(/* webpackChunkName: "settings" */ "../views/ManageContent.vue"),
    meta: {
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
  if (to.path === "/manage-content") {
    auth.currentUser
      .getIdTokenResult(/* forceRefresh */ true)
      .then(function(tokenResult) {
        if (tokenResult.claims.admin === true) {
          next();
        } else {
          next("/");
        }
      })
      .catch(function() {
        next("/");
      });
  } else {
    const requiresAuth = to.matched.some(x => x.meta.requiresAuth);

    if (requiresAuth && !auth.currentUser) {
      next("/login");
    } else {
      next();
    }
  }
});

export default router;
