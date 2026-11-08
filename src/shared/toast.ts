export interface ToastOptions {
  title: string;
  detail?: string;
  tone?: "success" | "error";
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Shows a small confirmation pill at the bottom of the page.
 *
 * IMPORTANT: this function must stay fully self-contained (no imports, no
 * references to module scope) because the service worker injects it into
 * tabs with chrome.scripting.executeScript({ func: showToast }).
 */
export function showToast(options: ToastOptions): void {
  const HOST_ID = "fxeverything-toast-host";
  const doc = document;
  if (!doc.documentElement) return;

  doc.getElementById(HOST_ID)?.remove();

  const host = doc.createElement("div");
  host.id = HOST_ID;
  host.style.cssText = "all:initial;";
  host.style.setProperty("position", "fixed", "important");
  host.style.setProperty("top", "16px", "important");
  host.style.setProperty("right", "16px", "important");
  host.style.setProperty("left", "auto", "important");
  host.style.setProperty("bottom", "auto", "important");
  host.style.setProperty("z-index", "2147483647", "important");
  host.style.setProperty("display", "block", "important");
  host.style.setProperty("pointer-events", "none", "important");
  const root = host.attachShadow({ mode: "closed" });

  const isError = options.tone === "error";
  const style = doc.createElement("style");
  // Same achromatic language as the popup: ink on white, a 1px edge, and a
  // shadow only because this floats above the page. Follows the OS theme.
  style.textContent = `
    .toast {
      --surface: #ffffff; --ink: #0a0a0a; --muted: #6b6b6b; --border: #e6e6e6;
      --raised: #eeeeee; --raised-hover: #e2e2e2; --mark: ${isError ? "#c4242a" : "#0a0a0a"};
      pointer-events: auto;
      display: flex; align-items: center; gap: 10px;
      width: max-content; max-width: min(360px, calc(100vw - 32px));
      padding: 10px 10px 10px 12px;
      border-radius: 8px;
      background: var(--surface); color: var(--ink);
      border: 1px solid var(--border);
      box-shadow: 0 8px 24px rgba(0,0,0,.12);
      font: 500 13px/18px "Geist", "Segoe UI", system-ui, -apple-system, sans-serif;
      animation: fx-in .2s cubic-bezier(.2,.8,.2,1) both;
      transition: opacity .18s ease, transform .18s ease;
    }
    @media (prefers-color-scheme: dark) {
      .toast {
        --surface: #191919; --ink: #ffffff; --muted: #b4b4b4; --border: #2e2e2e;
        --raised: #2a2a2a; --raised-hover: #343434; --mark: ${isError ? "#e5566f" : "#ffffff"};
        box-shadow: 0 8px 24px rgba(0,0,0,.5);
      }
    }
    .toast.hide { opacity: 0; transform: translateX(8px); }
    @keyframes fx-in { from { opacity: 0; transform: translateY(-6px); } }
    .icon { flex: none; display: grid; place-items: center; width: 16px; height: 16px; color: var(--mark); }
    .text { min-width: 0; display: flex; flex-direction: column; }
    .title { white-space: nowrap; }
    .detail {
      font-weight: 400; font-size: 12px; line-height: 16px; color: var(--muted);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    button {
      flex: none; margin-left: 6px; cursor: pointer;
      font: 500 12px/1 "Geist", "Segoe UI", system-ui, -apple-system, sans-serif;
      color: var(--ink); background: var(--raised);
      border: 0; border-radius: 6px; height: 28px; padding: 0 10px;
    }
    button:hover { background: var(--raised-hover); }
    button:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) { .toast { animation: none; transition: none; } }
  `;

  const toast = doc.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  const icon = doc.createElement("span");
  icon.className = "icon";
  // Built with DOM APIs, not innerHTML: sites like YouTube enforce Trusted Types.
  const SVG_NS = "http://www.w3.org/2000/svg";
  const svg = doc.createElementNS(SVG_NS, "svg");
  const iconAttributes: Record<string, string> = {
    width: "14", height: "14", viewBox: "0 0 12 12", fill: "none",
    stroke: "currentColor", "stroke-width": "1.6", "stroke-linecap": "round", "stroke-linejoin": "round",
  };
  for (const name in iconAttributes) svg.setAttribute(name, iconAttributes[name]);
  const path = doc.createElementNS(SVG_NS, "path");
  path.setAttribute("d", isError ? "M6 3v3.5M6 9h.01" : "M2.5 6.2 5 8.5l4.5-5");
  svg.append(path);
  icon.append(svg);

  const text = doc.createElement("span");
  text.className = "text";
  const title = doc.createElement("span");
  title.className = "title";
  title.textContent = options.title;
  text.append(title);
  if (options.detail) {
    const detail = doc.createElement("span");
    detail.className = "detail";
    detail.textContent = options.detail;
    text.append(detail);
  }

  toast.append(icon, text);

  let hideTimer = 0;
  const hide = () => {
    clearTimeout(hideTimer);
    toast.classList.add("hide");
    setTimeout(() => host.remove(), 250);
  };
  const scheduleHide = (delay: number) => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, delay) as unknown as number;
  };

  if (options.actionLabel && options.onAction) {
    const action = doc.createElement("button");
    action.type = "button";
    action.textContent = options.actionLabel;
    const onAction = options.onAction;
    action.addEventListener("click", () => {
      onAction();
      hide();
    });
    toast.append(action);
  }

  toast.addEventListener("mouseenter", () => clearTimeout(hideTimer));
  toast.addEventListener("mouseleave", () => scheduleHide(1800));

  root.append(style, toast);
  doc.documentElement.append(host);
  scheduleHide(options.actionLabel ? 4500 : 2600);
}
