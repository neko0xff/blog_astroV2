/**
 * Data definition and list of friend links.
 *
 * @module data/links
 */

/** Represents a single friend link entry. */
export interface Link {
  /** Display name of the person or site owner */
  name: string;
  /** Name of the linked site */
  site: string;
  /** URL of the linked site */
  siteURL: string;
  /** URL of the avatar/icon image */
  icon: string;
}

/** All friend links displayed on the /links page. */
export const LINKS: Link[] = [
  {
    name: "Mikan",
    site: "Aaki's Notebook",
    siteURL: "https://blog.mikan.ac.cn",
    icon:
      "https://gravatar.loli.net/avatar/da416f8013b9815f1e1c81754fffd701?s=300",
  },
  {
    name: "Alpha UMi",
    site: "Cynosura",
    siteURL: "https://cynosura.one/",
    icon: "https://cynosura.one/img/avatar.webp",
  },
  {
    name: "高科技大脑指挥部",
    site: "高科技的指挥中心",
    siteURL: "https://blog.hightechbrain.net/",
    icon: "https://blog.hightechbrain.net/img/avatar.png",
  },
  {
    name: "Oさんです",
    site: "minetaro12",
    siteURL: "https://0sn.net",
    icon: "https://0sn.net/img/saber.png",
  },
];
