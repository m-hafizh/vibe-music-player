import {
  account, databases, databaseId, usersCollectionId, ID,
} from '@/includes/appwrite';

export default {
  // namespaced: true,
  state: {
    authModalShow: false,
    userLoggedIn: false,
  },
  mutations: {
    toggleAuthModal: (state) => {
      state.authModalShow = !state.authModalShow;
    },
    setUserLoggedIn(state, value) {
      state.userLoggedIn = value;
    },
  },
  actions: {
    async register({ commit }, payload) {
      const user = await account.create(
        ID.unique(),
        payload.email,
        payload.password,
        payload.name,
      );

      await account.createEmailPasswordSession(payload.email, payload.password);

      await databases.createDocument(
        databaseId,
        usersCollectionId,
        user.$id,
        {
          name: payload.name,
          email: payload.email,
          age: Number(payload.age), // ensure integer type
          country: payload.country,
        },
      );

      commit('setUserLoggedIn', true);
    },
    async login({ commit }, payload) {
      try {
        await account.createEmailPasswordSession(payload.email, payload.password);
      } catch (error) {
        // Appwrite throws 401 if a session is already active.
        // If they are secretly already logged in, account.get() will succeed.
        // If account.get() throws, it's genuinely invalid credentials.
        await account.get();
      }

      commit('setUserLoggedIn', true);
    },
    async init_login({ commit }) {
      try {
        const user = await account.get();
        if (user) {
          commit('setUserLoggedIn', true);
        }
      } catch (error) {
        // user is not logged in / session expired
        console.error('Appwrite init_login Error:', error);
        commit('setUserLoggedIn', false);
      }
    },
    async signout({ commit }) {
      try {
        await account.deleteSession('current');
      } catch (e) {
        // Ignore deletion errors if session is already gone
      }

      commit('setUserLoggedIn', false);

      // if (payload.route.meta.requiresAuth) {
      //   payload.router.push({ name: 'home' });
      // }
    },
  },
};
