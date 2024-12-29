import type { Site, SocialObjects } from "./types.ts";

export const SITE: Site = {
	website: "https://neko-0xff-blog.deno.dev", // replace this with your deployed domain
	heroTitle: "<span class='name'>Neko_oxff</span> Tech Blog",
	author: "neko0xff",
	avatar: {
		src: "https://avatars.githubusercontent.com/u/54382007",
		alt: "neko0xff",
	},
	profile: "https://github.com/neko0xff",
	desc: "該Blog會存放自己寫的技術文章!",
	title: "Neko0xff tech blog",
	ogImage: "webView.jpg",
	lightAndDarkMode: true,
  showArchives: true,
	postPerIndex: 4,
	postPerPage: 3,
	scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
	lang: "zh-tw", // html lang code. Set this empty and default will be "en"
	langTag: ["zh-TW"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: true,
  svg: true,
  width: 50,
  height: 46,
};

export const SOCIALS: SocialObjects = [
	{
		name: "Github",
		href: "https://github.com/neko0xff",
		linkTitle: ` ${SITE.title} on Github`,
		active: true,
	},
	{
		name: "Instagram",
		href: "https://www.instagram.com/neko_0xff",
		linkTitle: `${SITE.title} on Instagram`,
		active: true,
	},
	{
		name: "LinkedIn",
		href: "https://www.linkedin.com/in/%E5%B1%95%E9%8A%98-%E8%A8%B1-823b41183/",
		linkTitle: `${SITE.title} on LinkedIn`,
		active: true,
	},
	{
		name: "Mail",
		href: "mailto:chzang55@gmail.com",
		linkTitle: `Send an email to ${SITE.title}`,
		active: true,
	},
	{
		name: "Twitter",
		href: "https://twitter.com/neko_0xff",
		linkTitle: `${SITE.title} on Twitter`,
		active: true,
	},
	{
		name: "Twitch",
		href: "https://discord.com/invite/8bK5Y43Stu",
		linkTitle: `${SITE.title} on Twitch`,
		active: true,
	},
	{
		name: "YouTube",
		href: "https://www.youtube.com/channel/UCfBR43eCo07mPWN6K-97TEA",
		linkTitle: `${SITE.title} on YouTube`,
		active: true,
	},
	{
		name: "WhatsApp",
		href: "https://github.com/satnaing/astro-paper",
		linkTitle: `${SITE.title} on WhatsApp`,
		active: false,
	},
	{
		name: "Snapchat",
		href: "https://github.com/satnaing/astro-paper",
		linkTitle: `${SITE.title} on Snapchat`,
		active: false,
	},
	{
		name: "Pinterest",
		href: "https://github.com/satnaing/astro-paper",
		linkTitle: `${SITE.title} on Pinterest`,
		active: false,
	},
	{
		name: "TikTok",
		href: "https://github.com/satnaing/astro-paper",
		linkTitle: `${SITE.title} on TikTok`,
		active: false,
	},
	{
		name: "CodePen",
		href: "https://github.com/satnaing/astro-paper",
		linkTitle: `${SITE.title} on CodePen`,
		active: false,
	},
	{
		name: "Discord",
		href: "https://github.com/satnaing/astro-paper",
		linkTitle: `${SITE.title} on Discord`,
		active: false,
	},
	{
		name: "GitLab",
		href: "https://github.com/satnaing/astro-paper",
		linkTitle: `${SITE.title} on GitLab`,
		active: false,
	},
	{
		name: "Reddit",
		href: "https://github.com/satnaing/astro-paper",
		linkTitle: `${SITE.title} on Reddit`,
		active: false,
	},
	{
		name: "Skype",
		href: "https://github.com/satnaing/astro-paper",
		linkTitle: `${SITE.title} on Skype`,
		active: false,
	},
	{
		name: "Steam",
		href: "https://github.com/satnaing/astro-paper",
		linkTitle: `${SITE.title} on Steam`,
		active: false,
	},
	{
		name: "Telegram",
		href: "https://t.me/zang_post",
		linkTitle: `${SITE.title} on Telegram`,
		active: true,
	},
	{
		name: "Mastodon",
		href: "https://mas.to/deck/@neko_0xff",
		linkTitle: `${SITE.title} on Mastodon`,
		active: true,
	},
];
