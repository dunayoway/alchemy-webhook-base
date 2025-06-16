const { ethers } = require("ethers");
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
// const ngrok = require("ngrok");

const app = express();
app.use(bodyParser.json());

app.post("/webhook/alchemy", async (req, res) => {
  console.log(
    `----------------------------------------------------------------------\n`
  );
  console.log("Received Alchemy webhook event:", req.body, "\n");
  const data = req.body.event?.activity?.[0];

  const provider = new ethers.JsonRpcProvider(
    process.env.ALCHEMY_BASE_SEPOLIA_RPC_URL
  );
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  if (!data || data.toAddress?.toLowerCase() !== signer.address.toLowerCase()) {
    return res.status(400).send("Invalid or unmonitored address.");
  }

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
      } at https://etherscan.io/tx/${tx.hash}`
    );
  } else {
    console.log("⚠️ Not enough balance to cover gas.");
  }

  const finalBalance = await provider.getBalance(signer.address);
  console.log(`\nPost-transfer balance: ${finalBalance} wei\n`);
  console.log(
    `----------------------------------------------------------------------\n`
  );

  res.status(200).send("OK");
});

app.listen(process.env.PORT, async () => {
  console.log(`Webhook listening on port ${process.env.PORT}...`);

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
