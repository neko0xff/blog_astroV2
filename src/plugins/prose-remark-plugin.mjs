export const proseRemarkPlugin = () => {
	return (_tree, file) => {
		file.data.astro.frontmatter.customProperty = "Generated property";
	};
};
