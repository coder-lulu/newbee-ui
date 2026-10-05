// .vitepress/config/index.mts
import { withPwa } from "file:///opt/code/newbee/ui/node_modules/.pnpm/@vite-pwa+vitepress@1.0.0_vite-plugin-pwa@1.0.2_vite@5.4.14_@types+node@22.17.0_less@4._4019750a7b1f531080e8b85883141964/node_modules/@vite-pwa/vitepress/dist/index.mjs";
import { defineConfigWithTheme } from "file:///opt/code/newbee/ui/node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.35.0_@types+node@22.17.0_async-validator@4.2.5_77e23624a41d4bc1196867ff7ba4a58c/node_modules/vitepress/dist/node/index.js";

// .vitepress/config/en.mts
import { defineConfig } from "file:///opt/code/newbee/ui/node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.35.0_@types+node@22.17.0_async-validator@4.2.5_77e23624a41d4bc1196867ff7ba4a58c/node_modules/vitepress/dist/node/index.js";

// ../package.json
var version = "5.5.7";

// .vitepress/config/en.mts
var en = defineConfig({
  description: "Newbee Admin & Enterprise level management system framework",
  lang: "en-US",
  themeConfig: {
    darkModeSwitchLabel: "Theme",
    darkModeSwitchTitle: "Switch to Dark Mode",
    docFooter: {
      next: "Next Page",
      prev: "Previous Page"
    },
    editLink: {
      pattern: "https://github.com/vbenjs/vue-vben-admin/edit/main/docs/src/:path",
      text: "Edit this page on GitHub"
    },
    footer: {
      copyright: `Copyright \xA9 2025-${(/* @__PURE__ */ new Date()).getFullYear()} Newbee`,
      message: "Released under the MIT License."
    },
    langMenuLabel: "Language",
    lastUpdated: {
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium"
      },
      text: "Last updated on"
    },
    lightModeSwitchTitle: "Switch to Light Mode",
    nav: nav(),
    outline: {
      label: "Navigate"
    },
    returnToTopLabel: "Back to top",
    sidebar: {
      "/en/commercial/": {
        base: "/en/commercial/",
        items: sidebarCommercial()
      },
      "/en/guide/": { base: "/en/guide/", items: sidebarGuide() }
    }
  }
});
function sidebarGuide() {
  return [
    {
      collapsed: false,
      text: "Introduction",
      items: [
        {
          link: "introduction/vben",
          text: "About Newbee Admin"
        },
        {
          link: "introduction/why",
          text: "Why Choose Us?"
        },
        { link: "introduction/quick-start", text: "Quick Start" },
        { link: "introduction/thin", text: "Lite Version" }
      ]
    },
    {
      text: "Basics",
      items: [
        { link: "essentials/concept", text: "Basic Concepts" },
        { link: "essentials/development", text: "Local Development" },
        { link: "essentials/route", text: "Routing and Menu" },
        { link: "essentials/settings", text: "Configuration" },
        { link: "essentials/icons", text: "Icons" },
        { link: "essentials/styles", text: "Styles" },
        { link: "essentials/external-module", text: "External Modules" },
        { link: "essentials/build", text: "Build and Deployment" },
        { link: "essentials/server", text: "Server Interaction and Data Mock" }
      ]
    },
    {
      text: "Advanced",
      items: [
        { link: "in-depth/login", text: "Login" },
        { link: "in-depth/theme", text: "Theme" },
        { link: "in-depth/access", text: "Access Control" },
        { link: "in-depth/locale", text: "Internationalization" },
        { link: "in-depth/features", text: "Common Features" },
        { link: "in-depth/check-updates", text: "Check Updates" },
        { link: "in-depth/loading", text: "Global Loading" },
        { link: "in-depth/ui-framework", text: "UI Framework Switching" }
      ]
    },
    {
      text: "Engineering",
      items: [
        { link: "project/standard", text: "Standards" },
        { link: "project/cli", text: "CLI" },
        { link: "project/dir", text: "Directory Explanation" },
        { link: "project/test", text: "Unit Testing" },
        { link: "project/tailwindcss", text: "Tailwind CSS" },
        { link: "project/changeset", text: "Changeset" },
        { link: "project/vite", text: "Vite Config" }
      ]
    },
    {
      text: "Others",
      items: [
        { link: "other/project-update", text: "Project Update" },
        { link: "other/remove-code", text: "Remove Code" },
        { link: "other/faq", text: "FAQ" }
      ]
    }
  ];
}
function sidebarCommercial() {
  return [
    {
      link: "community",
      text: "Community"
    },
    {
      link: "technical-support",
      text: "Technical-support"
    },
    {
      link: "customized",
      text: "Customized"
    }
  ];
}
function nav() {
  return [
    {
      activeMatch: "^/en/(guide|components)/",
      text: "Doc",
      items: [
        {
          activeMatch: "^/en/guide/",
          link: "/en/guide/introduction/vben",
          text: "Guide"
        },
        // {
        //   activeMatch: '^/en/components/',
        //   link: '/en/components/introduction',
        //   text: 'Components',
        // },
        {
          text: "Historical Versions",
          items: [
            {
              link: "https://doc.vvbin.cn",
              text: "2.x Version Documentation"
            }
          ]
        }
      ]
    },
    {
      text: "Demo",
      items: [
        {
          text: "Newbee Admin",
          items: [
            {
              link: "https://www.vben.pro",
              text: "Demo Version"
            },
            {
              link: "https://ant.vben.pro",
              text: "Ant Design Vue Version"
            },
            {
              link: "https://naive.vben.pro",
              text: "Naive Version"
            },
            {
              link: "https://ele.vben.pro",
              text: "Element Plus Version"
            }
          ]
        },
        {
          text: "Others",
          items: [
            {
              link: "https://vben.vvbin.cn",
              text: "Newbee Admin 2.x"
            }
          ]
        }
      ]
    },
    {
      text: version,
      items: [
        {
          link: "https://github.com/vbenjs/vue-vben-admin/releases",
          text: "Changelog"
        },
        {
          link: "https://github.com/orgs/vbenjs/projects/5",
          text: "Roadmap"
        },
        {
          link: "https://github.com/vbenjs/vue-vben-admin/blob/main/.github/contributing.md",
          text: "Contribution"
        }
      ]
    },
    {
      link: "/commercial/technical-support",
      text: "\u{1F984} Tech Support"
    },
    {
      link: "/sponsor/personal",
      text: "\u2728 Sponsor"
    },
    {
      link: "/commercial/community",
      text: "\u{1F468}\u200D\u{1F466}\u200D\u{1F466} Community"
    }
    // {
    //   link: '/friend-links/',
    //   text: '🤝 Friend Links',
    // },
  ];
}

// .vitepress/config/shared.mts
import { resolve } from "node:path";
import {
  viteArchiverPlugin,
  viteVxeTableImportsPlugin
} from "file:///opt/code/newbee/ui/internal/vite-config/dist/index.mjs";
import {
  GitChangelog,
  GitChangelogMarkdownSection
} from "file:///opt/code/newbee/ui/node_modules/.pnpm/@nolebase+vitepress-plugin-git-changelog@2.18.1_vitepress@1.6.4_@algolia+client-search@_be4a6218e51adaff5882c2d3dd699b6e/node_modules/@nolebase/vitepress-plugin-git-changelog/dist/vite/index.mjs";
import tailwind from "file:///opt/code/newbee/ui/node_modules/.pnpm/tailwindcss@3.4.17/node_modules/tailwindcss/lib/index.js";
import { defineConfig as defineConfig3, postcssIsolateStyles } from "file:///opt/code/newbee/ui/node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.35.0_@types+node@22.17.0_async-validator@4.2.5_77e23624a41d4bc1196867ff7ba4a58c/node_modules/vitepress/dist/node/index.js";
import {
  groupIconMdPlugin,
  groupIconVitePlugin
} from "file:///opt/code/newbee/ui/node_modules/.pnpm/vitepress-plugin-group-icons@1.6.1_markdown-it@14.1.0_vite@5.4.14_@types+node@22.17.0_l_296a87f737e5452dd38f49575804bd1b/node_modules/vitepress-plugin-group-icons/dist/index.js";

// .vitepress/config/plugins/demo-preview.ts
import crypto from "node:crypto";
import { readdirSync } from "node:fs";
import { join } from "node:path";
var rawPathRegexp = (
  // eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/strict
  /^(.+?(?:\.([\da-z]+))?)(#[\w-]+)?(?: ?{(\d+(?:[,-]\d+)*)? ?(\S+)?})? ?(?:\[(.+)])?$/
);
function rawPathToToken(rawPath) {
  const [
    filepath = "",
    extension = "",
    region = "",
    lines = "",
    lang = "",
    rawTitle = ""
  ] = (rawPathRegexp.exec(rawPath) || []).slice(1);
  const title = rawTitle || filepath.split("/").pop() || "";
  return { extension, filepath, lang, lines, region, title };
}
var demoPreviewPlugin = (md) => {
  md.core.ruler.after("inline", "demo-preview", (state) => {
    const insertComponentImport = (importString) => {
      const index = state.tokens.findIndex(
        (i) => i.type === "html_block" && i.content.match(/<script setup>/g)
      );
      if (index === -1) {
        const importComponent = new state.Token("html_block", "", 0);
        importComponent.content = `<script setup>
${importString}
</script>
`;
        state.tokens.splice(0, 0, importComponent);
      } else {
        if (state.tokens[index]) {
          const content = state.tokens[index].content;
          state.tokens[index].content = content.replace(
            "</script>",
            `${importString}
</script>`
          );
        }
      }
    };
    const regex = /<DemoPreview[^>]*\sdir="([^"]*)"/g;
    state.src = state.src.replaceAll(regex, (_match, dir) => {
      const componentDir = join(process.cwd(), "src", dir).replaceAll(
        "\\",
        "/"
      );
      let childFiles = [];
      let dirExists = true;
      try {
        childFiles = readdirSync(componentDir, {
          encoding: "utf8",
          recursive: false,
          withFileTypes: false
        }) || [];
      } catch {
        dirExists = false;
      }
      if (!dirExists) {
        return "";
      }
      const uniqueWord = generateContentHash(componentDir);
      const ComponentName = `DemoComponent_${uniqueWord}`;
      insertComponentImport(
        `import ${ComponentName} from '${componentDir}/index.vue'`
      );
      const { path: _path } = state.env;
      const index = state.tokens.findIndex((i) => i.content.match(regex));
      if (!state.tokens[index]) {
        return "";
      }
      const firstString = "index.vue";
      childFiles = childFiles.sort((a, b) => {
        if (a === firstString) return -1;
        if (b === firstString) return 1;
        return a.localeCompare(b, "en", { sensitivity: "base" });
      });
      state.tokens[index].content = `<DemoPreview files="${encodeURIComponent(JSON.stringify(childFiles))}" ><${ComponentName}/>
        `;
      const _dummyToken = new state.Token("", "", 0);
      const tokenArray = [];
      childFiles.forEach((filename) => {
        const templateStart = new state.Token("html_inline", "", 0);
        templateStart.content = `<template #${filename}>`;
        tokenArray.push(templateStart);
        const resolvedPath = join(componentDir, filename);
        const { extension, filepath, lang, lines, title } = rawPathToToken(resolvedPath);
        const token = new state.Token("fence", "code", 0);
        token.info = `${lang || extension}${lines ? `{${lines}}` : ""}${title ? `[${title}]` : ""}`;
        token.content = `<<< ${filepath}`;
        token.src = [resolvedPath];
        tokenArray.push(token);
        const templateEnd = new state.Token("html_inline", "", 0);
        templateEnd.content = "</template>";
        tokenArray.push(templateEnd);
      });
      const endTag = new state.Token("html_inline", "", 0);
      endTag.content = "</DemoPreview>";
      tokenArray.push(endTag);
      state.tokens.splice(index + 1, 0, ...tokenArray);
      return "";
    });
  });
};
function generateContentHash(input, length = 10) {
  const hash = crypto.createHash("sha256").update(input).digest("hex");
  return Number.parseInt(hash, 16).toString(36).slice(0, length);
}

// .vitepress/config/zh.mts
import { defineConfig as defineConfig2 } from "file:///opt/code/newbee/ui/node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.35.0_@types+node@22.17.0_async-validator@4.2.5_77e23624a41d4bc1196867ff7ba4a58c/node_modules/vitepress/dist/node/index.js";
var zh = defineConfig2({
  description: "Newbee Admin & \u4F01\u4E1A\u7EA7\u7BA1\u7406\u7CFB\u7EDF\u6846\u67B6",
  lang: "zh-Hans",
  themeConfig: {
    darkModeSwitchLabel: "\u4E3B\u9898",
    darkModeSwitchTitle: "\u5207\u6362\u5230\u6DF1\u8272\u6A21\u5F0F",
    docFooter: {
      next: "\u4E0B\u4E00\u9875",
      prev: "\u4E0A\u4E00\u9875"
    },
    editLink: {
      pattern: "https://github.com/vbenjs/vue-vben-admin/edit/main/docs/src/:path",
      text: "\u5728 GitHub \u4E0A\u7F16\u8F91\u6B64\u9875\u9762"
    },
    footer: {
      copyright: `Copyright \xA9 2025-${(/* @__PURE__ */ new Date()).getFullYear()} Newbee`,
      message: "\u57FA\u4E8E MIT \u8BB8\u53EF\u53D1\u5E03."
    },
    langMenuLabel: "\u591A\u8BED\u8A00",
    lastUpdated: {
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium"
      },
      text: "\u6700\u540E\u66F4\u65B0\u4E8E"
    },
    lightModeSwitchTitle: "\u5207\u6362\u5230\u6D45\u8272\u6A21\u5F0F",
    nav: nav2(),
    outline: {
      label: "\u9875\u9762\u5BFC\u822A"
    },
    returnToTopLabel: "\u56DE\u5230\u9876\u90E8",
    sidebar: {
      "/commercial/": { base: "/commercial/", items: sidebarCommercial2() },
      "/components/": { base: "/components/", items: sidebarComponents() },
      "/guide/": { base: "/guide/", items: sidebarGuide2() }
    },
    sidebarMenuLabel: "\u83DC\u5355"
  }
});
function sidebarGuide2() {
  return [
    {
      collapsed: false,
      text: "\u7B80\u4ECB",
      items: [
        {
          link: "introduction/vben",
          text: "\u5173\u4E8E Newbee Admin"
        },
        {
          link: "introduction/why",
          text: "\u4E3A\u4EC0\u4E48\u9009\u62E9\u6211\u4EEC?"
        },
        { link: "introduction/quick-start", text: "\u5FEB\u901F\u5F00\u59CB" },
        { link: "introduction/thin", text: "\u7CBE\u7B80\u7248\u672C" },
        {
          base: "/",
          link: "components/introduction",
          text: "\u7EC4\u4EF6\u6587\u6863"
        }
      ]
    },
    {
      text: "\u57FA\u7840",
      items: [
        { link: "essentials/concept", text: "\u57FA\u7840\u6982\u5FF5" },
        { link: "essentials/development", text: "\u672C\u5730\u5F00\u53D1" },
        { link: "essentials/route", text: "\u8DEF\u7531\u548C\u83DC\u5355" },
        { link: "essentials/settings", text: "\u914D\u7F6E" },
        { link: "essentials/icons", text: "\u56FE\u6807" },
        { link: "essentials/styles", text: "\u6837\u5F0F" },
        { link: "essentials/external-module", text: "\u5916\u90E8\u6A21\u5757" },
        { link: "essentials/build", text: "\u6784\u5EFA\u4E0E\u90E8\u7F72" },
        { link: "essentials/server", text: "\u670D\u52A1\u7AEF\u4EA4\u4E92\u4E0E\u6570\u636EMock" }
      ]
    },
    {
      text: "\u6DF1\u5165",
      items: [
        { link: "in-depth/login", text: "\u767B\u5F55" },
        // { link: 'in-depth/layout', text: '布局' },
        { link: "in-depth/theme", text: "\u4E3B\u9898" },
        { link: "in-depth/access", text: "\u6743\u9650" },
        { link: "in-depth/locale", text: "\u56FD\u9645\u5316" },
        { link: "in-depth/features", text: "\u5E38\u7528\u529F\u80FD" },
        { link: "in-depth/check-updates", text: "\u68C0\u67E5\u66F4\u65B0" },
        { link: "in-depth/loading", text: "\u5168\u5C40loading" },
        { link: "in-depth/ui-framework", text: "\u7EC4\u4EF6\u5E93\u5207\u6362" }
      ]
    },
    {
      text: "\u5DE5\u7A0B",
      items: [
        { link: "project/standard", text: "\u89C4\u8303" },
        { link: "project/cli", text: "CLI" },
        { link: "project/dir", text: "\u76EE\u5F55\u8BF4\u660E" },
        { link: "project/test", text: "\u5355\u5143\u6D4B\u8BD5" },
        { link: "project/tailwindcss", text: "Tailwind CSS" },
        { link: "project/changeset", text: "Changeset" },
        { link: "project/vite", text: "Vite Config" }
      ]
    },
    {
      text: "\u5176\u4ED6",
      items: [
        { link: "other/project-update", text: "\u9879\u76EE\u66F4\u65B0" },
        { link: "other/remove-code", text: "\u79FB\u9664\u4EE3\u7801" },
        { link: "other/faq", text: "\u5E38\u89C1\u95EE\u9898" }
      ]
    }
  ];
}
function sidebarCommercial2() {
  return [
    {
      link: "community",
      text: "\u4EA4\u6D41\u7FA4"
    },
    {
      link: "technical-support",
      text: "\u6280\u672F\u652F\u6301"
    },
    {
      link: "customized",
      text: "\u5B9A\u5236\u5F00\u53D1"
    }
  ];
}
function sidebarComponents() {
  return [
    {
      text: "\u7EC4\u4EF6",
      items: [
        {
          link: "introduction",
          text: "\u4ECB\u7ECD"
        }
      ]
    },
    {
      collapsed: false,
      text: "\u5E03\u5C40\u7EC4\u4EF6",
      items: [
        {
          link: "layout-ui/page",
          text: "Page \u9875\u9762"
        }
      ]
    },
    {
      collapsed: false,
      text: "\u901A\u7528\u7EC4\u4EF6",
      items: [
        {
          link: "common-ui/vben-api-component",
          text: "ApiComponent Api\u7EC4\u4EF6\u5305\u88C5\u5668"
        },
        {
          link: "common-ui/vben-alert",
          text: "Alert \u8F7B\u91CF\u63D0\u793A\u6846"
        },
        {
          link: "common-ui/vben-modal",
          text: "Modal \u6A21\u6001\u6846"
        },
        {
          link: "common-ui/vben-drawer",
          text: "Drawer \u62BD\u5C49"
        },
        {
          link: "common-ui/vben-form",
          text: "Form \u8868\u5355"
        },
        {
          link: "common-ui/vben-vxe-table",
          text: "Vxe Table \u8868\u683C"
        },
        {
          link: "common-ui/vben-count-to-animator",
          text: "CountToAnimator \u6570\u5B57\u52A8\u753B"
        },
        {
          link: "common-ui/vben-ellipsis-text",
          text: "EllipsisText \u7701\u7565\u6587\u672C"
        }
      ]
    }
  ];
}
function nav2() {
  return [];
}
var search = {
  root: {
    placeholder: "\u641C\u7D22\u6587\u6863",
    translations: {
      button: {
        buttonAriaLabel: "\u641C\u7D22\u6587\u6863",
        buttonText: "\u641C\u7D22\u6587\u6863"
      },
      modal: {
        errorScreen: {
          helpText: "\u4F60\u53EF\u80FD\u9700\u8981\u68C0\u67E5\u4F60\u7684\u7F51\u7EDC\u8FDE\u63A5",
          titleText: "\u65E0\u6CD5\u83B7\u53D6\u7ED3\u679C"
        },
        footer: {
          closeText: "\u5173\u95ED",
          navigateText: "\u5207\u6362",
          searchByText: "\u641C\u7D22\u63D0\u4F9B\u8005",
          selectText: "\u9009\u62E9"
        },
        noResultsScreen: {
          noResultsText: "\u65E0\u6CD5\u627E\u5230\u76F8\u5173\u7ED3\u679C",
          reportMissingResultsLinkText: "\u70B9\u51FB\u53CD\u9988",
          reportMissingResultsText: "\u4F60\u8BA4\u4E3A\u8BE5\u67E5\u8BE2\u5E94\u8BE5\u6709\u7ED3\u679C\uFF1F",
          suggestedQueryText: "\u4F60\u53EF\u4EE5\u5C1D\u8BD5\u67E5\u8BE2"
        },
        searchBox: {
          cancelButtonAriaLabel: "\u53D6\u6D88",
          cancelButtonText: "\u53D6\u6D88",
          resetButtonAriaLabel: "\u6E05\u9664\u67E5\u8BE2\u6761\u4EF6",
          resetButtonTitle: "\u6E05\u9664\u67E5\u8BE2\u6761\u4EF6"
        },
        startScreen: {
          favoriteSearchesTitle: "\u6536\u85CF",
          noRecentSearchesText: "\u6CA1\u6709\u641C\u7D22\u5386\u53F2",
          recentSearchesTitle: "\u641C\u7D22\u5386\u53F2",
          removeFavoriteSearchButtonTitle: "\u4ECE\u6536\u85CF\u4E2D\u79FB\u9664",
          removeRecentSearchButtonTitle: "\u4ECE\u641C\u7D22\u5386\u53F2\u4E2D\u79FB\u9664",
          saveRecentSearchButtonTitle: "\u4FDD\u5B58\u81F3\u641C\u7D22\u5386\u53F2"
        }
      }
    }
  }
};

// .vitepress/config/shared.mts
var shared = defineConfig3({
  appearance: "dark",
  head: head(),
  markdown: {
    preConfig(md) {
      md.use(demoPreviewPlugin);
      md.use(groupIconMdPlugin);
    }
  },
  pwa: pwa(),
  srcDir: "src",
  themeConfig: {
    i18nRouting: true,
    logo: "https://unpkg.com/@vbenjs/static-source@0.1.7/source/logo-v1.webp",
    search: {
      options: {
        locales: {
          ...search
        }
      },
      provider: "local"
    },
    siteTitle: "Newbee Admin",
    socialLinks: [
      { icon: "github", link: "https://github.com/coder-lulu/newbee-ui" }
    ]
  },
  title: "Newbee Admin",
  vite: {
    build: {
      chunkSizeWarningLimit: Infinity,
      minify: "terser"
    },
    css: {
      postcss: {
        plugins: [
          tailwind(),
          postcssIsolateStyles({ includeFiles: [/vp-doc\.css/] })
        ]
      },
      preprocessorOptions: {
        scss: {
          api: "modern"
        }
      }
    },
    json: {
      stringify: true
    },
    plugins: [
      GitChangelog({
        mapAuthors: [
          {
            mapByNameAliases: ["Vben"],
            name: "vben",
            username: "anncwb"
          },
          {
            name: "vince",
            username: "vince292007"
          },
          {
            name: "Li Kui",
            username: "likui628"
          }
        ],
        repoURL: () => "https://github.com/vbenjs/vue-vben-admin"
      }),
      GitChangelogMarkdownSection(),
      viteArchiverPlugin({ outputDir: ".vitepress" }),
      groupIconVitePlugin(),
      await viteVxeTableImportsPlugin()
    ],
    server: {
      fs: {
        allow: ["../.."]
      },
      host: true,
      port: 6173
    },
    ssr: {
      external: ["@vue/repl"]
    }
  }
});
function head() {
  return [
    ["meta", { content: "Newbee Team", name: "author" }],
    [
      "meta",
      {
        content: "newbee, vitejs, vite, shacdn-ui, vue",
        name: "keywords"
      }
    ],
    ["link", { href: "/favicon.ico", rel: "icon", type: "image/svg+xml" }],
    [
      "meta",
      {
        content: "width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no",
        name: "viewport"
      }
    ],
    ["meta", { content: "newbee admin docs", name: "keywords" }],
    ["link", { href: "/favicon.ico", rel: "icon" }]
    // [
    //   'script',
    //   {
    //     src: 'https://cdn.tailwindcss.com',
    //   },
    // ],
  ];
}
function pwa() {
  return {
    includeManifestIcons: false,
    manifest: {
      description: "Newbee Admin is a modern admin dashboard template based on Vue 3. ",
      icons: [
        {
          sizes: "192x192",
          src: "https://unpkg.com/@vbenjs/static-source@0.1.7/source/pwa-icon-192.png",
          type: "image/png"
        },
        {
          sizes: "512x512",
          src: "https://unpkg.com/@vbenjs/static-source@0.1.7/source/pwa-icon-512.png",
          type: "image/png"
        }
      ],
      id: "/",
      name: "Newbee Admin Doc",
      short_name: "newbee_admin_doc",
      theme_color: "#ffffff"
    },
    outDir: resolve(process.cwd(), ".vitepress/dist"),
    registerType: "autoUpdate",
    workbox: {
      globPatterns: ["**/*.{css,js,html,svg,png,ico,txt,woff2}"],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
    }
  };
}

// .vitepress/config/index.mts
var index_default = withPwa(
  defineConfigWithTheme({
    ...shared,
    locales: {
      en: {
        label: "English",
        lang: "en",
        link: "/en/",
        ...en
      },
      root: {
        label: "\u7B80\u4F53\u4E2D\u6587",
        lang: "zh-CN",
        ...zh
      }
    }
  })
);
export {
  index_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLnZpdGVwcmVzcy9jb25maWcvaW5kZXgubXRzIiwgIi52aXRlcHJlc3MvY29uZmlnL2VuLm10cyIsICIuLi9wYWNrYWdlLmpzb24iLCAiLnZpdGVwcmVzcy9jb25maWcvc2hhcmVkLm10cyIsICIudml0ZXByZXNzL2NvbmZpZy9wbHVnaW5zL2RlbW8tcHJldmlldy50cyIsICIudml0ZXByZXNzL2NvbmZpZy96aC5tdHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvb3B0L2NvZGUvbmV3YmVlL3VpL2RvY3MvLnZpdGVwcmVzcy9jb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9vcHQvY29kZS9uZXdiZWUvdWkvZG9jcy8udml0ZXByZXNzL2NvbmZpZy9pbmRleC5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL29wdC9jb2RlL25ld2JlZS91aS9kb2NzLy52aXRlcHJlc3MvY29uZmlnL2luZGV4Lm10c1wiO2ltcG9ydCB7IHdpdGhQd2EgfSBmcm9tICdAdml0ZS1wd2Evdml0ZXByZXNzJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZ1dpdGhUaGVtZSB9IGZyb20gJ3ZpdGVwcmVzcyc7XG5cbmltcG9ydCB7IGVuIH0gZnJvbSAnLi9lbi5tdHMnO1xuaW1wb3J0IHsgc2hhcmVkIH0gZnJvbSAnLi9zaGFyZWQubXRzJztcbmltcG9ydCB7IHpoIH0gZnJvbSAnLi96aC5tdHMnO1xuXG5leHBvcnQgZGVmYXVsdCB3aXRoUHdhKFxuICBkZWZpbmVDb25maWdXaXRoVGhlbWUoe1xuICAgIC4uLnNoYXJlZCxcbiAgICBsb2NhbGVzOiB7XG4gICAgICBlbjoge1xuICAgICAgICBsYWJlbDogJ0VuZ2xpc2gnLFxuICAgICAgICBsYW5nOiAnZW4nLFxuICAgICAgICBsaW5rOiAnL2VuLycsXG4gICAgICAgIC4uLmVuLFxuICAgICAgfSxcbiAgICAgIHJvb3Q6IHtcbiAgICAgICAgbGFiZWw6ICdcdTdCODBcdTRGNTNcdTRFMkRcdTY1ODcnLFxuICAgICAgICBsYW5nOiAnemgtQ04nLFxuICAgICAgICAuLi56aCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSksXG4pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvb3B0L2NvZGUvbmV3YmVlL3VpL2RvY3MvLnZpdGVwcmVzcy9jb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9vcHQvY29kZS9uZXdiZWUvdWkvZG9jcy8udml0ZXByZXNzL2NvbmZpZy9lbi5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL29wdC9jb2RlL25ld2JlZS91aS9kb2NzLy52aXRlcHJlc3MvY29uZmlnL2VuLm10c1wiO2ltcG9ydCB0eXBlIHsgRGVmYXVsdFRoZW1lIH0gZnJvbSAndml0ZXByZXNzJztcblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXByZXNzJztcblxuaW1wb3J0IHsgdmVyc2lvbiB9IGZyb20gJy4uLy4uLy4uL3BhY2thZ2UuanNvbic7XG5cbmV4cG9ydCBjb25zdCBlbiA9IGRlZmluZUNvbmZpZyh7XG4gIGRlc2NyaXB0aW9uOiAnTmV3YmVlIEFkbWluICYgRW50ZXJwcmlzZSBsZXZlbCBtYW5hZ2VtZW50IHN5c3RlbSBmcmFtZXdvcmsnLFxuICBsYW5nOiAnZW4tVVMnLFxuICB0aGVtZUNvbmZpZzoge1xuICAgIGRhcmtNb2RlU3dpdGNoTGFiZWw6ICdUaGVtZScsXG4gICAgZGFya01vZGVTd2l0Y2hUaXRsZTogJ1N3aXRjaCB0byBEYXJrIE1vZGUnLFxuICAgIGRvY0Zvb3Rlcjoge1xuICAgICAgbmV4dDogJ05leHQgUGFnZScsXG4gICAgICBwcmV2OiAnUHJldmlvdXMgUGFnZScsXG4gICAgfSxcbiAgICBlZGl0TGluazoge1xuICAgICAgcGF0dGVybjpcbiAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS92YmVuanMvdnVlLXZiZW4tYWRtaW4vZWRpdC9tYWluL2RvY3Mvc3JjLzpwYXRoJyxcbiAgICAgIHRleHQ6ICdFZGl0IHRoaXMgcGFnZSBvbiBHaXRIdWInLFxuICAgIH0sXG4gICAgZm9vdGVyOiB7XG4gICAgICBjb3B5cmlnaHQ6IGBDb3B5cmlnaHQgXHUwMEE5IDIwMjUtJHtuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCl9IE5ld2JlZWAsXG4gICAgICBtZXNzYWdlOiAnUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLicsXG4gICAgfSxcbiAgICBsYW5nTWVudUxhYmVsOiAnTGFuZ3VhZ2UnLFxuICAgIGxhc3RVcGRhdGVkOiB7XG4gICAgICBmb3JtYXRPcHRpb25zOiB7ICBcbiAgICAgICAgZGF0ZVN0eWxlOiAnc2hvcnQnLFxuICAgICAgICB0aW1lU3R5bGU6ICdtZWRpdW0nLFxuICAgICAgfSxcbiAgICAgIHRleHQ6ICdMYXN0IHVwZGF0ZWQgb24nLFxuICAgIH0sXG4gICAgbGlnaHRNb2RlU3dpdGNoVGl0bGU6ICdTd2l0Y2ggdG8gTGlnaHQgTW9kZScsXG4gICAgbmF2OiBuYXYoKSxcbiAgICBvdXRsaW5lOiB7XG4gICAgICBsYWJlbDogJ05hdmlnYXRlJyxcbiAgICB9LFxuICAgIHJldHVyblRvVG9wTGFiZWw6ICdCYWNrIHRvIHRvcCcsXG4gICAgc2lkZWJhcjoge1xuICAgICAgJy9lbi9jb21tZXJjaWFsLyc6IHtcbiAgICAgICAgYmFzZTogJy9lbi9jb21tZXJjaWFsLycsXG4gICAgICAgIGl0ZW1zOiBzaWRlYmFyQ29tbWVyY2lhbCgpLFxuICAgICAgfSxcbiAgICAgICcvZW4vZ3VpZGUvJzogeyBiYXNlOiAnL2VuL2d1aWRlLycsIGl0ZW1zOiBzaWRlYmFyR3VpZGUoKSB9LFxuICAgIH0sXG4gIH0sXG59KTtcblxuZnVuY3Rpb24gc2lkZWJhckd1aWRlKCk6IERlZmF1bHRUaGVtZS5TaWRlYmFySXRlbVtdIHtcbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgdGV4dDogJ0ludHJvZHVjdGlvbicsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgbGluazogJ2ludHJvZHVjdGlvbi92YmVuJyxcbiAgICAgICAgICB0ZXh0OiAnQWJvdXQgTmV3YmVlIEFkbWluJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxpbms6ICdpbnRyb2R1Y3Rpb24vd2h5JyxcbiAgICAgICAgICB0ZXh0OiAnV2h5IENob29zZSBVcz8nLFxuICAgICAgICB9LFxuICAgICAgICB7IGxpbms6ICdpbnRyb2R1Y3Rpb24vcXVpY2stc3RhcnQnLCB0ZXh0OiAnUXVpY2sgU3RhcnQnIH0sXG4gICAgICAgIHsgbGluazogJ2ludHJvZHVjdGlvbi90aGluJywgdGV4dDogJ0xpdGUgVmVyc2lvbicgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiAnQmFzaWNzJyxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHsgbGluazogJ2Vzc2VudGlhbHMvY29uY2VwdCcsIHRleHQ6ICdCYXNpYyBDb25jZXB0cycgfSxcbiAgICAgICAgeyBsaW5rOiAnZXNzZW50aWFscy9kZXZlbG9wbWVudCcsIHRleHQ6ICdMb2NhbCBEZXZlbG9wbWVudCcgfSxcbiAgICAgICAgeyBsaW5rOiAnZXNzZW50aWFscy9yb3V0ZScsIHRleHQ6ICdSb3V0aW5nIGFuZCBNZW51JyB9LFxuICAgICAgICB7IGxpbms6ICdlc3NlbnRpYWxzL3NldHRpbmdzJywgdGV4dDogJ0NvbmZpZ3VyYXRpb24nIH0sXG4gICAgICAgIHsgbGluazogJ2Vzc2VudGlhbHMvaWNvbnMnLCB0ZXh0OiAnSWNvbnMnIH0sXG4gICAgICAgIHsgbGluazogJ2Vzc2VudGlhbHMvc3R5bGVzJywgdGV4dDogJ1N0eWxlcycgfSxcbiAgICAgICAgeyBsaW5rOiAnZXNzZW50aWFscy9leHRlcm5hbC1tb2R1bGUnLCB0ZXh0OiAnRXh0ZXJuYWwgTW9kdWxlcycgfSxcbiAgICAgICAgeyBsaW5rOiAnZXNzZW50aWFscy9idWlsZCcsIHRleHQ6ICdCdWlsZCBhbmQgRGVwbG95bWVudCcgfSxcbiAgICAgICAgeyBsaW5rOiAnZXNzZW50aWFscy9zZXJ2ZXInLCB0ZXh0OiAnU2VydmVyIEludGVyYWN0aW9uIGFuZCBEYXRhIE1vY2snIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogJ0FkdmFuY2VkJyxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHsgbGluazogJ2luLWRlcHRoL2xvZ2luJywgdGV4dDogJ0xvZ2luJyB9LFxuICAgICAgICB7IGxpbms6ICdpbi1kZXB0aC90aGVtZScsIHRleHQ6ICdUaGVtZScgfSxcbiAgICAgICAgeyBsaW5rOiAnaW4tZGVwdGgvYWNjZXNzJywgdGV4dDogJ0FjY2VzcyBDb250cm9sJyB9LFxuICAgICAgICB7IGxpbms6ICdpbi1kZXB0aC9sb2NhbGUnLCB0ZXh0OiAnSW50ZXJuYXRpb25hbGl6YXRpb24nIH0sXG4gICAgICAgIHsgbGluazogJ2luLWRlcHRoL2ZlYXR1cmVzJywgdGV4dDogJ0NvbW1vbiBGZWF0dXJlcycgfSxcbiAgICAgICAgeyBsaW5rOiAnaW4tZGVwdGgvY2hlY2stdXBkYXRlcycsIHRleHQ6ICdDaGVjayBVcGRhdGVzJyB9LFxuICAgICAgICB7IGxpbms6ICdpbi1kZXB0aC9sb2FkaW5nJywgdGV4dDogJ0dsb2JhbCBMb2FkaW5nJyB9LFxuICAgICAgICB7IGxpbms6ICdpbi1kZXB0aC91aS1mcmFtZXdvcmsnLCB0ZXh0OiAnVUkgRnJhbWV3b3JrIFN3aXRjaGluZycgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiAnRW5naW5lZXJpbmcnLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyBsaW5rOiAncHJvamVjdC9zdGFuZGFyZCcsIHRleHQ6ICdTdGFuZGFyZHMnIH0sXG4gICAgICAgIHsgbGluazogJ3Byb2plY3QvY2xpJywgdGV4dDogJ0NMSScgfSxcbiAgICAgICAgeyBsaW5rOiAncHJvamVjdC9kaXInLCB0ZXh0OiAnRGlyZWN0b3J5IEV4cGxhbmF0aW9uJyB9LFxuICAgICAgICB7IGxpbms6ICdwcm9qZWN0L3Rlc3QnLCB0ZXh0OiAnVW5pdCBUZXN0aW5nJyB9LFxuICAgICAgICB7IGxpbms6ICdwcm9qZWN0L3RhaWx3aW5kY3NzJywgdGV4dDogJ1RhaWx3aW5kIENTUycgfSxcbiAgICAgICAgeyBsaW5rOiAncHJvamVjdC9jaGFuZ2VzZXQnLCB0ZXh0OiAnQ2hhbmdlc2V0JyB9LFxuICAgICAgICB7IGxpbms6ICdwcm9qZWN0L3ZpdGUnLCB0ZXh0OiAnVml0ZSBDb25maWcnIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogJ090aGVycycsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IGxpbms6ICdvdGhlci9wcm9qZWN0LXVwZGF0ZScsIHRleHQ6ICdQcm9qZWN0IFVwZGF0ZScgfSxcbiAgICAgICAgeyBsaW5rOiAnb3RoZXIvcmVtb3ZlLWNvZGUnLCB0ZXh0OiAnUmVtb3ZlIENvZGUnIH0sXG4gICAgICAgIHsgbGluazogJ290aGVyL2ZhcScsIHRleHQ6ICdGQVEnIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF07XG59XG5cbmZ1bmN0aW9uIHNpZGViYXJDb21tZXJjaWFsKCk6IERlZmF1bHRUaGVtZS5TaWRlYmFySXRlbVtdIHtcbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBsaW5rOiAnY29tbXVuaXR5JyxcbiAgICAgIHRleHQ6ICdDb21tdW5pdHknLFxuICAgIH0sXG4gICAge1xuICAgICAgbGluazogJ3RlY2huaWNhbC1zdXBwb3J0JyxcbiAgICAgIHRleHQ6ICdUZWNobmljYWwtc3VwcG9ydCcsXG4gICAgfSxcbiAgICB7XG4gICAgICBsaW5rOiAnY3VzdG9taXplZCcsXG4gICAgICB0ZXh0OiAnQ3VzdG9taXplZCcsXG4gICAgfSxcbiAgXTtcbn1cblxuZnVuY3Rpb24gbmF2KCk6IERlZmF1bHRUaGVtZS5OYXZJdGVtW10ge1xuICByZXR1cm4gW1xuICAgIHtcbiAgICAgIGFjdGl2ZU1hdGNoOiAnXi9lbi8oZ3VpZGV8Y29tcG9uZW50cykvJyxcbiAgICAgIHRleHQ6ICdEb2MnLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGFjdGl2ZU1hdGNoOiAnXi9lbi9ndWlkZS8nLFxuICAgICAgICAgIGxpbms6ICcvZW4vZ3VpZGUvaW50cm9kdWN0aW9uL3ZiZW4nLFxuICAgICAgICAgIHRleHQ6ICdHdWlkZScsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIHtcbiAgICAgICAgLy8gICBhY3RpdmVNYXRjaDogJ14vZW4vY29tcG9uZW50cy8nLFxuICAgICAgICAvLyAgIGxpbms6ICcvZW4vY29tcG9uZW50cy9pbnRyb2R1Y3Rpb24nLFxuICAgICAgICAvLyAgIHRleHQ6ICdDb21wb25lbnRzJyxcbiAgICAgICAgLy8gfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICdIaXN0b3JpY2FsIFZlcnNpb25zJyxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBsaW5rOiAnaHR0cHM6Ly9kb2MudnZiaW4uY24nLFxuICAgICAgICAgICAgICB0ZXh0OiAnMi54IFZlcnNpb24gRG9jdW1lbnRhdGlvbicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogJ0RlbW8nLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICdOZXdiZWUgQWRtaW4nLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGxpbms6ICdodHRwczovL3d3dy52YmVuLnBybycsXG4gICAgICAgICAgICAgIHRleHQ6ICdEZW1vIFZlcnNpb24nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbGluazogJ2h0dHBzOi8vYW50LnZiZW4ucHJvJyxcbiAgICAgICAgICAgICAgdGV4dDogJ0FudCBEZXNpZ24gVnVlIFZlcnNpb24nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbGluazogJ2h0dHBzOi8vbmFpdmUudmJlbi5wcm8nLFxuICAgICAgICAgICAgICB0ZXh0OiAnTmFpdmUgVmVyc2lvbicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBsaW5rOiAnaHR0cHM6Ly9lbGUudmJlbi5wcm8nLFxuICAgICAgICAgICAgICB0ZXh0OiAnRWxlbWVudCBQbHVzIFZlcnNpb24nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJ090aGVycycsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbGluazogJ2h0dHBzOi8vdmJlbi52dmJpbi5jbicsXG4gICAgICAgICAgICAgIHRleHQ6ICdOZXdiZWUgQWRtaW4gMi54JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiB2ZXJzaW9uLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGxpbms6ICdodHRwczovL2dpdGh1Yi5jb20vdmJlbmpzL3Z1ZS12YmVuLWFkbWluL3JlbGVhc2VzJyxcbiAgICAgICAgICB0ZXh0OiAnQ2hhbmdlbG9nJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxpbms6ICdodHRwczovL2dpdGh1Yi5jb20vb3Jncy92YmVuanMvcHJvamVjdHMvNScsXG4gICAgICAgICAgdGV4dDogJ1JvYWRtYXAnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGluazogJ2h0dHBzOi8vZ2l0aHViLmNvbS92YmVuanMvdnVlLXZiZW4tYWRtaW4vYmxvYi9tYWluLy5naXRodWIvY29udHJpYnV0aW5nLm1kJyxcbiAgICAgICAgICB0ZXh0OiAnQ29udHJpYnV0aW9uJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICBsaW5rOiAnL2NvbW1lcmNpYWwvdGVjaG5pY2FsLXN1cHBvcnQnLFxuICAgICAgdGV4dDogJ1x1RDgzRVx1REQ4NCBUZWNoIFN1cHBvcnQnLFxuICAgIH0sXG4gICAge1xuICAgICAgbGluazogJy9zcG9uc29yL3BlcnNvbmFsJyxcbiAgICAgIHRleHQ6ICdcdTI3MjggU3BvbnNvcicsXG4gICAgfSxcbiAgICB7XG4gICAgICBsaW5rOiAnL2NvbW1lcmNpYWwvY29tbXVuaXR5JyxcbiAgICAgIHRleHQ6ICdcdUQ4M0RcdURDNjhcdTIwMERcdUQ4M0RcdURDNjZcdTIwMERcdUQ4M0RcdURDNjYgQ29tbXVuaXR5JyxcbiAgICB9LFxuICAgIC8vIHtcbiAgICAvLyAgIGxpbms6ICcvZnJpZW5kLWxpbmtzLycsXG4gICAgLy8gICB0ZXh0OiAnXHVEODNFXHVERDFEIEZyaWVuZCBMaW5rcycsXG4gICAgLy8gfSxcbiAgXTtcbn1cbiIsICJ7XG4gIFwibmFtZVwiOiBcInZiZW4tYWRtaW4tbW9ub3JlcG9cIixcbiAgXCJ2ZXJzaW9uXCI6IFwiNS41LjdcIixcbiAgXCJwcml2YXRlXCI6IHRydWUsXG4gIFwia2V5d29yZHNcIjogW1xuICAgIFwibW9ub3JlcG9cIixcbiAgICBcInR1cmJvXCIsXG4gICAgXCJ2YmVuXCIsXG4gICAgXCJOZXdiZWUgQWRtaW5cIixcbiAgICBcIk5ld2JlZSBwcm9cIixcbiAgICBcInZ1ZVwiLFxuICAgIFwidnVlIGFkbWluXCIsXG4gICAgXCJ2dWUzXCJcbiAgXSxcbiAgXCJob21lcGFnZVwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS92YmVuanMvdnVlLXZiZW4tYWRtaW5cIixcbiAgXCJidWdzXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL3ZiZW5qcy92dWUtdmJlbi1hZG1pbi9pc3N1ZXNcIixcbiAgXCJyZXBvc2l0b3J5XCI6IFwidmJlbmpzL3Z1ZS12YmVuLWFkbWluLmdpdFwiLFxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcbiAgXCJhdXRob3JcIjoge1xuICAgIFwibmFtZVwiOiBcInZiZW5cIixcbiAgICBcImVtYWlsXCI6IFwiYW5uLnZiZW5AZ21haWwuY29tXCIsXG4gICAgXCJ1cmxcIjogXCJodHRwczovL2dpdGh1Yi5jb20vYW5uY3diXCJcbiAgfSxcbiAgXCJ0eXBlXCI6IFwibW9kdWxlXCIsXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJidWlsZFwiOiBcImNyb3NzLWVudiBOT0RFX09QVElPTlM9LS1tYXgtb2xkLXNwYWNlLXNpemU9ODE5MiB0dXJibyBidWlsZFwiLFxuICAgIFwiYnVpbGQ6YW5hbHl6ZVwiOiBcInR1cmJvIGJ1aWxkOmFuYWx5emVcIixcbiAgICBcImJ1aWxkOmFudGRcIjogXCJwbnBtIHJ1biBidWlsZCAtLWZpbHRlcj1AdmJlbi93ZWItYW50ZFwiLFxuICAgIFwiYnVpbGQ6YW50ZDp0ZXN0XCI6IFwicG5wbSBydW4gYnVpbGQgLS1maWx0ZXI9QHZiZW4vd2ViLWFudGQgLS0gLS1tb2RlIHRlc3RcIixcbiAgICBcImJ1aWxkOmRvY2tlclwiOiBcIi4vc2NyaXB0cy9kZXBsb3kvYnVpbGQtbG9jYWwtZG9ja2VyLWltYWdlLnNoXCIsXG4gICAgXCJidWlsZDpkb2NzXCI6IFwicG5wbSBydW4gYnVpbGQgLS1maWx0ZXI9QHZiZW4vZG9jc1wiLFxuICAgIFwiYnVpbGQ6cGxheVwiOiBcInBucG0gcnVuIGJ1aWxkIC0tZmlsdGVyPUB2YmVuL3BsYXlncm91bmRcIixcbiAgICBcImNoYW5nZXNldFwiOiBcInBucG0gZXhlYyBjaGFuZ2VzZXRcIixcbiAgICBcImNoZWNrXCI6IFwicG5wbSBydW4gY2hlY2s6Y2lyY3VsYXIgJiYgcG5wbSBydW4gY2hlY2s6ZGVwICYmIHBucG0gcnVuIGNoZWNrOnR5cGUgJiYgcG5wbSBjaGVjazpjc3BlbGxcIixcbiAgICBcImNoZWNrOmNpcmN1bGFyXCI6IFwidnNoIGNoZWNrLWNpcmN1bGFyXCIsXG4gICAgXCJjaGVjazpjc3BlbGxcIjogXCJjc3BlbGwgbGludCAqKi8qLnRzICoqL1JFQURNRS5tZCAuY2hhbmdlc2V0LyoubWQgLS1uby1wcm9ncmVzc1wiLFxuICAgIFwiY2hlY2s6ZGVwXCI6IFwidnNoIGNoZWNrLWRlcFwiLFxuICAgIFwiY2hlY2s6dHlwZVwiOiBcInR1cmJvIHJ1biB0eXBlY2hlY2tcIixcbiAgICBcImNsZWFuXCI6IFwibm9kZSAuL3NjcmlwdHMvY2xlYW4ubWpzXCIsXG4gICAgXCJjb21taXRcIjogXCJjemdcIixcbiAgICBcImRldlwiOiBcInR1cmJvLXJ1biBkZXZcIixcbiAgICBcImRldjphbnRkXCI6IFwicG5wbSAtRiBAdmJlbi93ZWItYW50ZCBydW4gZGV2XCIsXG4gICAgXCJkZXY6ZG9jc1wiOiBcInBucG0gLUYgQHZiZW4vZG9jcyBydW4gZGV2XCIsXG4gICAgXCJkZXY6cGxheVwiOiBcInBucG0gLUYgQHZiZW4vcGxheWdyb3VuZCBydW4gZGV2XCIsXG4gICAgXCJmb3JtYXRcIjogXCJ2c2ggbGludCAtLWZvcm1hdFwiLFxuICAgIFwibGludFwiOiBcInZzaCBsaW50XCIsXG4gICAgXCJwb3N0aW5zdGFsbFwiOiBcInBucG0gLXIgcnVuIHN0dWIgLS1pZi1wcmVzZW50XCIsXG4gICAgXCJwcmVpbnN0YWxsXCI6IFwibnB4IG9ubHktYWxsb3cgcG5wbVwiLFxuICAgIFwicHJldmlld1wiOiBcInR1cmJvLXJ1biBwcmV2aWV3XCIsXG4gICAgXCJwdWJsaW50XCI6IFwidnNoIHB1YmxpbnRcIixcbiAgICBcInJlaW5zdGFsbFwiOiBcInBucG0gY2xlYW4gLS1kZWwtbG9jayAmJiBwbnBtIGluc3RhbGxcIixcbiAgICBcInRlc3Q6dW5pdFwiOiBcInZpdGVzdCBydW4gLS1kb21cIixcbiAgICBcInRlc3Q6ZTJlXCI6IFwidHVyYm8gcnVuIHRlc3Q6ZTJlXCIsXG4gICAgXCJ1cGRhdGU6ZGVwc1wiOiBcIm5weCB0YXplIC1yIC13XCIsXG4gICAgXCJ2ZXJzaW9uXCI6IFwicG5wbSBleGVjIGNoYW5nZXNldCB2ZXJzaW9uICYmIHBucG0gaW5zdGFsbCAtLW5vLWZyb3plbi1sb2NrZmlsZVwiLFxuICAgIFwiY2F0YWxvZ1wiOiBcInBucHggY29kZW1vZCBwbnBtL2NhdGFsb2dcIlxuICB9LFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAY2hhbmdlc2V0cy9jaGFuZ2Vsb2ctZ2l0aHViXCI6IFwiY2F0YWxvZzpcIixcbiAgICBcIkBjaGFuZ2VzZXRzL2NsaVwiOiBcImNhdGFsb2c6XCIsXG4gICAgXCJAcGxheXdyaWdodC90ZXN0XCI6IFwiY2F0YWxvZzpcIixcbiAgICBcIkB0eXBlcy9ub2RlXCI6IFwiY2F0YWxvZzpcIixcbiAgICBcIkB2YmVuL2NvbW1pdGxpbnQtY29uZmlnXCI6IFwid29ya3NwYWNlOipcIixcbiAgICBcIkB2YmVuL2VzbGludC1jb25maWdcIjogXCJ3b3Jrc3BhY2U6KlwiLFxuICAgIFwiQHZiZW4vcHJldHRpZXItY29uZmlnXCI6IFwid29ya3NwYWNlOipcIixcbiAgICBcIkB2YmVuL3N0eWxlbGludC1jb25maWdcIjogXCJ3b3Jrc3BhY2U6KlwiLFxuICAgIFwiQHZiZW4vdGFpbHdpbmQtY29uZmlnXCI6IFwid29ya3NwYWNlOipcIixcbiAgICBcIkB2YmVuL3RzY29uZmlnXCI6IFwid29ya3NwYWNlOipcIixcbiAgICBcIkB2YmVuL3R1cmJvLXJ1blwiOiBcIndvcmtzcGFjZToqXCIsXG4gICAgXCJAdmJlbi92aXRlLWNvbmZpZ1wiOiBcIndvcmtzcGFjZToqXCIsXG4gICAgXCJAdmJlbi92c2hcIjogXCJ3b3Jrc3BhY2U6KlwiLFxuICAgIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI6IFwiY2F0YWxvZzpcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXZ1ZS1qc3hcIjogXCJjYXRhbG9nOlwiLFxuICAgIFwiQHZ1ZS90ZXN0LXV0aWxzXCI6IFwiY2F0YWxvZzpcIixcbiAgICBcImF1dG9wcmVmaXhlclwiOiBcImNhdGFsb2c6XCIsXG4gICAgXCJjcm9zcy1lbnZcIjogXCJjYXRhbG9nOlwiLFxuICAgIFwiY3NwZWxsXCI6IFwiY2F0YWxvZzpcIixcbiAgICBcImhhcHB5LWRvbVwiOiBcImNhdGFsb2c6XCIsXG4gICAgXCJpcy1jaVwiOiBcImNhdGFsb2c6XCIsXG4gICAgXCJsZWZ0aG9va1wiOiBcImNhdGFsb2c6XCIsXG4gICAgXCJwbGF5d3JpZ2h0XCI6IFwiY2F0YWxvZzpcIixcbiAgICBcInJpbXJhZlwiOiBcImNhdGFsb2c6XCIsXG4gICAgXCJ0YWlsd2luZGNzc1wiOiBcImNhdGFsb2c6XCIsXG4gICAgXCJ0dXJib1wiOiBcImNhdGFsb2c6XCIsXG4gICAgXCJ0eXBlc2NyaXB0XCI6IFwiY2F0YWxvZzpcIixcbiAgICBcInVuYnVpbGRcIjogXCJjYXRhbG9nOlwiLFxuICAgIFwidml0ZVwiOiBcImNhdGFsb2c6XCIsXG4gICAgXCJ2aXRlc3RcIjogXCJjYXRhbG9nOlwiLFxuICAgIFwidnVlXCI6IFwiY2F0YWxvZzpcIixcbiAgICBcInZ1ZS10c2NcIjogXCJjYXRhbG9nOlwiXG4gIH0sXG4gIFwiZW5naW5lc1wiOiB7XG4gICAgXCJub2RlXCI6IFwiPj0yMC4xMC4wXCIsXG4gICAgXCJwbnBtXCI6IFwiPj05LjEyLjBcIlxuICB9LFxuICBcInBhY2thZ2VNYW5hZ2VyXCI6IFwicG5wbUAxMC4xMC4wXCIsXG4gIFwicG5wbVwiOiB7XG4gICAgXCJwZWVyRGVwZW5kZW5jeVJ1bGVzXCI6IHtcbiAgICAgIFwiYWxsb3dlZFZlcnNpb25zXCI6IHtcbiAgICAgICAgXCJlc2xpbnRcIjogXCIqXCJcbiAgICAgIH1cbiAgICB9LFxuICAgIFwib3ZlcnJpZGVzXCI6IHtcbiAgICAgIFwiQGFzdC1ncmVwL25hcGlcIjogXCJjYXRhbG9nOlwiLFxuICAgICAgXCJAY3RybC90aW55Y29sb3JcIjogXCJjYXRhbG9nOlwiLFxuICAgICAgXCJjbHN4XCI6IFwiY2F0YWxvZzpcIixcbiAgICAgIFwiZXNidWlsZFwiOiBcIjAuMjUuM1wiLFxuICAgICAgXCJwaW5pYVwiOiBcImNhdGFsb2c6XCIsXG4gICAgICBcInZ1ZVwiOiBcImNhdGFsb2c6XCJcbiAgICB9LFxuICAgIFwibmV2ZXJCdWlsdERlcGVuZGVuY2llc1wiOiBbXG4gICAgICBcImNhbnZhc1wiLFxuICAgICAgXCJub2RlLWd5cFwiXG4gICAgXVxuICB9XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9vcHQvY29kZS9uZXdiZWUvdWkvZG9jcy8udml0ZXByZXNzL2NvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL29wdC9jb2RlL25ld2JlZS91aS9kb2NzLy52aXRlcHJlc3MvY29uZmlnL3NoYXJlZC5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL29wdC9jb2RlL25ld2JlZS91aS9kb2NzLy52aXRlcHJlc3MvY29uZmlnL3NoYXJlZC5tdHNcIjtpbXBvcnQgdHlwZSB7IFB3YU9wdGlvbnMgfSBmcm9tICdAdml0ZS1wd2Evdml0ZXByZXNzJztcbmltcG9ydCB0eXBlIHsgSGVhZENvbmZpZyB9IGZyb20gJ3ZpdGVwcmVzcyc7XG5cbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdub2RlOnBhdGgnO1xuXG5pbXBvcnQge1xuICB2aXRlQXJjaGl2ZXJQbHVnaW4sXG4gIHZpdGVWeGVUYWJsZUltcG9ydHNQbHVnaW4sXG59IGZyb20gJ0B2YmVuL3ZpdGUtY29uZmlnJztcblxuaW1wb3J0IHtcbiAgR2l0Q2hhbmdlbG9nLFxuICBHaXRDaGFuZ2Vsb2dNYXJrZG93blNlY3Rpb24sXG59IGZyb20gJ0Bub2xlYmFzZS92aXRlcHJlc3MtcGx1Z2luLWdpdC1jaGFuZ2Vsb2cvdml0ZSc7XG5pbXBvcnQgdGFpbHdpbmQgZnJvbSAndGFpbHdpbmRjc3MnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBwb3N0Y3NzSXNvbGF0ZVN0eWxlcyB9IGZyb20gJ3ZpdGVwcmVzcyc7XG5pbXBvcnQge1xuICBncm91cEljb25NZFBsdWdpbixcbiAgZ3JvdXBJY29uVml0ZVBsdWdpbixcbn0gZnJvbSAndml0ZXByZXNzLXBsdWdpbi1ncm91cC1pY29ucyc7XG5cbmltcG9ydCB7IGRlbW9QcmV2aWV3UGx1Z2luIH0gZnJvbSAnLi9wbHVnaW5zL2RlbW8tcHJldmlldyc7XG5pbXBvcnQgeyBzZWFyY2ggYXMgemhTZWFyY2ggfSBmcm9tICcuL3poLm10cyc7XG5cbmV4cG9ydCBjb25zdCBzaGFyZWQgPSBkZWZpbmVDb25maWcoe1xuICBhcHBlYXJhbmNlOiAnZGFyaycsXG4gIGhlYWQ6IGhlYWQoKSxcbiAgbWFya2Rvd246IHtcbiAgICBwcmVDb25maWcobWQpIHtcbiAgICAgIG1kLnVzZShkZW1vUHJldmlld1BsdWdpbik7XG4gICAgICBtZC51c2UoZ3JvdXBJY29uTWRQbHVnaW4pO1xuICAgIH0sXG4gIH0sXG4gIHB3YTogcHdhKCksXG4gIHNyY0RpcjogJ3NyYycsXG4gIHRoZW1lQ29uZmlnOiB7XG4gICAgaTE4blJvdXRpbmc6IHRydWUsXG4gICAgbG9nbzogJ2h0dHBzOi8vdW5wa2cuY29tL0B2YmVuanMvc3RhdGljLXNvdXJjZUAwLjEuNy9zb3VyY2UvbG9nby12MS53ZWJwJyxcbiAgICBzZWFyY2g6IHtcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgbG9jYWxlczoge1xuICAgICAgICAgIC4uLnpoU2VhcmNoLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHByb3ZpZGVyOiAnbG9jYWwnLFxuICAgIH0sXG4gICAgc2l0ZVRpdGxlOiAnTmV3YmVlIEFkbWluJyxcbiAgICBzb2NpYWxMaW5rczogW1xuICAgICAgeyBpY29uOiAnZ2l0aHViJywgbGluazogJ2h0dHBzOi8vZ2l0aHViLmNvbS9jb2Rlci1sdWx1L25ld2JlZS11aScgfSxcbiAgICBdLFxuICB9LFxuICB0aXRsZTogJ05ld2JlZSBBZG1pbicsXG4gIHZpdGU6IHtcbiAgICBidWlsZDoge1xuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiBJbmZpbml0eSxcbiAgICAgIG1pbmlmeTogJ3RlcnNlcicsXG4gICAgfSxcbiAgICBjc3M6IHtcbiAgICAgIHBvc3Rjc3M6IHtcbiAgICAgICAgcGx1Z2luczogW1xuICAgICAgICAgIHRhaWx3aW5kKCksXG4gICAgICAgICAgcG9zdGNzc0lzb2xhdGVTdHlsZXMoeyBpbmNsdWRlRmlsZXM6IFsvdnAtZG9jXFwuY3NzL10gfSksXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgICBzY3NzOiB7XG4gICAgICAgICAgYXBpOiAnbW9kZXJuJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBqc29uOiB7XG4gICAgICBzdHJpbmdpZnk6IHRydWUsXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbXG4gICAgICBHaXRDaGFuZ2Vsb2coe1xuICAgICAgICBtYXBBdXRob3JzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWFwQnlOYW1lQWxpYXNlczogWydWYmVuJ10sXG4gICAgICAgICAgICBuYW1lOiAndmJlbicsXG4gICAgICAgICAgICB1c2VybmFtZTogJ2FubmN3YicsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAndmluY2UnLFxuICAgICAgICAgICAgdXNlcm5hbWU6ICd2aW5jZTI5MjAwNycsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnTGkgS3VpJyxcbiAgICAgICAgICAgIHVzZXJuYW1lOiAnbGlrdWk2MjgnLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIHJlcG9VUkw6ICgpID0+ICdodHRwczovL2dpdGh1Yi5jb20vdmJlbmpzL3Z1ZS12YmVuLWFkbWluJyxcbiAgICAgIH0pLFxuICAgICAgR2l0Q2hhbmdlbG9nTWFya2Rvd25TZWN0aW9uKCksXG4gICAgICB2aXRlQXJjaGl2ZXJQbHVnaW4oeyBvdXRwdXREaXI6ICcudml0ZXByZXNzJyB9KSxcbiAgICAgIGdyb3VwSWNvblZpdGVQbHVnaW4oKSxcbiAgICAgIGF3YWl0IHZpdGVWeGVUYWJsZUltcG9ydHNQbHVnaW4oKSxcbiAgICBdLFxuICAgIHNlcnZlcjoge1xuICAgICAgZnM6IHtcbiAgICAgICAgYWxsb3c6IFsnLi4vLi4nXSxcbiAgICAgIH0sXG4gICAgICBob3N0OiB0cnVlLFxuICAgICAgcG9ydDogNjE3MyxcbiAgICB9LFxuXG4gICAgc3NyOiB7XG4gICAgICBleHRlcm5hbDogWydAdnVlL3JlcGwnXSxcbiAgICB9LFxuICB9LFxufSk7XG5cbmZ1bmN0aW9uIGhlYWQoKTogSGVhZENvbmZpZ1tdIHtcbiAgcmV0dXJuIFtcbiAgICBbJ21ldGEnLCB7IGNvbnRlbnQ6ICdOZXdiZWUgVGVhbScsIG5hbWU6ICdhdXRob3InIH1dLFxuICAgIFtcbiAgICAgICdtZXRhJyxcbiAgICAgIHtcbiAgICAgICAgY29udGVudDogJ25ld2JlZSwgdml0ZWpzLCB2aXRlLCBzaGFjZG4tdWksIHZ1ZScsXG4gICAgICAgIG5hbWU6ICdrZXl3b3JkcycsXG4gICAgICB9LFxuICAgIF0sXG4gICAgWydsaW5rJywgeyBocmVmOiAnL2Zhdmljb24uaWNvJywgcmVsOiAnaWNvbicsIHR5cGU6ICdpbWFnZS9zdmcreG1sJyB9XSxcbiAgICBbXG4gICAgICAnbWV0YScsXG4gICAgICB7XG4gICAgICAgIGNvbnRlbnQ6XG4gICAgICAgICAgJ3dpZHRoPWRldmljZS13aWR0aCxpbml0aWFsLXNjYWxlPTEsbWluaW11bS1zY2FsZT0xLjAsbWF4aW11bS1zY2FsZT0xLjAsdXNlci1zY2FsYWJsZT1ubycsXG4gICAgICAgIG5hbWU6ICd2aWV3cG9ydCcsXG4gICAgICB9LFxuICAgIF0sXG4gICAgWydtZXRhJywgeyBjb250ZW50OiAnbmV3YmVlIGFkbWluIGRvY3MnLCBuYW1lOiAna2V5d29yZHMnIH1dLFxuICAgIFsnbGluaycsIHsgaHJlZjogJy9mYXZpY29uLmljbycsIHJlbDogJ2ljb24nIH1dLFxuICAgIC8vIFtcbiAgICAvLyAgICdzY3JpcHQnLFxuICAgIC8vICAge1xuICAgIC8vICAgICBzcmM6ICdodHRwczovL2Nkbi50YWlsd2luZGNzcy5jb20nLFxuICAgIC8vICAgfSxcbiAgICAvLyBdLFxuICBdO1xufVxuXG5mdW5jdGlvbiBwd2EoKTogUHdhT3B0aW9ucyB7XG4gIHJldHVybiB7XG4gICAgaW5jbHVkZU1hbmlmZXN0SWNvbnM6IGZhbHNlLFxuICAgIG1hbmlmZXN0OiB7XG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgJ05ld2JlZSBBZG1pbiBpcyBhIG1vZGVybiBhZG1pbiBkYXNoYm9hcmQgdGVtcGxhdGUgYmFzZWQgb24gVnVlIDMuICcsXG4gICAgICBpY29uczogW1xuICAgICAgICB7XG4gICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcbiAgICAgICAgICBzcmM6ICdodHRwczovL3VucGtnLmNvbS9AdmJlbmpzL3N0YXRpYy1zb3VyY2VAMC4xLjcvc291cmNlL3B3YS1pY29uLTE5Mi5wbmcnLFxuICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICBzcmM6ICdodHRwczovL3VucGtnLmNvbS9AdmJlbmpzL3N0YXRpYy1zb3VyY2VAMC4xLjcvc291cmNlL3B3YS1pY29uLTUxMi5wbmcnLFxuICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGlkOiAnLycsXG4gICAgICBuYW1lOiAnTmV3YmVlIEFkbWluIERvYycsXG4gICAgICBzaG9ydF9uYW1lOiAnbmV3YmVlX2FkbWluX2RvYycsXG4gICAgICB0aGVtZV9jb2xvcjogJyNmZmZmZmYnLFxuICAgIH0sXG4gICAgb3V0RGlyOiByZXNvbHZlKHByb2Nlc3MuY3dkKCksICcudml0ZXByZXNzL2Rpc3QnKSxcbiAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcbiAgICB3b3JrYm94OiB7XG4gICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57Y3NzLGpzLGh0bWwsc3ZnLHBuZyxpY28sdHh0LHdvZmYyfSddLFxuICAgICAgbWF4aW11bUZpbGVTaXplVG9DYWNoZUluQnl0ZXM6IDUgKiAxMDI0ICogMTAyNCxcbiAgICB9LFxuICB9O1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvb3B0L2NvZGUvbmV3YmVlL3VpL2RvY3MvLnZpdGVwcmVzcy9jb25maWcvcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL29wdC9jb2RlL25ld2JlZS91aS9kb2NzLy52aXRlcHJlc3MvY29uZmlnL3BsdWdpbnMvZGVtby1wcmV2aWV3LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9vcHQvY29kZS9uZXdiZWUvdWkvZG9jcy8udml0ZXByZXNzL2NvbmZpZy9wbHVnaW5zL2RlbW8tcHJldmlldy50c1wiO2ltcG9ydCB0eXBlIHsgTWFya2Rvd25FbnYsIE1hcmtkb3duUmVuZGVyZXIgfSBmcm9tICd2aXRlcHJlc3MnO1xuXG5pbXBvcnQgY3J5cHRvIGZyb20gJ25vZGU6Y3J5cHRvJztcbmltcG9ydCB7IHJlYWRkaXJTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSAnbm9kZTpwYXRoJztcblxuZXhwb3J0IGNvbnN0IHJhd1BhdGhSZWdleHAgPVxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVnZXhwL25vLXN1cGVyLWxpbmVhci1iYWNrdHJhY2tpbmcsIHJlZ2V4cC9zdHJpY3RcbiAgL14oLis/KD86XFwuKFtcXGRhLXpdKykpPykoI1tcXHctXSspPyg/OiA/eyhcXGQrKD86WywtXVxcZCspKik/ID8oXFxTKyk/fSk/ID8oPzpcXFsoLispXSk/JC87XG5cbmZ1bmN0aW9uIHJhd1BhdGhUb1Rva2VuKHJhd1BhdGg6IHN0cmluZykge1xuICBjb25zdCBbXG4gICAgZmlsZXBhdGggPSAnJyxcbiAgICBleHRlbnNpb24gPSAnJyxcbiAgICByZWdpb24gPSAnJyxcbiAgICBsaW5lcyA9ICcnLFxuICAgIGxhbmcgPSAnJyxcbiAgICByYXdUaXRsZSA9ICcnLFxuICBdID0gKHJhd1BhdGhSZWdleHAuZXhlYyhyYXdQYXRoKSB8fCBbXSkuc2xpY2UoMSk7XG5cbiAgY29uc3QgdGl0bGUgPSByYXdUaXRsZSB8fCBmaWxlcGF0aC5zcGxpdCgnLycpLnBvcCgpIHx8ICcnO1xuXG4gIHJldHVybiB7IGV4dGVuc2lvbiwgZmlsZXBhdGgsIGxhbmcsIGxpbmVzLCByZWdpb24sIHRpdGxlIH07XG59XG5cbmV4cG9ydCBjb25zdCBkZW1vUHJldmlld1BsdWdpbiA9IChtZDogTWFya2Rvd25SZW5kZXJlcikgPT4ge1xuICBtZC5jb3JlLnJ1bGVyLmFmdGVyKCdpbmxpbmUnLCAnZGVtby1wcmV2aWV3JywgKHN0YXRlKSA9PiB7XG4gICAgY29uc3QgaW5zZXJ0Q29tcG9uZW50SW1wb3J0ID0gKGltcG9ydFN0cmluZzogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBpbmRleCA9IHN0YXRlLnRva2Vucy5maW5kSW5kZXgoXG4gICAgICAgIChpKSA9PiBpLnR5cGUgPT09ICdodG1sX2Jsb2NrJyAmJiBpLmNvbnRlbnQubWF0Y2goLzxzY3JpcHQgc2V0dXA+L2cpLFxuICAgICAgKTtcbiAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgY29uc3QgaW1wb3J0Q29tcG9uZW50ID0gbmV3IHN0YXRlLlRva2VuKCdodG1sX2Jsb2NrJywgJycsIDApO1xuICAgICAgICBpbXBvcnRDb21wb25lbnQuY29udGVudCA9IGA8c2NyaXB0IHNldHVwPlxcbiR7aW1wb3J0U3RyaW5nfVxcbjwvc2NyaXB0PlxcbmA7XG4gICAgICAgIHN0YXRlLnRva2Vucy5zcGxpY2UoMCwgMCwgaW1wb3J0Q29tcG9uZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzdGF0ZS50b2tlbnNbaW5kZXhdKSB7XG4gICAgICAgICAgY29uc3QgY29udGVudCA9IHN0YXRlLnRva2Vuc1tpbmRleF0uY29udGVudDtcbiAgICAgICAgICBzdGF0ZS50b2tlbnNbaW5kZXhdLmNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoXG4gICAgICAgICAgICAnPC9zY3JpcHQ+JyxcbiAgICAgICAgICAgIGAke2ltcG9ydFN0cmluZ31cXG48L3NjcmlwdD5gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICAgIC8vIERlZmluZSB0aGUgcmVndWxhciBleHByZXNzaW9uIHRvIG1hdGNoIHRoZSBkZXNpcmVkIHBhdHRlcm5cbiAgICBjb25zdCByZWdleCA9IC88RGVtb1ByZXZpZXdbXj5dKlxcc2Rpcj1cIihbXlwiXSopXCIvZztcbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIE1hcmtkb3duIGNvbnRlbnQgYW5kIHJlcGxhY2UgdGhlIHBhdHRlcm5cbiAgICBzdGF0ZS5zcmMgPSBzdGF0ZS5zcmMucmVwbGFjZUFsbChyZWdleCwgKF9tYXRjaCwgZGlyKSA9PiB7XG4gICAgICBjb25zdCBjb21wb25lbnREaXIgPSBqb2luKHByb2Nlc3MuY3dkKCksICdzcmMnLCBkaXIpLnJlcGxhY2VBbGwoXG4gICAgICAgICdcXFxcJyxcbiAgICAgICAgJy8nLFxuICAgICAgKTtcblxuICAgICAgbGV0IGNoaWxkRmlsZXM6IHN0cmluZ1tdID0gW107XG4gICAgICBsZXQgZGlyRXhpc3RzID0gdHJ1ZTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgY2hpbGRGaWxlcyA9XG4gICAgICAgICAgcmVhZGRpclN5bmMoY29tcG9uZW50RGlyLCB7XG4gICAgICAgICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgICAgICAgICAgcmVjdXJzaXZlOiBmYWxzZSxcbiAgICAgICAgICAgIHdpdGhGaWxlVHlwZXM6IGZhbHNlLFxuICAgICAgICAgIH0pIHx8IFtdO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIGRpckV4aXN0cyA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWRpckV4aXN0cykge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHVuaXF1ZVdvcmQgPSBnZW5lcmF0ZUNvbnRlbnRIYXNoKGNvbXBvbmVudERpcik7XG5cbiAgICAgIGNvbnN0IENvbXBvbmVudE5hbWUgPSBgRGVtb0NvbXBvbmVudF8ke3VuaXF1ZVdvcmR9YDtcbiAgICAgIGluc2VydENvbXBvbmVudEltcG9ydChcbiAgICAgICAgYGltcG9ydCAke0NvbXBvbmVudE5hbWV9IGZyb20gJyR7Y29tcG9uZW50RGlyfS9pbmRleC52dWUnYCxcbiAgICAgICk7XG4gICAgICBjb25zdCB7IHBhdGg6IF9wYXRoIH0gPSBzdGF0ZS5lbnYgYXMgTWFya2Rvd25FbnY7XG5cbiAgICAgIGNvbnN0IGluZGV4ID0gc3RhdGUudG9rZW5zLmZpbmRJbmRleCgoaSkgPT4gaS5jb250ZW50Lm1hdGNoKHJlZ2V4KSk7XG5cbiAgICAgIGlmICghc3RhdGUudG9rZW5zW2luZGV4XSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG4gICAgICBjb25zdCBmaXJzdFN0cmluZyA9ICdpbmRleC52dWUnO1xuICAgICAgY2hpbGRGaWxlcyA9IGNoaWxkRmlsZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICBpZiAoYSA9PT0gZmlyc3RTdHJpbmcpIHJldHVybiAtMTtcbiAgICAgICAgaWYgKGIgPT09IGZpcnN0U3RyaW5nKSByZXR1cm4gMTtcbiAgICAgICAgcmV0dXJuIGEubG9jYWxlQ29tcGFyZShiLCAnZW4nLCB7IHNlbnNpdGl2aXR5OiAnYmFzZScgfSk7XG4gICAgICB9KTtcbiAgICAgIHN0YXRlLnRva2Vuc1tpbmRleF0uY29udGVudCA9XG4gICAgICAgIGA8RGVtb1ByZXZpZXcgZmlsZXM9XCIke2VuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjaGlsZEZpbGVzKSl9XCIgPjwke0NvbXBvbmVudE5hbWV9Lz5cbiAgICAgICAgYDtcblxuICAgICAgY29uc3QgX2R1bW15VG9rZW4gPSBuZXcgc3RhdGUuVG9rZW4oJycsICcnLCAwKTtcbiAgICAgIGNvbnN0IHRva2VuQXJyYXk6IEFycmF5PHR5cGVvZiBfZHVtbXlUb2tlbj4gPSBbXTtcbiAgICAgIGNoaWxkRmlsZXMuZm9yRWFjaCgoZmlsZW5hbWUpID0+IHtcbiAgICAgICAgLy8gY29uc3Qgc2xvdE5hbWUgPSBmaWxlbmFtZS5yZXBsYWNlKGV4dG5hbWUoZmlsZW5hbWUpLCAnJyk7XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGVTdGFydCA9IG5ldyBzdGF0ZS5Ub2tlbignaHRtbF9pbmxpbmUnLCAnJywgMCk7XG4gICAgICAgIHRlbXBsYXRlU3RhcnQuY29udGVudCA9IGA8dGVtcGxhdGUgIyR7ZmlsZW5hbWV9PmA7XG4gICAgICAgIHRva2VuQXJyYXkucHVzaCh0ZW1wbGF0ZVN0YXJ0KTtcblxuICAgICAgICBjb25zdCByZXNvbHZlZFBhdGggPSBqb2luKGNvbXBvbmVudERpciwgZmlsZW5hbWUpO1xuXG4gICAgICAgIGNvbnN0IHsgZXh0ZW5zaW9uLCBmaWxlcGF0aCwgbGFuZywgbGluZXMsIHRpdGxlIH0gPVxuICAgICAgICAgIHJhd1BhdGhUb1Rva2VuKHJlc29sdmVkUGF0aCk7XG4gICAgICAgIC8vIEFkZCBjb2RlIHRva2VucyBmb3IgZWFjaCBsaW5lXG4gICAgICAgIGNvbnN0IHRva2VuID0gbmV3IHN0YXRlLlRva2VuKCdmZW5jZScsICdjb2RlJywgMCk7XG4gICAgICAgIHRva2VuLmluZm8gPSBgJHtsYW5nIHx8IGV4dGVuc2lvbn0ke2xpbmVzID8gYHske2xpbmVzfX1gIDogJyd9JHtcbiAgICAgICAgICB0aXRsZSA/IGBbJHt0aXRsZX1dYCA6ICcnXG4gICAgICAgIH1gO1xuXG4gICAgICAgIHRva2VuLmNvbnRlbnQgPSBgPDw8ICR7ZmlsZXBhdGh9YDtcbiAgICAgICAgKHRva2VuIGFzIGFueSkuc3JjID0gW3Jlc29sdmVkUGF0aF07XG4gICAgICAgIHRva2VuQXJyYXkucHVzaCh0b2tlbik7XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGVFbmQgPSBuZXcgc3RhdGUuVG9rZW4oJ2h0bWxfaW5saW5lJywgJycsIDApO1xuICAgICAgICB0ZW1wbGF0ZUVuZC5jb250ZW50ID0gJzwvdGVtcGxhdGU+JztcbiAgICAgICAgdG9rZW5BcnJheS5wdXNoKHRlbXBsYXRlRW5kKTtcbiAgICAgIH0pO1xuICAgICAgY29uc3QgZW5kVGFnID0gbmV3IHN0YXRlLlRva2VuKCdodG1sX2lubGluZScsICcnLCAwKTtcbiAgICAgIGVuZFRhZy5jb250ZW50ID0gJzwvRGVtb1ByZXZpZXc+JztcbiAgICAgIHRva2VuQXJyYXkucHVzaChlbmRUYWcpO1xuXG4gICAgICBzdGF0ZS50b2tlbnMuc3BsaWNlKGluZGV4ICsgMSwgMCwgLi4udG9rZW5BcnJheSk7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKFxuICAgICAgLy8gICBzdGF0ZS5tZC5yZW5kZXJlci5yZW5kZXIoc3RhdGUudG9rZW5zLCBzdGF0ZT8ub3B0aW9ucyA/PyBbXSwgc3RhdGUuZW52KSxcbiAgICAgIC8vICk7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuZnVuY3Rpb24gZ2VuZXJhdGVDb250ZW50SGFzaChpbnB1dDogc3RyaW5nLCBsZW5ndGg6IG51bWJlciA9IDEwKTogc3RyaW5nIHtcbiAgLy8gXHU0RjdGXHU3NTI4IFNIQS0yNTYgXHU3NTFGXHU2MjEwXHU1NEM4XHU1RTBDXHU1MDNDXG4gIGNvbnN0IGhhc2ggPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKGlucHV0KS5kaWdlc3QoJ2hleCcpO1xuXG4gIC8vIFx1NUMwNlx1NTRDOFx1NUUwQ1x1NTAzQ1x1OEY2Q1x1NjM2Mlx1NEUzQSBCYXNlMzYgXHU3RjE2XHU3ODAxXHVGRjBDXHU1RTc2XHU1M0Q2XHU2MzA3XHU1QjlBXHU5NTdGXHU1RUE2XHU3Njg0XHU1QjU3XHU3QjI2XHU0RjVDXHU0RTNBXHU3RUQzXHU2NzlDXG4gIHJldHVybiBOdW1iZXIucGFyc2VJbnQoaGFzaCwgMTYpLnRvU3RyaW5nKDM2KS5zbGljZSgwLCBsZW5ndGgpO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvb3B0L2NvZGUvbmV3YmVlL3VpL2RvY3MvLnZpdGVwcmVzcy9jb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9vcHQvY29kZS9uZXdiZWUvdWkvZG9jcy8udml0ZXByZXNzL2NvbmZpZy96aC5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL29wdC9jb2RlL25ld2JlZS91aS9kb2NzLy52aXRlcHJlc3MvY29uZmlnL3poLm10c1wiO2ltcG9ydCB0eXBlIHsgRGVmYXVsdFRoZW1lIH0gZnJvbSAndml0ZXByZXNzJztcblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXByZXNzJztcblxuaW1wb3J0IHsgdmVyc2lvbiB9IGZyb20gJy4uLy4uLy4uL3BhY2thZ2UuanNvbic7XG5cbmV4cG9ydCBjb25zdCB6aCA9IGRlZmluZUNvbmZpZyh7XG4gIGRlc2NyaXB0aW9uOiAnTmV3YmVlIEFkbWluICYgXHU0RjAxXHU0RTFBXHU3RUE3XHU3QkExXHU3NDA2XHU3Q0ZCXHU3RURGXHU2ODQ2XHU2N0I2JyxcbiAgbGFuZzogJ3poLUhhbnMnLFxuICB0aGVtZUNvbmZpZzoge1xuICAgIGRhcmtNb2RlU3dpdGNoTGFiZWw6ICdcdTRFM0JcdTk4OTgnLFxuICAgIGRhcmtNb2RlU3dpdGNoVGl0bGU6ICdcdTUyMDdcdTYzNjJcdTUyMzBcdTZERjFcdTgyNzJcdTZBMjFcdTVGMEYnLFxuICAgIGRvY0Zvb3Rlcjoge1xuICAgICAgbmV4dDogJ1x1NEUwQlx1NEUwMFx1OTg3NScsXG4gICAgICBwcmV2OiAnXHU0RTBBXHU0RTAwXHU5ODc1JyxcbiAgICB9LFxuICAgIGVkaXRMaW5rOiB7XG4gICAgICBwYXR0ZXJuOlxuICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL3ZiZW5qcy92dWUtdmJlbi1hZG1pbi9lZGl0L21haW4vZG9jcy9zcmMvOnBhdGgnLFxuICAgICAgdGV4dDogJ1x1NTcyOCBHaXRIdWIgXHU0RTBBXHU3RjE2XHU4RjkxXHU2QjY0XHU5ODc1XHU5NzYyJyxcbiAgICB9LFxuICAgIGZvb3Rlcjoge1xuICAgICAgY29weXJpZ2h0OiBgQ29weXJpZ2h0IFx1MDBBOSAyMDI1LSR7bmV3IERhdGUoKS5nZXRGdWxsWWVhcigpfSBOZXdiZWVgLFxuICAgICAgbWVzc2FnZTogJ1x1NTdGQVx1NEU4RSBNSVQgXHU4QkI4XHU1M0VGXHU1M0QxXHU1RTAzLicsXG4gICAgfSxcbiAgICBsYW5nTWVudUxhYmVsOiAnXHU1OTFBXHU4QkVEXHU4QTAwJyxcbiAgICBsYXN0VXBkYXRlZDoge1xuICAgICAgZm9ybWF0T3B0aW9uczoge1xuICAgICAgICBkYXRlU3R5bGU6ICdzaG9ydCcsXG4gICAgICAgIHRpbWVTdHlsZTogJ21lZGl1bScsXG4gICAgICB9LFxuICAgICAgdGV4dDogJ1x1NjcwMFx1NTQwRVx1NjZGNFx1NjVCMFx1NEU4RScsXG4gICAgfSxcbiAgICBsaWdodE1vZGVTd2l0Y2hUaXRsZTogJ1x1NTIwN1x1NjM2Mlx1NTIzMFx1NkQ0NVx1ODI3Mlx1NkEyMVx1NUYwRicsXG4gICAgbmF2OiBuYXYoKSxcblxuICAgIG91dGxpbmU6IHtcbiAgICAgIGxhYmVsOiAnXHU5ODc1XHU5NzYyXHU1QkZDXHU4MjJBJyxcbiAgICB9LFxuICAgIHJldHVyblRvVG9wTGFiZWw6ICdcdTU2REVcdTUyMzBcdTk4NzZcdTkwRTgnLFxuXG4gICAgc2lkZWJhcjoge1xuICAgICAgJy9jb21tZXJjaWFsLyc6IHsgYmFzZTogJy9jb21tZXJjaWFsLycsIGl0ZW1zOiBzaWRlYmFyQ29tbWVyY2lhbCgpIH0sXG4gICAgICAnL2NvbXBvbmVudHMvJzogeyBiYXNlOiAnL2NvbXBvbmVudHMvJywgaXRlbXM6IHNpZGViYXJDb21wb25lbnRzKCkgfSxcbiAgICAgICcvZ3VpZGUvJzogeyBiYXNlOiAnL2d1aWRlLycsIGl0ZW1zOiBzaWRlYmFyR3VpZGUoKSB9LFxuICAgIH0sXG4gICAgc2lkZWJhck1lbnVMYWJlbDogJ1x1ODNEQ1x1NTM1NScsXG4gIH0sXG59KTtcblxuZnVuY3Rpb24gc2lkZWJhckd1aWRlKCk6IERlZmF1bHRUaGVtZS5TaWRlYmFySXRlbVtdIHtcbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgdGV4dDogJ1x1N0I4MFx1NEVDQicsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgbGluazogJ2ludHJvZHVjdGlvbi92YmVuJyxcbiAgICAgICAgICB0ZXh0OiAnXHU1MTczXHU0RThFIE5ld2JlZSBBZG1pbicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsaW5rOiAnaW50cm9kdWN0aW9uL3doeScsXG4gICAgICAgICAgdGV4dDogJ1x1NEUzQVx1NEVDMFx1NEU0OFx1OTAwOVx1NjJFOVx1NjIxMVx1NEVFQz8nLFxuICAgICAgICB9LFxuICAgICAgICB7IGxpbms6ICdpbnRyb2R1Y3Rpb24vcXVpY2stc3RhcnQnLCB0ZXh0OiAnXHU1RkVCXHU5MDFGXHU1RjAwXHU1OUNCJyB9LFxuICAgICAgICB7IGxpbms6ICdpbnRyb2R1Y3Rpb24vdGhpbicsIHRleHQ6ICdcdTdDQkVcdTdCODBcdTcyNDhcdTY3MkMnIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBiYXNlOiAnLycsXG4gICAgICAgICAgbGluazogJ2NvbXBvbmVudHMvaW50cm9kdWN0aW9uJyxcbiAgICAgICAgICB0ZXh0OiAnXHU3RUM0XHU0RUY2XHU2NTg3XHU2ODYzJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiAnXHU1N0ZBXHU3ODQwJyxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHsgbGluazogJ2Vzc2VudGlhbHMvY29uY2VwdCcsIHRleHQ6ICdcdTU3RkFcdTc4NDBcdTY5ODJcdTVGRjUnIH0sXG4gICAgICAgIHsgbGluazogJ2Vzc2VudGlhbHMvZGV2ZWxvcG1lbnQnLCB0ZXh0OiAnXHU2NzJDXHU1NzMwXHU1RjAwXHU1M0QxJyB9LFxuICAgICAgICB7IGxpbms6ICdlc3NlbnRpYWxzL3JvdXRlJywgdGV4dDogJ1x1OERFRlx1NzUzMVx1NTQ4Q1x1ODNEQ1x1NTM1NScgfSxcbiAgICAgICAgeyBsaW5rOiAnZXNzZW50aWFscy9zZXR0aW5ncycsIHRleHQ6ICdcdTkxNERcdTdGNkUnIH0sXG4gICAgICAgIHsgbGluazogJ2Vzc2VudGlhbHMvaWNvbnMnLCB0ZXh0OiAnXHU1NkZFXHU2ODA3JyB9LFxuICAgICAgICB7IGxpbms6ICdlc3NlbnRpYWxzL3N0eWxlcycsIHRleHQ6ICdcdTY4MzdcdTVGMEYnIH0sXG4gICAgICAgIHsgbGluazogJ2Vzc2VudGlhbHMvZXh0ZXJuYWwtbW9kdWxlJywgdGV4dDogJ1x1NTkxNlx1OTBFOFx1NkEyMVx1NTc1NycgfSxcbiAgICAgICAgeyBsaW5rOiAnZXNzZW50aWFscy9idWlsZCcsIHRleHQ6ICdcdTY3ODRcdTVFRkFcdTRFMEVcdTkwRThcdTdGNzInIH0sXG4gICAgICAgIHsgbGluazogJ2Vzc2VudGlhbHMvc2VydmVyJywgdGV4dDogJ1x1NjcwRFx1NTJBMVx1N0FFRlx1NEVBNFx1NEU5Mlx1NEUwRVx1NjU3MFx1NjM2RU1vY2snIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogJ1x1NkRGMVx1NTE2NScsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IGxpbms6ICdpbi1kZXB0aC9sb2dpbicsIHRleHQ6ICdcdTc2N0JcdTVGNTUnIH0sXG4gICAgICAgIC8vIHsgbGluazogJ2luLWRlcHRoL2xheW91dCcsIHRleHQ6ICdcdTVFMDNcdTVDNDAnIH0sXG4gICAgICAgIHsgbGluazogJ2luLWRlcHRoL3RoZW1lJywgdGV4dDogJ1x1NEUzQlx1OTg5OCcgfSxcbiAgICAgICAgeyBsaW5rOiAnaW4tZGVwdGgvYWNjZXNzJywgdGV4dDogJ1x1Njc0M1x1OTY1MCcgfSxcbiAgICAgICAgeyBsaW5rOiAnaW4tZGVwdGgvbG9jYWxlJywgdGV4dDogJ1x1NTZGRFx1OTY0NVx1NTMxNicgfSxcbiAgICAgICAgeyBsaW5rOiAnaW4tZGVwdGgvZmVhdHVyZXMnLCB0ZXh0OiAnXHU1RTM4XHU3NTI4XHU1MjlGXHU4MEZEJyB9LFxuICAgICAgICB7IGxpbms6ICdpbi1kZXB0aC9jaGVjay11cGRhdGVzJywgdGV4dDogJ1x1NjhDMFx1NjdFNVx1NjZGNFx1NjVCMCcgfSxcbiAgICAgICAgeyBsaW5rOiAnaW4tZGVwdGgvbG9hZGluZycsIHRleHQ6ICdcdTUxNjhcdTVDNDBsb2FkaW5nJyB9LFxuICAgICAgICB7IGxpbms6ICdpbi1kZXB0aC91aS1mcmFtZXdvcmsnLCB0ZXh0OiAnXHU3RUM0XHU0RUY2XHU1RTkzXHU1MjA3XHU2MzYyJyB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6ICdcdTVERTVcdTdBMEInLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyBsaW5rOiAncHJvamVjdC9zdGFuZGFyZCcsIHRleHQ6ICdcdTg5QzRcdTgzMDMnIH0sXG4gICAgICAgIHsgbGluazogJ3Byb2plY3QvY2xpJywgdGV4dDogJ0NMSScgfSxcbiAgICAgICAgeyBsaW5rOiAncHJvamVjdC9kaXInLCB0ZXh0OiAnXHU3NkVFXHU1RjU1XHU4QkY0XHU2NjBFJyB9LFxuICAgICAgICB7IGxpbms6ICdwcm9qZWN0L3Rlc3QnLCB0ZXh0OiAnXHU1MzU1XHU1MTQzXHU2RDRCXHU4QkQ1JyB9LFxuICAgICAgICB7IGxpbms6ICdwcm9qZWN0L3RhaWx3aW5kY3NzJywgdGV4dDogJ1RhaWx3aW5kIENTUycgfSxcbiAgICAgICAgeyBsaW5rOiAncHJvamVjdC9jaGFuZ2VzZXQnLCB0ZXh0OiAnQ2hhbmdlc2V0JyB9LFxuICAgICAgICB7IGxpbms6ICdwcm9qZWN0L3ZpdGUnLCB0ZXh0OiAnVml0ZSBDb25maWcnIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogJ1x1NTE3Nlx1NEVENicsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IGxpbms6ICdvdGhlci9wcm9qZWN0LXVwZGF0ZScsIHRleHQ6ICdcdTk4NzlcdTc2RUVcdTY2RjRcdTY1QjAnIH0sXG4gICAgICAgIHsgbGluazogJ290aGVyL3JlbW92ZS1jb2RlJywgdGV4dDogJ1x1NzlGQlx1OTY2NFx1NEVFM1x1NzgwMScgfSxcbiAgICAgICAgeyBsaW5rOiAnb3RoZXIvZmFxJywgdGV4dDogJ1x1NUUzOFx1ODlDMVx1OTVFRVx1OTg5OCcgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgXTtcbn1cblxuZnVuY3Rpb24gc2lkZWJhckNvbW1lcmNpYWwoKTogRGVmYXVsdFRoZW1lLlNpZGViYXJJdGVtW10ge1xuICByZXR1cm4gW1xuICAgIHtcbiAgICAgIGxpbms6ICdjb21tdW5pdHknLFxuICAgICAgdGV4dDogJ1x1NEVBNFx1NkQ0MVx1N0ZBNCcsXG4gICAgfSxcbiAgICB7XG4gICAgICBsaW5rOiAndGVjaG5pY2FsLXN1cHBvcnQnLFxuICAgICAgdGV4dDogJ1x1NjI4MFx1NjcyRlx1NjUyRlx1NjMwMScsXG4gICAgfSxcbiAgICB7XG4gICAgICBsaW5rOiAnY3VzdG9taXplZCcsXG4gICAgICB0ZXh0OiAnXHU1QjlBXHU1MjM2XHU1RjAwXHU1M0QxJyxcbiAgICB9LFxuICBdO1xufVxuXG5mdW5jdGlvbiBzaWRlYmFyQ29tcG9uZW50cygpOiBEZWZhdWx0VGhlbWUuU2lkZWJhckl0ZW1bXSB7XG4gIHJldHVybiBbXG4gICAge1xuICAgICAgdGV4dDogJ1x1N0VDNFx1NEVGNicsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgbGluazogJ2ludHJvZHVjdGlvbicsXG4gICAgICAgICAgdGV4dDogJ1x1NEVDQlx1N0VDRCcsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgIHRleHQ6ICdcdTVFMDNcdTVDNDBcdTdFQzRcdTRFRjYnLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGxpbms6ICdsYXlvdXQtdWkvcGFnZScsXG4gICAgICAgICAgdGV4dDogJ1BhZ2UgXHU5ODc1XHU5NzYyJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgdGV4dDogJ1x1OTAxQVx1NzUyOFx1N0VDNFx1NEVGNicsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgbGluazogJ2NvbW1vbi11aS92YmVuLWFwaS1jb21wb25lbnQnLFxuICAgICAgICAgIHRleHQ6ICdBcGlDb21wb25lbnQgQXBpXHU3RUM0XHU0RUY2XHU1MzA1XHU4OEM1XHU1NjY4JyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxpbms6ICdjb21tb24tdWkvdmJlbi1hbGVydCcsXG4gICAgICAgICAgdGV4dDogJ0FsZXJ0IFx1OEY3Qlx1OTFDRlx1NjNEMFx1NzkzQVx1Njg0NicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsaW5rOiAnY29tbW9uLXVpL3ZiZW4tbW9kYWwnLFxuICAgICAgICAgIHRleHQ6ICdNb2RhbCBcdTZBMjFcdTYwMDFcdTY4NDYnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGluazogJ2NvbW1vbi11aS92YmVuLWRyYXdlcicsXG4gICAgICAgICAgdGV4dDogJ0RyYXdlciBcdTYyQkRcdTVDNDknLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGluazogJ2NvbW1vbi11aS92YmVuLWZvcm0nLFxuICAgICAgICAgIHRleHQ6ICdGb3JtIFx1ODg2OFx1NTM1NScsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsaW5rOiAnY29tbW9uLXVpL3ZiZW4tdnhlLXRhYmxlJyxcbiAgICAgICAgICB0ZXh0OiAnVnhlIFRhYmxlIFx1ODg2OFx1NjgzQycsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsaW5rOiAnY29tbW9uLXVpL3ZiZW4tY291bnQtdG8tYW5pbWF0b3InLFxuICAgICAgICAgIHRleHQ6ICdDb3VudFRvQW5pbWF0b3IgXHU2NTcwXHU1QjU3XHU1MkE4XHU3NTNCJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxpbms6ICdjb21tb24tdWkvdmJlbi1lbGxpcHNpcy10ZXh0JyxcbiAgICAgICAgICB0ZXh0OiAnRWxsaXBzaXNUZXh0IFx1NzcwMVx1NzU2NVx1NjU4N1x1NjcyQycsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF07XG59XG5cbmZ1bmN0aW9uIG5hdigpOiBEZWZhdWx0VGhlbWUuTmF2SXRlbVtdIHtcbiAgcmV0dXJuIFtcbiAgXTtcbn1cblxuZXhwb3J0IGNvbnN0IHNlYXJjaDogRGVmYXVsdFRoZW1lLkFsZ29saWFTZWFyY2hPcHRpb25zWydsb2NhbGVzJ10gPSB7XG4gIHJvb3Q6IHtcbiAgICBwbGFjZWhvbGRlcjogJ1x1NjQxQ1x1N0QyMlx1NjU4N1x1Njg2MycsXG4gICAgdHJhbnNsYXRpb25zOiB7XG4gICAgICBidXR0b246IHtcbiAgICAgICAgYnV0dG9uQXJpYUxhYmVsOiAnXHU2NDFDXHU3RDIyXHU2NTg3XHU2ODYzJyxcbiAgICAgICAgYnV0dG9uVGV4dDogJ1x1NjQxQ1x1N0QyMlx1NjU4N1x1Njg2MycsXG4gICAgICB9LFxuICAgICAgbW9kYWw6IHtcbiAgICAgICAgZXJyb3JTY3JlZW46IHtcbiAgICAgICAgICBoZWxwVGV4dDogJ1x1NEY2MFx1NTNFRlx1ODBGRFx1OTcwMFx1ODk4MVx1NjhDMFx1NjdFNVx1NEY2MFx1NzY4NFx1N0Y1MVx1N0VEQ1x1OEZERVx1NjNBNScsXG4gICAgICAgICAgdGl0bGVUZXh0OiAnXHU2NUUwXHU2Q0Q1XHU4M0I3XHU1M0Q2XHU3RUQzXHU2NzlDJyxcbiAgICAgICAgfSxcbiAgICAgICAgZm9vdGVyOiB7XG4gICAgICAgICAgY2xvc2VUZXh0OiAnXHU1MTczXHU5NUVEJyxcbiAgICAgICAgICBuYXZpZ2F0ZVRleHQ6ICdcdTUyMDdcdTYzNjInLFxuICAgICAgICAgIHNlYXJjaEJ5VGV4dDogJ1x1NjQxQ1x1N0QyMlx1NjNEMFx1NEY5Qlx1ODAwNScsXG4gICAgICAgICAgc2VsZWN0VGV4dDogJ1x1OTAwOVx1NjJFOScsXG4gICAgICAgIH0sXG4gICAgICAgIG5vUmVzdWx0c1NjcmVlbjoge1xuICAgICAgICAgIG5vUmVzdWx0c1RleHQ6ICdcdTY1RTBcdTZDRDVcdTYyN0VcdTUyMzBcdTc2RjhcdTUxNzNcdTdFRDNcdTY3OUMnLFxuICAgICAgICAgIHJlcG9ydE1pc3NpbmdSZXN1bHRzTGlua1RleHQ6ICdcdTcwQjlcdTUxRkJcdTUzQ0RcdTk5ODgnLFxuICAgICAgICAgIHJlcG9ydE1pc3NpbmdSZXN1bHRzVGV4dDogJ1x1NEY2MFx1OEJBNFx1NEUzQVx1OEJFNVx1NjdFNVx1OEJFMlx1NUU5NFx1OEJFNVx1NjcwOVx1N0VEM1x1Njc5Q1x1RkYxRicsXG4gICAgICAgICAgc3VnZ2VzdGVkUXVlcnlUZXh0OiAnXHU0RjYwXHU1M0VGXHU0RUU1XHU1QzFEXHU4QkQ1XHU2N0U1XHU4QkUyJyxcbiAgICAgICAgfSxcbiAgICAgICAgc2VhcmNoQm94OiB7XG4gICAgICAgICAgY2FuY2VsQnV0dG9uQXJpYUxhYmVsOiAnXHU1M0Q2XHU2RDg4JyxcbiAgICAgICAgICBjYW5jZWxCdXR0b25UZXh0OiAnXHU1M0Q2XHU2RDg4JyxcbiAgICAgICAgICByZXNldEJ1dHRvbkFyaWFMYWJlbDogJ1x1NkUwNVx1OTY2NFx1NjdFNVx1OEJFMlx1Njc2MVx1NEVGNicsXG4gICAgICAgICAgcmVzZXRCdXR0b25UaXRsZTogJ1x1NkUwNVx1OTY2NFx1NjdFNVx1OEJFMlx1Njc2MVx1NEVGNicsXG4gICAgICAgIH0sXG4gICAgICAgIHN0YXJ0U2NyZWVuOiB7XG4gICAgICAgICAgZmF2b3JpdGVTZWFyY2hlc1RpdGxlOiAnXHU2NTM2XHU4NUNGJyxcbiAgICAgICAgICBub1JlY2VudFNlYXJjaGVzVGV4dDogJ1x1NkNBMVx1NjcwOVx1NjQxQ1x1N0QyMlx1NTM4Nlx1NTNGMicsXG4gICAgICAgICAgcmVjZW50U2VhcmNoZXNUaXRsZTogJ1x1NjQxQ1x1N0QyMlx1NTM4Nlx1NTNGMicsXG4gICAgICAgICAgcmVtb3ZlRmF2b3JpdGVTZWFyY2hCdXR0b25UaXRsZTogJ1x1NEVDRVx1NjUzNlx1ODVDRlx1NEUyRFx1NzlGQlx1OTY2NCcsXG4gICAgICAgICAgcmVtb3ZlUmVjZW50U2VhcmNoQnV0dG9uVGl0bGU6ICdcdTRFQ0VcdTY0MUNcdTdEMjJcdTUzODZcdTUzRjJcdTRFMkRcdTc5RkJcdTk2NjQnLFxuICAgICAgICAgIHNhdmVSZWNlbnRTZWFyY2hCdXR0b25UaXRsZTogJ1x1NEZERFx1NUI1OFx1ODFGM1x1NjQxQ1x1N0QyMlx1NTM4Nlx1NTNGMicsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzUyxTQUFTLGVBQWU7QUFDOVQsU0FBUyw2QkFBNkI7OztBQ0N0QyxTQUFTLG9CQUFvQjs7O0FDQTNCLGNBQVc7OztBRElOLElBQU0sS0FBSyxhQUFhO0FBQUEsRUFDN0IsYUFB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QUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNMO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixPQUFPO0FBQUEsWUFDTDtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsWUFDQTtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE9BQU87QUFBQSxZQUNMO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBS0Y7QUFDRjs7O0FFbk9BLFNBQVMsZUFBZTtBQUV4QjtBQUFBLEVBQ0U7QUFBQSxFQUNBO0FBQUEsT0FDSztBQUVQO0FBQUEsRUFD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QUEsTUFDUCxjQUFjLENBQUMsMENBQTBDO0FBQUEsTUFDekQsK0JBQStCLElBQUksT0FBTztBQUFBLElBQzVDO0FBQUEsRUFDRjtBQUNGOzs7QUhwS0EsSUFBTyxnQkFBUTtBQUFBLEVBQ2Isc0JBQXNCO0FBQUEsSUFDcEIsR0FBRztBQUFBLElBQ0gsU0FBUztBQUFBLE1BQ1AsSUFBSTtBQUFBLFFBQ0YsT0FBTztBQUFBLFFBQ1AsTUFBTTtBQUFBLFFBQ04sTUFBTTtBQUFBLFFBQ04sR0FBRztBQUFBLE1BQ0w7QUFBQSxNQUNBLE1BQU07QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLE1BQU07QUFBQSxRQUNOLEdBQUc7QUFBQSxNQUNMO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUNIOyIsCiAgIm5hbWVzIjogWyJkZWZpbmVDb25maWciLCAiZGVmaW5lQ29uZmlnIiwgImRlZmluZUNvbmZpZyIsICJuYXYiLCAic2lkZWJhckNvbW1lcmNpYWwiLCAic2lkZWJhckd1aWRlIiwgImRlZmluZUNvbmZpZyJdCn0K
