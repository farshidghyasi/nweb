import type { APIRoute } from "astro";

export const prerender = false;

// ─── Odoo lead creation via JSON-RPC ─────────────────────────────────────────
async function createOdooLead(fields: {
  name: string;
  email: string;
  company?: string;
  position?: string;
  phone?: string;
  industry?: string;
  interests?: string;
  message?: string;
}) {
  const url      = (process.env.ODOO_URL      || import.meta.env.ODOO_URL      || "https://netlinks-erp.odoo.com").trim();
  const db       = (process.env.ODOO_DB       || import.meta.env.ODOO_DB       || "netlinksaf-netlinks-erp-v15-main-6588773").trim();
  const username = (process.env.ODOO_USERNAME  || import.meta.env.ODOO_USERNAME || "afghyasi@netlinks.net").trim();
  const apiKey   = (process.env.ODOO_API_KEY   || import.meta.env.ODOO_API_KEY  || "").trim();

  if (!apiKey) throw new Error("ODOO_API_KEY env var not set");

  // Step 1: authenticate → get uid
  const authRes = await fetch(`${url}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      id: 1,
      params: {
        service: "common",
        method: "authenticate",
        args: [db, username, apiKey, {}],
      },
    }),
  });

  if (!authRes.ok) {
    throw new Error(`Odoo auth HTTP ${authRes.status}`);
  }

  const authJson = await authRes.json();
  if (authJson.error) {
    throw new Error(
      `Odoo auth error: ${authJson.error?.data?.message || JSON.stringify(authJson.error)}`
    );
  }

  const uid = authJson.result;
  if (!uid) throw new Error("Odoo auth failed: invalid credentials or API key");

  // Step 2: create crm.lead
  const { name, email, phone, company, position, industry, interests, message } = fields;
  const leadTitle = `Website Inquiry: ${name}${interests ? ` — ${interests.split(", ").slice(0, 2).join(", ")}` : ""}`;
  const notes = [
    message || "",
    interests ? `\nInterested in: ${interests}` : "",
    industry ? `Industry: ${industry}` : "",
    position ? `Job Position: ${position}` : "",
    company ? `Company: ${company}` : "",
    phone ? `Phone: ${phone}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const createRes = await fetch(`${url}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      id: 2,
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          db,
          uid,
          apiKey,
          "crm.lead",
          "create",
          [
            {
              name: leadTitle,
              contact_name: name,
              email_from: email,
              phone: phone || "",
              partner_name: company || "",
              function: position || "",
              description: notes,
              type: "lead",
            },
          ],
          {},
        ],
      },
    }),
  });

  if (!createRes.ok) {
    const text = await createRes.text().catch(() => "(unreadable)");
    throw new Error(
      `Odoo create HTTP ${createRes.status}: ${text.substring(0, 300)}`
    );
  }

  const createJson = await createRes.json();
  if (createJson.error) {
    throw new Error(
      `Odoo create error: ${createJson.error?.data?.message || JSON.stringify(createJson.error)}`
    );
  }

  return createJson.result; // numeric lead ID
}

// ─── Main handler ────────────────────────────────────────────────────────────
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // ── Anti-spam: honeypot check ─────────────────────────────────────────────
    // If the hidden "website" field has any value, it's a bot
    if (body.website) {
      console.log("[contact] SPAM blocked: honeypot triggered");
      // Return fake success to not tip off the bot
      return new Response(
        JSON.stringify({ success: true, leadId: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Anti-spam: time check ─────────────────────────────────────────────────
    // Reject submissions under 3 seconds from page load
    const formTs = parseInt(body._form_ts || "0", 10);
    if (formTs > 0) {
      const elapsed = Date.now() - formTs;
      if (elapsed < 3000) {
        console.log(`[contact] SPAM blocked: too fast (${elapsed}ms)`);
        return new Response(
          JSON.stringify({ success: true, leadId: 0 }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const company = (body.company || "").trim();
    const position = (body.position || "").trim();
    const phone = (body.phone || "").trim();
    const industry = (body.industry || "").trim();
    const interests = (body.interests || "").trim();
    const message = (body.message || "").trim();

    // Validate required fields
    if (!name || !email) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Please fill in all required fields.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create Odoo lead
    const leadId = await createOdooLead({ name, email, company, position, phone, industry, interests, message });
    console.log(`[contact] Odoo lead ${leadId} created | ${email}`);

    return new Response(
      JSON.stringify({ success: true, leadId }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[contact] Odoo failed:", err.message);
    return new Response(
      JSON.stringify({
        success: false,
        message:
          "There was a problem submitting your inquiry. Please email us directly at info@netlinks.net.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
