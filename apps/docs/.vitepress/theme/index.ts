import DefaultTheme from 'vitepress/theme';
import { Sandbox } from 'vitepress-plugin-sandpack';
import './style.css';

export default {
  ...DefaultTheme,
  enhanceApp(ctx: { app: { component: (name: string, comp: unknown) => void } }) {
    DefaultTheme.enhanceApp?.(ctx as never);
    ctx.app.component('Sandbox', Sandbox);
  },
};
