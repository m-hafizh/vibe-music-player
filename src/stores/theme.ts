import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';

export const useThemeStore = defineStore('theme', () => {

  const storedTheme = localStorage.getItem('theme') as 'dark' | 'light' | 'system' | null;
  const themeMode = ref<'dark' | 'light' | 'system'>(storedTheme || 'system');

  const systemPrefersDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches);

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    systemPrefersDark.value = e.matches;
  });

  const isDarkMode = computed(() => {
    if (themeMode.value === 'system') {
      return systemPrefersDark.value;
    }
    return themeMode.value === 'dark';
  });

  watch([isDarkMode, themeMode], ([isDark, mode]) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', mode);
  }, { immediate: true }); 

  function toggleTheme() {
    if (themeMode.value === 'system') themeMode.value = 'light';
    else if (themeMode.value === 'light') themeMode.value = 'dark';
    else themeMode.value = 'system';
  }

  return { themeMode, isDarkMode, toggleTheme };
});
