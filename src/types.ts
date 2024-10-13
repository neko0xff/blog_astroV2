import type socialIcons from "@assets/socialIcons";

export type Image = {
  src: string;
  alt?: string;
  caption?: string;
};

export type Site = {
  website: string;
  heroTitle: string;
  author: string;
  avatar?: Image;
  profile: string;
  desc: string;
  title: string;
  ogImage?: string;
  lightAndDarkMode: boolean;
  postPerIndex: number;
  postPerPage: number;
  scheduledPostMargin: number;
};

export type SocialObjects = {
  name: keyof typeof socialIcons;
  href: string;
  active: boolean;
  linkTitle: string;
}[];
