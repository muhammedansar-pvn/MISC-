const { Webhook } = require("svix");
const EmailEvent = require("../models/EmailEvent");

/**
 * Handle Resend Webhook Events
 * Validates Svix signature, enforces idempotency, and logs email delivery lifecycle.
 */
const handleResendWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    // Resend Svix Signature Headers
    const svixId = req.headers["svix-id"];
    const svixTimestamp = req.headers["svix-timestamp"];
    const svixSignature = req.headers["svix-signature"];

    let payload;

    if (webhookSecret) {
      if (!svixId || !svixTimestamp || !svixSignature) {
        return res.status(400).json({ success: false, message: "Missing Svix signature headers" });
      }

      try {
        const wh = new Webhook(webhookSecret);
        // req.body MUST be raw Buffer or raw string for Svix verification
        const rawPayload = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : typeof req.body === "string" ? req.body : JSON.stringify(req.body);
        
        payload = wh.verify(rawPayload, {
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        });
      } catch (err) {
        console.error("[WEBHOOK ERROR] Signature verification failed:", err.message);
        return res.status(401).json({ success: false, message: "Invalid webhook signature" });
      }
    } else {
      // In development mode without webhook secret set
      if (process.env.NODE_ENV === "production") {
        console.error("[WEBHOOK ERROR] RESEND_WEBHOOK_SECRET is required in production environment");
        return res.status(500).json({ success: false, message: "Webhook secret not configured" });
      }
      payload = typeof req.body === "string" || Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString()) : req.body;
    }

    const eventId = svixId || payload.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const eventType = payload.type || "unknown";
    const data = payload.data || {};
    const emailId = data.email_id || data.id;
    const recipient = Array.isArray(data.to) ? data.to[0] : data.to;

    // 1. Webhook Idempotency Check
    const existingEvent = await EmailEvent.findOne({ provider: "resend", eventId });
    if (existingEvent) {
      console.log(`[WEBHOOK RESEND] Duplicate event ignored: ${eventId} (${eventType})`);
      return res.status(200).json({ success: true, message: "Duplicate webhook event ignored" });
    }

    // 2. Persist Email Delivery Event
    await EmailEvent.create({
      provider: "resend",
      eventId,
      type: eventType,
      emailId,
      recipient,
      status: eventType.replace("email.", ""),
      payload: {
        subject: data.subject,
        created_at: data.created_at,
        error: data.error,
      },
      receivedAt: new Date(),
      processedAt: new Date(),
    });

    // 3. Structured Safe Observability Logging
    const recipientDomain = recipient && recipient.includes("@") ? recipient.split("@")[1] : "unknown";
    console.log(`EMAIL_EVENT_RECEIVED { type: "${eventType}", provider: "resend", eventId: "${eventId}", emailId: "${emailId || ""}", recipientDomain: "${recipientDomain}" }`);

    return res.status(200).json({ success: true, message: "Webhook processed successfully" });
  } catch (error) {
    console.error("[WEBHOOK ERROR] Internal error processing webhook:", error.message);
    return res.status(500).json({ success: false, message: "Internal webhook processing error" });
  }
};

module.exports = {
  handleResendWebhook,
};
