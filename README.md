# Auto Withdraw Hooks for Base Network

Supports:
- 🔔 Alchemy Notify Webhook
- 🧠 Tenderly Webhook

## 📦 Setup

1. Clone the repo
2. Create a `.env` file with:

```
PORT=3000
ALCHEMY_BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/your-key
PRIVATE_KEY=your-private-key
DEPOSIT_ADDRESS=0xYourMonitoredWallet
VAULT_ADDRESS=0xYourVaultAddress
```

3. Deploy using Docker (or Render)

## 🚀 One-click Deploy to Render

1. Go to [Render.com](https://render.com)
2. Create a new Web Service
3. Connect this GitHub repo
4. Set Build Command: `npm install`
5. Set Start Command: `node index.js`
6. Add environment variables from `.env`
