import Vue from "vue";
import Vuex from "vuex";

import { createPersistedState, createSharedMutations } from "vuex-electron";

import modules from "./modules";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    dropIntoFilePath: null,
    path: __dirname,
  },
  mutations: {
    changePath(state, payload) {
      state.dropIntoFilePath = payload;
    },
  },
  actions: {
    changeDropIntoFilePath(store, payload) {
      store.commit("changePath", payload);
    },
  },
  modules,
  plugins: [createPersistedState(), createSharedMutations()],
  strict: process.env.NODE_ENV !== "production",
});
