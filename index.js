const { ethers } = require("ethers");
const express = require("express");
require("dotenv").config();
const updateWebhook = require("./update-webhook.js");
// const ngrok = require("ngrok");

const app = express();
app.use(express.json());

// Initialize provider and signer
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_BASE_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Health check endpoint for Render
app.get("/", async (req, res) => {
  await updateWebhook();
  res.status(200).json({
    status: "active",
    monitored_address: signer.address,
    vault_address: process.env.VAULT_ADDRESS,
  });
});

// Webhook handler
app.post("/webhook/alchemy", async (req, res) => {
  console.log(
    `----------------------------------------------------------------------\n`
  );
  console.log("Received Alchemy webhook event:", req.body, "\n");

  try {
    const data = req.body.event.activity[0];
    if (data && data.toAddress.toLowerCase() === signer.address.toLowerCase()) {
      const balance = await provider.getBalance(signer.address);
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice;
      const gasLimit = 21000n;
      const gasCost = gasPrice * gasLimit;
      const safeValue = balance - gasCost;
      const value = (safeValue * 98n) / 100n; // send 98% of the transferable amount

      console.log(
        `\n🔔 ${data.toAddress} received deposit of ${data.value} ETH from ${data.fromAddress}`
      );
      console.log(`🏛  Balance: ${ethers.formatEther(balance)} ETH`);
      console.log(`⛽ Gas Cost: ${ethers.formatEther(gasCost)} ETH`);
      console.log(`💰 Value: ${ethers.formatEther(value)} ETH`);

      if (balance > gasCost && value > 0) {
        console.log("\n🚀 Withdrawing to vault...");
        const tx = await signer.sendTransaction({
          to: process.env.VAULT_ADDRESS,
          value,
          gasLimit,
          gasPrice,
        });
        await tx.wait(1);
        console.log(
          `✅ Withdrew ${ethers.formatEther(value)} ETH to ${
            process.env.VAULT_ADDRESS
          } at https://basescan.org/tx/${tx.hash}`
        );
      } else {
        console.log("⚠️ Not enough balance to cover gas.");
      }

      const finalBalance = await provider.getBalance(signer.address);
      console.log(
        `\nPost-transfer balance: ${ethers.formatEther(finalBalance)} ETH\n`
      );
      console.log(
        `----------------------------------------------------------------------\n`
      );

      res.status(200).send("OK");
    }
  } catch (error) {
    console.error("❌ Webhook Error:", error.message);
  }
});

// Start the server
app.listen(process.env.PORT, async () => {
  await updateWebhook();
  console.log(`Server listening on port: ${process.env.PORT}`);
  console.log(`Monitored address: ${signer.address}`);
  // try {
  //   const url = await ngrok.connect({
  //     addr: process.env.PORT,
  //     authtoken: process.env.NGROK_AUTH_TOKEN,
  //   });

  //   console.log(`🔗 Public ngrok URL: ${url}/webhook/alchemy`);
  // } catch (err) {
  //   console.error("Error starting ngrok", err);
  // }
});
