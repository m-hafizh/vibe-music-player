import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import VeeValidatePlugin from './includes/validation';
import Icon from './directives/icon';
import './assets/tailwind.css';
import './assets/main.css';
import i18n from './includes/i18n';
import GlobalComponents from './includes/_globals';
import ProgessBar from './includes/progress-bar';
import 'nprogress/nprogress.css';
import { useAuthStore } from './stores/auth';

ProgessBar(router);

let app: ReturnType<typeof createApp> | undefined;

const initApp = async () => {
  const pinia = createPinia();
  const initAppInstance = createApp(App).use(i18n).use(pinia);

  try {
    const authStore = useAuthStore(pinia);
    await authStore.init_login();
  } catch (e) {
    //
  }

  if (!app) {
    app = initAppInstance;

    app.use(router);
    app.use(VeeValidatePlugin);
    app.use(GlobalComponents);
    app.directive('icon', Icon);

    app.mount('#app');
  }
};

initApp();
