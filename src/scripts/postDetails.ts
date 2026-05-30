/**
 * Create a scroll progress bar at the top of the page.
 */
function create_progress_bar(): void {
  const progress_container = document.createElement("div");
  progress_container.className =
    "progress-container fixed top-0 z-10 h-1 w-full bg-background";

  const progress_bar = document.createElement("div");
  progress_bar.className = "progress-bar h-1 w-0 bg-accent";
  progress_bar.id = "myBar";

  progress_container.appendChild(progress_bar);
  document.body.appendChild(progress_container);
}

/**
 * Update the progress bar width on scroll.
 */
function update_scroll_progress(): void {
  document.addEventListener("scroll", () => {
    const win_scroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrolled = (win_scroll / height) * 100;
    const bar = document.getElementById("myBar");
    if (bar) {
      bar.style.width = scrolled + "%";
    }
  });
}

/**
 * Attach heading anchor links for easy section sharing.
 */
function add_heading_links(): void {
  const headings = Array.from(
    document.querySelectorAll("h2, h3, h4, h5, h6"),
  );
  for (const heading of headings) {
    heading.classList.add("group");
    const link = document.createElement("a");
    link.className =
      "heading-link ml-2 opacity-0 group-hover:opacity-100 focus:opacity-100";
    link.href = "#" + heading.id;

    const span = document.createElement("span");
    span.ariaHidden = "true";
    span.innerText = "# ";
    link.appendChild(span);
    heading.appendChild(link);
  }
}

/**
 * Attach copy buttons to code blocks.
 */
function attach_copy_buttons(): void {
  const copy_button_label = "Copy";
  const code_blocks = Array.from(document.querySelectorAll("pre"));

  for (const code_block of code_blocks) {
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";

    const copy_button = document.createElement("button");
    copy_button.className =
      "copy-code absolute right-3 -top-3 rounded bg-muted px-2 py-1 text-xs leading-4 text-foreground font-medium";
    copy_button.textContent = copy_button_label;
    code_block.setAttribute("tabindex", "0");
    code_block.appendChild(copy_button);

    // wrap codeblock with relative parent element
    code_block?.parentNode?.insertBefore(wrapper, code_block);
    wrapper.appendChild(code_block);

    copy_button.addEventListener("click", async () => {
      const code = code_block.querySelector("code");
      const text = code?.innerText;
      await navigator.clipboard.writeText(text ?? "");

      // visual feedback
      copy_button.innerText = "Copied";
      setTimeout(() => {
        copy_button.innerText = copy_button_label;
      }, 700);
    });
  }
}

/**
 * Scroll to top when the "Back to Top" button is clicked.
 */
function back_to_top(): void {
  document.querySelector("#back-to-top")?.addEventListener("click", () => {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  });
}

/**
 * Initialize all post-detail page features.
 */
export function init_post_details(): void {
  create_progress_bar();
  update_scroll_progress();
  add_heading_links();
  attach_copy_buttons();
  back_to_top();
}
