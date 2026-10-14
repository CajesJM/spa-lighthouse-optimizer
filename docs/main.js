const tabGroups = [
  { selector: ".console-tabs", attribute: "data-panel", prefix: "panel-" },
  {
    selector: ".install-tabs",
    attribute: "data-install",
    prefix: "install-panel-",
  },
];

for (const { selector, attribute, prefix } of tabGroups) {
  const list = document.querySelector(selector);
  if (!list) continue;
  const tabs = [...list.querySelectorAll('[role="tab"]')];

  function activate(tab, focus = false) {
    for (const item of tabs) {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(
        `${prefix}${item.getAttribute(attribute)}`,
      ).hidden = !selected;
    }
    if (focus) tab.focus();
    if (selector === ".install-tabs") resetCopyLabel();
  }

  list.addEventListener("click", (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (tab && list.contains(tab)) activate(tab);
  });

  list.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const current = tabs.indexOf(document.activeElement);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
            tabs.length;
    activate(tabs[next], true);
  });
}

const copyButton = document.querySelector(".copy-button");
const copyLabel = document.querySelector(".copy-label");
const installCommands = {
  npm: "npx spa-lighthouse-optimizer",
  yarn: "yarn dlx spa-lighthouse-optimizer",
  source: "npm ci\nnode scripts/install.mjs",
};
let copyResetTimer;

function resetCopyLabel() {
  if (!copyLabel) return;
  clearTimeout(copyResetTimer);
  copyLabel.textContent = "Copy command";
}

copyButton?.addEventListener("click", async () => {
  const selected = document.querySelector(
    '.install-tabs [aria-selected="true"]',
  );
  const command = installCommands[selected?.dataset.install];
  if (!command) return;
  try {
    await navigator.clipboard.writeText(command);
    copyLabel.textContent = "Copied";
  } catch {
    copyLabel.textContent = "Select the command above to copy";
  }
  clearTimeout(copyResetTimer);
  copyResetTimer = setTimeout(resetCopyLabel, 3500);
});

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

function closeMenu() {
  siteNav?.classList.remove("is-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation");
}

menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  siteNav.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
});

siteNav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuToggle?.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuToggle.focus();
  }
});
