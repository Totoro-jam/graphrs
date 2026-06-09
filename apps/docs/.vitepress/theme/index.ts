import DefaultTheme from 'vitepress/theme';
import Playground from './components/Playground.vue';
import './style.css';

export default {
  ...DefaultTheme,
  enhanceApp({ app }: { app: { component: (name: string, comp: unknown) => void } }) {
    DefaultTheme.enhanceApp?.({ app } as never);
    app.component('Playground', Playground);
  },
};
