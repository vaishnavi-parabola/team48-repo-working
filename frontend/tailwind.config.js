import basePreset from "@shadcn-ui/tailwind-preset";
const animate = require("tailwind-animate");

module.exports = {
  presets: [basePreset],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [animate],
};
