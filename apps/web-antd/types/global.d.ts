declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<any, any, any>;
  export default component;
}

// Terminal 相关组件的具体类型声明
declare module '#/components/terminal/TerminalView.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<any, any, any>;
  export default component;
}

declare module '#/components/terminal/TerminalBody.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<any, any, any>;
  export default component;
}

declare module '#/components/terminal/TerminalHeader.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<any, any, any>;
  export default component;
}

declare module '#/components/terminal/TerminalSearch.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<any, any, any>;
  export default component;
}

declare module '#/components/terminal/TerminalSettingModal.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<any, any, any>;
  export default component;
}

declare module '#/views/demos/terminal/SimpleTerminal.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<any, any, any>;
  export default component;
}
