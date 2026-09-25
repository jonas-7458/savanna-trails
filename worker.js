export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle Savanna Trails contact form
    if (request.method === "POST" && url.pathname === "/api/contact") {
      try {
        const data = await request.json();

        const name = String(data.name || "").trim();
        const email = String(data.email || "").trim();
        const interest = String(data.interest || "").trim();
        const destination = String(data.destination || "").trim();
        const message = String(data.message || "").trim();

        if (!name || !email || !message) {
          return Response.json(
            { ok: false, error: "Please complete all required fields." },
            { status: 400 }
          );
        }

        const resendResponse = await fetch(
          "https://api.resend.com/emails",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "Savanna Trails <onboarding@resend.dev>",
              to: ["infosavannatrails@gmail.com"],
              reply_to: email,
              subject: `New Savanna Trails enquiry: ${interest || "General enquiry"}`,
              text:
`New enquiry received from the Savanna Trails website.

Name: ${name}
Email: ${email}
Interest: ${interest}
Destination: ${destination}

Message:
${message}`
            })
          }
        );

        if (!resendResponse.ok) {
          return Response.json(
            { ok: false, error: "Email service error." },
            { status: 502 }
          );
        }

        return Response.json({ ok: true });

      } catch (error) {
        return Response.json(
          { ok: false, error: "Unable to process request." },
          { status: 500 }
        );
      }
    }

    // Serve the Savanna Trails website
    return env.ASSETS.fetch(request);
  }
};
