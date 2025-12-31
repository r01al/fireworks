const STYLE_ID = "fw-styles";

const ensureStyles = () => {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .fw-overlay {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .fw-particle {
      position: absolute;
      border-radius: 999px;
      transform: translate(0, 0) scale(1);
      opacity: 1;
      transition-property: transform, opacity;
      transition-timing-function: cubic-bezier(0.1, 0.8, 0.3, 1), linear;
    }
  `;

  document.head.appendChild(style);
};

export { ensureStyles };
