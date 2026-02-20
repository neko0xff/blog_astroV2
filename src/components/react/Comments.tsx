import Giscus from "@giscus/react";
import * as React from "react";

const id = "inject-comments";


/**
 * 獲得模式切換的狀態
 * @returns   
 */
function getSavedTheme() {
  return globalThis.localStorage.getItem("theme");
}

/**
 * 決定是否切換夜間模式
 * -  Uses the `matchMedia` API to check if the user prefers a dark color scheme.
 * @returns {"dark" | "light"} Returns "dark" if the system prefers a dark theme, otherwise "light".
 */
function getSystemTheme() {
  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

const Comments = () => {
  const [mounted, setMounted] = React.useState(false);
  const [theme, setTheme] = React.useState("light");

  React.useEffect(() => {
    const theme = getSavedTheme() || getSystemTheme();
    setTheme(theme);
    // 監聽使用者是否切換夜間模式
    const observer = new MutationObserver(() => {
      setTheme(getSavedTheme()!);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div id={id} className="w-full">
      {mounted ? (
        <Giscus
          id={id}
          repo="neko0xff/blog_astroV2"
          repoId="R_kgDOMkI6YA"
          category="Announcements"
          categoryId="DIC_kwDOMkI6YM4CjZSo"
          mapping="title"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          lang="zh-TW"
          loading="lazy"
          theme={theme}
        />
      ) : null}
    </div>
  );
};

/* 透過 giscus.app 輸出
<script src="https://giscus.app/client.js"
        data-repo="neko0xff/blog_astroV2"
        data-repo-id="R_kgDOMkI6YA"
        data-category="Announcements"
        data-category-id="DIC_kwDOMkI6YM4CjZSo"
        data-mapping="title"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="top"
        data-theme="dark_dimmed"
        data-lang="zh-TW"
        data-loading="lazy"
        crossorigin="anonymous"
        async>
</script>
*/

export default Comments;
