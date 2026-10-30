import { HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";

const ruDate = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const ruPlural = new Intl.PluralRules("ru-RU");

// Адрес сайта с префиксом пути, при сборке на GitHub его передаёт deploy.yml
const siteUrl = process.env.SITE_URL || "http://localhost:8080/";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });

  // Подставляет префикс пути (/web_aroma/) во все ссылки при сборке для GitHub Pages
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "posts", limit: 20 },
    metadata: {
      language: "ru",
      title: "Эфирика",
      subtitle: "Статьи об эфирных маслах",
      base: siteUrl,
      author: { name: "Эфирика" },
    },
  });

  // Все статьи из src/stati, от старых к новым
  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/stati/*.md").sort((a, b) => a.date - b.date)
  );

  // Неразрывный пробел перед тире, чтобы тире не переносилось в начало строки
  eleventyConfig.addTransform("typography", function (content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;
    return content.replace(/ —/g, " —");
  });

  // «26 октября 2026» без «г.» в конце
  eleventyConfig.addFilter("ruDate", (date) => ruDate.format(date).replace(/\s*г\.$/, ""));
  eleventyConfig.addFilter("isoDate", (date) => date.toISOString().slice(0, 10));
  // Полный адрес для превью ссылок: мессенджеры не понимают адреса от корня вроде /stati/lavanda/
  eleventyConfig.addFilter("fullUrl", (url) => new URL(url.replace(/^\//, ""), siteUrl).href);
  eleventyConfig.addFilter("byNote", (posts, note) => posts.filter((p) => p.data.note === note));

  // «1 минута», «3 минуты», «5 минут»
  eleventyConfig.addFilter("plural", (n, one, few, many) => {
    const form = ruPlural.select(n);
    return form === "one" ? one : form === "few" ? few : many;
  });

  eleventyConfig.addFilter("readingTime", (html = "") => {
    const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 180));
  });
}

export const config = {
  dir: {
    input: "src",
    output: "_site",
    includes: "_includes",
    data: "_data",
  },
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
};
