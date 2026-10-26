// Фильтр статей по нотам: клик по ярусу пирамиды оставляет только статьи этой группы.
// Выбранная нота сохраняется в адресе (?note=top), чтобы ссылкой можно было поделиться.
(() => {
  const pyramid = document.querySelector(".pyramid");
  const tiers = document.querySelectorAll("[data-filter]");
  const labels = document.querySelectorAll(".label[data-note]");
  const title = document.getElementById("list-title");
  const empty = document.getElementById("list-empty");
  const reset = document.querySelector("[data-filter-reset]");
  const list = document.getElementById("stati");
  if (!pyramid || !title) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function apply(note) {
    let shown = 0;
    labels.forEach((label) => {
      const match = !note || label.dataset.note === note;
      label.hidden = !match;
      if (match) shown++;
    });

    let name = "Все статьи";
    tiers.forEach((tier) => {
      const active = tier.dataset.filter === note;
      tier.setAttribute("aria-pressed", String(active));
      if (active) name = tier.dataset.name;
    });

    pyramid.toggleAttribute("data-active", Boolean(note));
    title.textContent = name;
    reset.hidden = !note;
    empty.textContent = note ? "В этой группе пока нет статей." : "Здесь пока нет статей.";
    empty.hidden = shown > 0;

    const url = new URL(window.location.href);
    if (note) url.searchParams.set("note", note);
    else url.searchParams.delete("note");
    history.replaceState(null, "", url);
  }

  tiers.forEach((tier) => {
    tier.addEventListener("click", () => {
      const note = tier.getAttribute("aria-pressed") === "true" ? null : tier.dataset.filter;
      apply(note);
      if (note && list.getBoundingClientRect().top > window.innerHeight * 0.8) {
        list.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
  });

  reset.addEventListener("click", () => apply(null));

  const initial = new URLSearchParams(window.location.search).get("note");
  if (initial && [...tiers].some((t) => t.dataset.filter === initial)) apply(initial);
})();
