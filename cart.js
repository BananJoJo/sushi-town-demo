(() => {
  const get = id => document.getElementById(id);
  const cart = get("cart"), opener = get("cart-open"), rows = get("cart-items");
  const preview = get("order-preview"), draft = get("order-draft");
  const cards = [...document.querySelectorAll("[data-price]")];
  const items = cards.map(card => ({ name: card.querySelector("h3").textContent, price: Number(card.dataset.price), qty: 0 }));
  const money = amount => new Intl.NumberFormat("ru-RU").format(amount) + " ₽";
  function render() {
    const active = document.activeElement;
    const key = rows.contains(active) ? active.dataset.key : null;
    rows.replaceChildren();
    let total = 0, count = 0;
    const lines = [];
    items.forEach(({ name, price, qty }, index) => {
      if (!qty) return;
      count += qty;
      total += price * qty;
      lines.push(`${name} × ${qty} — ${money(price * qty)}`);
      const row = document.createElement("li"), text = document.createElement("span"), step = document.createElement("div");
      text.textContent = `${name} · ${money(price * qty)}`;
      step.className = "step";
      const control = delta => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = delta < 0 ? "−" : "+";
        button.dataset.key = `${index}:${delta}`;
        button.setAttribute("aria-label", `${delta < 0 ? "Убрать порцию" : "Добавить порцию"}: ${name}`);
        button.addEventListener("click", () => change(index, delta));
        return button;
      };
      step.append(control(-1), String(qty), control(1));
      row.append(text, step);
      rows.append(row);
    });
    get("cart-summary").textContent = `${count} · ${money(total)}`;
    get("cart-total").textContent = money(total);
    get("cart-empty").hidden = count > 0;
    get("cart-checkout").hidden = !count;
    if (!count) { draft.hidden = true; preview.setAttribute("aria-expanded", "false"); preview.textContent = "Показать текст заказа"; }
    get("order-text").textContent = ["Заказ Sushi Town", "", ...lines, "", `Итого: ${money(total)}`].join("\n");
    if (key) (rows.querySelector(`[data-key="${key}"]`) || rows.querySelector("button") || cart.querySelector("button")).focus();
  }
  function change(index, delta) {
    const item = items[index];
    item.qty = Math.max(0, item.qty + delta);
    cards[index].querySelector("button").textContent = item.qty ? `+ Ещё (${item.qty})` : "Добавить";
    get("cart-status").textContent = `${item.name}: ${item.qty} в корзине`;
    render();
    if (matchMedia("(prefers-reduced-motion: no-preference)").matches) opener.animate([{scale: 1}, {scale: 1.08}, {scale: 1}], 290);
  }
  cards.forEach((card, index) => {
    const button = card.querySelector("button");
    button.setAttribute("aria-label", `Добавить: ${items[index].name}`);
    button.addEventListener("click", () => change(index, 1));
  });
  opener.addEventListener("click", () => cart.showModal());
  preview.addEventListener("click", () => {
    draft.hidden = !draft.hidden;
    preview.setAttribute("aria-expanded", String(!draft.hidden));
    preview.textContent = draft.hidden ? "Показать текст заказа" : "Скрыть текст заказа";
  });
  opener.hidden = false;
  render();
  if ("IntersectionObserver" in window && matchMedia("(prefers-reduced-motion: no-preference)").matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(({target, isIntersecting}) => {
      if (isIntersecting) { target.classList.add("arrived"); observer.unobserve(target); }
    }), {threshold: .18});
    cards.forEach(card => observer.observe(card));
  }
})();
