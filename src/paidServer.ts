/**
 * Local/VPS entry point: binds the shared Express app (src/paidApp.ts) to a
 * port. Not used on Vercel — api/index.ts imports the same app and lets
 * Vercel's serverless runtime handle the listening/routing instead.
 */
import { app, PRICE, NETWORK, FACILITATOR_URL } from "./paidApp.ts";

const PORT = Number(process.env.PAID_SERVER_PORT || 4021);

app.listen(PORT, () => {
  console.log(
    `Riscov paid endpoint listening on :${PORT} — POST /check-risk, ${PRICE} per call (${NETWORK}, facilitator ${FACILITATOR_URL || "https://web3.okx.com"})`
  );
});
