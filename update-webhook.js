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
        is_active: true, // Set to false to disable the webhook
      }),
    }
  );

  const body = await response.json();
  console.log(body);
}

updateWebhook();
