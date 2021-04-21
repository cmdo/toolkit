// eslint-disable-next-line no-undef
const { tailwindExtractor } = require("tailwindcss/lib/lib/purgeUnusedStyles");
// eslint-disable-next-line no-undef
const colors = require("tailwindcss/colors");

// eslint-disable-next-line no-undef
module.exports = {
  purge: {
    content: [
      "./src/**/*.{html,js,svelte,ts}",
    ],
    options: {
      defaultExtractor: (content) => [
        ...tailwindExtractor(content),
        // Match Svelte class: directives (https://github.com/tailwindlabs/tailwindcss/discussions/1731)
        // eslint-disable-next-line no-unused-vars
        ...[...content.matchAll(/(?:class:)*([\w\d-/:%.]+)/gm)].map(([_match, group, ..._rest]) => {
          return group;
        })
      ],
      keyframes: true
    }
  },
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        rose: colors.rose
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: [
    // eslint-disable-next-line no-undef
    require("@tailwindcss/forms")
  ]
};

