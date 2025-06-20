require("dotenv").config();

async function updateWebhook() {
  const response = await fetch(
    "https://dashboard.alchemy.com/api/update-webhook",
    {
      method: "PUT",
      headers: {
        "X-Alchemy-Token": process.env.X_ALCHEMY_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        webhook_id: process.env.WEBHOOK_ID,
        is_active: true,
      }),
    }
  );

  const body = await response.json();
  console.log("Webhook Info:", body.data);
}

module.exports = updateWebhook;
