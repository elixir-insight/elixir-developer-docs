import { BASE_URL } from '#lib/api.ts';

/** Express handler that verifies and records a payment callback. Shown on Quickstart and Webhooks. */
export const webhookHandler = `app.post("/elixirpay/callback", (req, res) => {
  if (req.get("X-Secret-Key") !== process.env.ELIXIRPAY_WEBHOOK_SECRET) {
    return res.sendStatus(401);
  }
  const { clientOrderId, status } = req.body;
  markOrder(clientOrderId, status);
  res.sendStatus(200);
});`;

export const callbackSample = `X-Secret-Key: <your shared secret>
Content-Type: application/json

{
  "status": "CREATED",
  "orderId": "ORD_FZASRIA4Mi",
  "attemptId": "39u92hdjs",
  "clientOrderId": "MSFQGH8NJ5MIJU",
  "amount": "2",
  "message": "Successfully created Payment Order."
}`;

export const envMasked = `ELIXIRPAY_ORG_ID=ORG_2bh
ELIXIRPAY_CLIENT_KEY=ck_••••••••••••••••
ELIXIRPAY_CLIENT_SECRET=••••••••••••••••••••••••`;

/** What "Show" reveals and "Copy" copies: a template to fill in, never a real secret. */
export const envTemplate = `ELIXIRPAY_ORG_ID=ORG_2bh
ELIXIRPAY_CLIENT_KEY=<your client key>
ELIXIRPAY_CLIENT_SECRET=<your client secret>`;

export const createOrderNode = `const res = await fetch(
  "${BASE_URL}/payment/orders",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Key": process.env.ELIXIRPAY_CLIENT_KEY,
      "X-Client-Secret": process.env.ELIXIRPAY_CLIENT_SECRET
    },
    body: JSON.stringify({
      orgId: process.env.ELIXIRPAY_ORG_ID,
      amount: "2.00",
      clientOrderId: "MSFQGH8NJ5MIJU",
      customer: { name: "Rahul Sharma", /* … */ },
      merchantUrl: { successUrl, cancelUrl, failureUrl },
      description: "customer buying"
    })
  }
);
const order = await res.json();`;

export const redirectNode = `if (order.status === "CREATED") {
  return res.redirect(order.checkoutUrl);
}`;

export const authCurl = `curl -X POST ${BASE_URL}/payment/orders \\
  -H "Content-Type: application/json" \\
  -H "X-Client-Key: $ELIXIRPAY_CLIENT_KEY" \\
  -H "X-Client-Secret: $ELIXIRPAY_CLIENT_SECRET" \\
  -d @order.json`;
