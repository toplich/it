// form.js – ядро для відправки форм на Worker через /submit
const WORKER_URL = "/submit"; // 👈 Тепер через Route, а не workers.dev

document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form[data-form]");

  forms.forEach(form => {
    const fb = form.querySelector(".form-feedback");

    form.addEventListener("submit", async e => {
      e.preventDefault();

      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());

      try {
        const resp = await fetch(WORKER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const text = await resp.text();
        if (fb) {
          fb.style.display = "block";
          fb.textContent = resp.ok ? "✅ Danke!" : `❌ Fehler: ${text}`;
          fb.style.color = resp.ok ? "green" : "red";
        }

        if (resp.ok) form.reset();
      } catch (err) {
        if (fb) {
          fb.style.display = "block";
          fb.style.color = "red";
          fb.textContent = `❌ Fehler: ${err.message}`;
        }
      }
    });
  });
});

