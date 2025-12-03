const production = process.env.NODE_ENV === "production";

export default {
  plugins: {
    ...(production && { '@tailwindcss/postcss': {} }),
    ...(production && { autoprefixer: {} }),
  },
};