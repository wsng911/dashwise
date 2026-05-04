/** Loads font dynamically via CSS */
export function loadFont(font名称: string, fontPath?: string) {
  if (typeof document === "undefined") return;

  const safeId = `font-${font名称.replace(/\s+/g, "-")}`;
  // Skip if already injected
  if (document.getElementById(safeId)) return;

  const style = document.createElement("style");
  style.id = safeId;
  style.textContent = `
    @font-face {
      font-family: "${font名称}";
      src: url("${fontPath || ""}") format('truetype');
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}