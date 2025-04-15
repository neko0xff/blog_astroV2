export const SITE = {
  website: "https://neko-0xff-blog.deno.dev", // replace this with your deployed domain
  heroTitle: "<span class='name'>Neko_oxff</span> Tech Blog",
  author: "neko0xff",
  avatar: {
    src: "https://avatars.githubusercontent.com/u/54382007",
    alt: "neko0xff",
  },
  profile: "https://neko-0xff-blog.deno.dev",
  desc: "該Blog會存放自己寫的技術文章!",
  title: "Neko0xff tech blog",
  ogImage: "webView.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: true,
    text: "提出修改建議",
    icon: "pencil",
    url: "https://github.com/neko0xff/blog_astroV2/issues",
  },
  dynamicOgImage: true,
  lang: "zh-TW", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Taipei", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
