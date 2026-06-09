import DefaultTheme from 'vitepress/theme';
import Playground from './components/Playground.vue';
import HomeLayout from './components/HomeLayout.vue';
import './style.css';

export default {
  ...DefaultTheme,
  Layout: HomeLayout,
  enhanceApp({ app }: { app: { component: (name: string, comp: unknown) => void } }) {
    DefaultTheme.enhanceApp?.({ app } as never);
    app.component('Playground', Playground);
  },
};
