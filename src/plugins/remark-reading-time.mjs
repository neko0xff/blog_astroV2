import { toString } from "mdast-util-to-string";
import getReadingTime from "reading-time";

export function remarkReadingTime() {
	return (tree, { data }) => {
		const textOnPage = toString(tree);
		const readingTime = getReadingTime(textOnPage);
		// readingTime.text 会以友好的字符串形式给出阅读时间，例如 "3 min read"。
		data.astro.frontmatter.minutesRead = readingTime.text;
	};
}
