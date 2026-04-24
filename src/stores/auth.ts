import { defineStore } from 'pinia';
import { ref } from 'vue';
import { account, databases, databaseId, usersCollectionId, ID } from '@/includes/appwrite';

export const useAuthStore = defineStore('auth', () => {
  const authModalShow = ref(false);
  const userLoggedIn = ref(false);

  function toggleAuthModal() {
    authModalShow.value = !authModalShow.value;
  }

  async function register(payload: any) {
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
        age: Number(payload.age),
        country: payload.country,
      },
    );

    userLoggedIn.value = true;
  }

  async function login(payload: any) {
    try {
      await account.createEmailPasswordSession(payload.email, payload.password);
    } catch (error) {
      await account.get();
    }

    userLoggedIn.value = true;
  }

  async function init_login() {
    try {
      const user = await account.get();
      if (user) {
        userLoggedIn.value = true;
      }
    } catch (error) {
      console.error('Appwrite init_login Error:', error);
      userLoggedIn.value = false;
    }
  }

  async function signout() {
    try {
      await account.deleteSession('current');
    } catch (e) {
      // Ignore
    }

    userLoggedIn.value = false;
  }

  return {
    authModalShow,
    userLoggedIn,
    toggleAuthModal,
    register,
    login,
    init_login,
    signout
  };
});
