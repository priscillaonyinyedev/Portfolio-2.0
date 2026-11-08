const year = new Date().getFullYear();

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(year);
});

const revealItems = document.querySelectorAll("[data-reveal]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !reduceMotion) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const lightbox = document.querySelector("#project-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxViewport = document.querySelector(".lightbox-image-viewport");
const zoomInButton = document.querySelector("[data-zoom-in]");
const zoomOutButton = document.querySelector("[data-zoom-out]");
const zoomResetButton = document.querySelector("[data-zoom-reset]");
const customCursors = [...document.querySelectorAll(".custom-cursor")];
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
let pointerX = -50;
let pointerY = -50;
let cursorFrame = 0;

const positionCustomCursors = () => {
  const dialogRect = lightbox?.open ? lightbox.getBoundingClientRect() : null;
  customCursors.forEach((cursor) => {
    const insideDialog = cursor.classList.contains("custom-cursor--dialog") && dialogRect;
    const x = insideDialog ? pointerX - dialogRect.left : pointerX;
    const y = insideDialog ? pointerY - dialogRect.top : pointerY;
    cursor.style.setProperty("--cursor-x", `${x}px`);
    cursor.style.setProperty("--cursor-y", `${y}px`);
  });
};

if (lightbox && lightboxImage && lightboxTitle && lightboxClose && lightboxViewport && zoomInButton && zoomOutButton && zoomResetButton) {
  let zoom = 1;
  const setZoom = (value) => {
    zoom = Math.min(3, Math.max(1, value));
    lightboxImage.style.setProperty("--lightbox-zoom", String(zoom));
    zoomResetButton.textContent = `${Math.round(zoom * 100)}%`;
    requestAnimationFrame(() => {
      lightboxViewport.scrollLeft = (lightboxViewport.scrollWidth - lightboxViewport.clientWidth) / 2;
      lightboxViewport.scrollTop = (lightboxViewport.scrollHeight - lightboxViewport.clientHeight) / 2;
    });
  };

  document.querySelectorAll("[data-lightbox]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const image = trigger.querySelector("img");
      if (!image) return;
      setZoom(1);
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt;
      lightboxTitle.textContent = trigger.dataset.projectName || "Project screenshot";
      lightbox.showModal();
      positionCustomCursors();
    });
  });

  zoomInButton.addEventListener("click", () => setZoom(zoom + 0.25));
  zoomOutButton.addEventListener("click", () => setZoom(zoom - 0.25));
  zoomResetButton.addEventListener("click", () => setZoom(1));
  lightboxImage.addEventListener("dblclick", () => setZoom(zoom === 1 ? 2 : 1));

  const closeLightbox = () => lightbox.close();
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener("close", () => {
    lightboxImage.removeAttribute("src");
    setZoom(1);
    positionCustomCursors();
  });
}

if (customCursors.length && finePointer.matches) {
  document.body.classList.add("uses-custom-cursor");

  document.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    customCursors.forEach((cursor) => cursor.classList.add("is-visible"));
    if (cursorFrame) return;
    cursorFrame = requestAnimationFrame(() => {
      cursorFrame = 0;
      positionCustomCursors();
    });
  });

  document.addEventListener("pointerdown", () => customCursors.forEach((cursor) => cursor.classList.add("is-pressed")));
  document.addEventListener("pointerup", () => customCursors.forEach((cursor) => cursor.classList.remove("is-pressed")));
  document.addEventListener("pointerover", (event) => {
    if (event.target instanceof Element && event.target.closest("a, button")) {
      customCursors.forEach((cursor) => cursor.classList.add("is-hovering"));
    }
  });
  document.addEventListener("pointerout", (event) => {
    const targetIsInteractive = event.target instanceof Element && event.target.closest("a, button");
    const nextTargetIsInteractive = event.relatedTarget instanceof Element && event.relatedTarget.closest("a, button");
    if (targetIsInteractive && !nextTargetIsInteractive) {
      customCursors.forEach((cursor) => cursor.classList.remove("is-hovering"));
    }
    if (!event.relatedTarget) customCursors.forEach((cursor) => cursor.classList.remove("is-visible", "is-hovering"));
  });
  window.addEventListener("blur", () => customCursors.forEach((cursor) => cursor.classList.remove("is-visible", "is-hovering", "is-pressed")));
}
