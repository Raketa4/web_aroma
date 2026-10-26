// Общие настройки для всех статей в этой папке.
// Статья с `draft: true` видна при локальном просмотре, но не попадает на опубликованный сайт.
const isBuild = process.env.ELEVENTY_RUN_MODE === "build";

export default {
  layout: "layouts/post.njk",
  eleventyComputed: {
    permalink: (data) => (data.draft && isBuild ? false : `/stati/${data.page.fileSlug}/`),
    eleventyExcludeFromCollections: (data) => Boolean(data.draft && isBuild),
  },
};
