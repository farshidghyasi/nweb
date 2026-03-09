/**
 * Vercel Serverless Function: Create Odoo CRM Lead from Contact Form
 *
 * Receives form data from the website contact form and creates a new lead
 * in Odoo CRM using the JSON-RPC API.
 *
 * Environment Variables (set in Vercel):
 *   ODOO_URL       - Odoo instance URL (e.g. https://netlinks-erp.odoo.com)
 *   ODOO_DB        - Odoo database name
 *   ODOO_USERNAME  - Odoo user email
 *   ODOO_API_KEY   - Odoo API key
 */

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { name, email, company, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required.",
      });
    }

    const ODOO_URL = process.env.ODOO_URL;
    const ODOO_DB = process.env.ODOO_DB;
    const ODOO_USERNAME = process.env.ODOO_USERNAME;
    const ODOO_API_KEY = process.env.ODOO_API_KEY;

    if (!ODOO_URL || !ODOO_DB || !ODOO_USERNAME || !ODOO_API_KEY) {
      console.error("Missing Odoo environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
      });
    }

    // Step 1: Authenticate with Odoo to get uid
    const authResponse = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "common",
          method: "authenticate",
          args: [ODOO_DB, ODOO_USERNAME, ODOO_API_KEY, {}],
        },
      }),
    });

    const authData = await authResponse.json();
    const uid = authData.result;

    if (!uid) {
      console.error("Odoo authentication failed:", authData);
      return res.status(500).json({
        success: false,
        message: "Failed to connect to CRM.",
      });
    }

    // Step 2: Create lead in crm.lead
    const leadDescription = [
      `Name: ${name}`,
      `Email: ${email}`,
      company ? `Company: ${company}` : null,
      phone ? `Phone: ${phone}` : null,
      ``,
      `Message:`,
      message,
      ``,
      `---`,
      `Submitted from: netlinks.net contact form`,
      `Date: ${new Date().toISOString()}`,
    ]
      .filter(Boolean)
      .join("\n");

    const createResponse = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "object",
          method: "execute_kw",
          args: [
            ODOO_DB,
            uid,
            ODOO_API_KEY,
            "crm.lead",
            "create",
            [
              {
                name: `Website Inquiry: ${name}`,
                contact_name: name,
                email_from: email,
                phone: phone || false,
                partner_name: company || false,
                description: leadDescription,
                type: "lead",
                website: "https://www.netlinks.net",
              },
            ],
          ],
        },
      }),
    });

    const createData = await createResponse.json();

    if (createData.error) {
      console.error("Odoo lead creation error:", createData.error);
      return res.status(500).json({
        success: false,
        message: "Failed to create lead. Please try again.",
      });
    }

    const leadId = createData.result;
    console.log(`✅ Lead created in Odoo CRM: ID ${leadId}`);

    return res.status(200).json({
      success: "true",
      message: "Thank you! Your inquiry has been received. We'll get back to you shortly.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again or email us directly at info@netlinks.net.",
    });
  }
}
