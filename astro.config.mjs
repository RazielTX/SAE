// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { unified } from "@astrojs/markdown-remark";

import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Dominantes Secundarias",
      logo: {
        src: "./src/assets/logo-gea.svg",
      },
      defaultLocale: "es-US",
      social: [
        {
          icon: "instagram",
          label: "GEA",
          href: "https://www.instagram.com/geaunalbog/",
        },
        {
          icon: "whatsApp",
          label: "Canal de WhatsApp",
          href: "https://whatsapp.com/channel/0029Vb88sJr5Ui2dLkDcNP3p",
        },
      ],
      head: [
        {
          tag: "link",
          attrs: {
            rel: "stylesheet",
            href: "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css",
            integrity:
              "sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn",
            crossorigin: "anonymous",
          },
        },
      ],
      sidebar: [
        {
          label: "Módulo 1",
          items: [{ autogenerate: { directory: "modulo-1" } }],
        },
        // {
        //   label: "Módulo 2",
        //   items: [{ autogenerate: { directory: "modulo-2" } }],
        // },
        // {
        //   label: "Módulo 3",
        //   items: [{ autogenerate: { directory: "modulo-3" } }],
        // },
        // {
        //   label: "Módulo 4",
        //   items: [{ autogenerate: { directory: "modulo-4" } }],
        // },
        // {
        //   label: "Módulo 5",
        //   items: [{ autogenerate: { directory: "modulo-5" } }],
        // },
        // {
        //   label: "Módulo 6",
        //   items: [{ autogenerate: { directory: "modulo-6" } }],
        // },
      ],
    }),

    preact(),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
});
