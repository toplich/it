export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();

    // Поля з форми
    const name = formData.get("name") || "Unbekannt";
    const phone = formData.get("phone") || "Keine Telefonnummer";
    const email = formData.get("email") || "Keine E-Mail";
    const message = formData.get("message") || "Keine Nachricht";

    // Файл з форми
    const file = formData.get("file");

    // Trello API параметри
    const trelloKey = context.env.TRELLO_KEY;
    const trelloToken = context.env.TRELLO_TOKEN;
    const listId = context.env.TRELLO_LIST_ID;

    // === 1. Створюємо картку ===
    const url = `https://api.trello.com/1/cards?key=${trelloKey}&token=${trelloToken}&idList=${listId}`;

    const cardData = {
      name: `Neue Anfrage von ${name}`,
      desc: `**Name:** ${name}
**Telefon:** ${phone}
**Email:** ${email}
**Nachricht:**
${message}`,
    };

    const cardResp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cardData),
    });

    if (!cardResp.ok) {
      return new Response("Fehler beim Erstellen der Karte in Trello", { status: 500 });
    }

    const card = await cardResp.json();
    const cardId = card.id;

    // === 2. Якщо є файл — прикріплюємо його ===
    if (file && file.name && file.size > 0) {
      const uploadUrl = `https://api.trello.com/1/cards/${cardId}/attachments?key=${trelloKey}&token=${trelloToken}`;

      const uploadResp = await fetch(uploadUrl, {
        method: "POST",
        body: (() => {
          const fd = new FormData();
          fd.append("file", file, file.name);
          return fd;
        })(),
      });

      if (!uploadResp.ok) {
        return new Response("Karte erstellt, aber Fehler beim Datei-Upload", { status: 500 });
      }
    }

    // === 3. Відповідь користувачу ===
    return new Response("Danke! Ihre Nachricht wurde gesendet ✅", { status: 200 });

  } catch (err) {
    return new Response("Serverfehler: " + err.message, { status: 500 });
  }
}

