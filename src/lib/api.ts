import type { Field } from "#lib/components/FieldTable.svelte";
import { requestSamples, toJson, type Json } from "#lib/samples.ts";

export const BASE_URL = "https://dev-api.elixirpay.org/api/v1";

export interface ResponseDef {
  status: string;
  tone: "success" | "danger";
  title: string;
  fields?: Field[];
  note?: string;
  /** Label for this response's tab in the sample panel. */
  sampleLabel: string;
  sample: Json;
}

export interface Endpoint {
  title: string;
  eyebrow: string;
  summary: string;
  method: "POST";
  path: string;
  url: string;
  headers: Field[];
  secretWarning: string;
  body: Field[];
  sampleBody: Json;
  responses: ResponseDef[];
  /** Show response samples as tabs (true) or as a single panel with a status badge. */
  tabbedResponses: boolean;
}

export const authHeaders: Field[] = [
  { name: "Content-Type", required: true, description: "application/json" },
  {
    name: "X-Client-Key",
    required: true,
    description: "Unique client key issued by ElixirPay",
  },
  {
    name: "X-Client-Secret",
    required: true,
    description:
      "Secret paired with your client key, used to authenticate the request",
  },
];

const secretWarning =
  "Keep X-Client-Secret on your server. Never put it in browser or mobile app code — make every order call from your backend.";

const customerFields: Field = {
  name: "customer",
  type: "object",
  required: true,
  description: "The customer making the payment",
  children: [
    {
      name: "phoneNumber",
      type: "string",
      required: true,
      description: "Contact phone number",
    },
    { name: "name", type: "string", required: true, description: "Full name" },
    {
      name: "email",
      type: "string",
      required: true,
      description: "Email address",
    },
    { name: "city", type: "string", required: true, description: "City" },
    {
      name: "country",
      type: "string",
      required: true,
      description: "ISO 3-letter code, e.g. IND",
    },
    { name: "zipCode", type: "string", description: "Postal or ZIP code" },
  ],
};

const merchantUrlFields: Field = {
  name: "merchantUrl",
  type: "object",
  required: true,
  description: "Where to send the customer after payment",
  children: [
    {
      name: "successUrl",
      type: "string",
      required: true,
      description: "After a successful payment",
    },
    {
      name: "cancelUrl",
      type: "string",
      required: true,
      description: "If the customer cancels",
    },
    {
      name: "failureUrl",
      type: "string",
      required: true,
      description: "If the payment fails",
    },
  ],
};

const commonFields = {
  orgId: {
    name: "orgId",
    type: "string",
    required: true,
    description: "Organization ID assigned by ElixirPay",
  },
  amount: {
    name: "amount",
    type: "string",
    required: true,
    description: 'Amount in your base currency, e.g. "2.00"',
  },
  clientOrderId: {
    name: "clientOrderId",
    type: "string",
    required: true,
    description: "Your unique order reference, used for reconciliation",
  },
  description: {
    name: "description",
    type: "string",
    required: true,
    description: "Short description of the order",
  },
} satisfies Record<string, Field>;

const sampleCustomer = {
  phoneNumber: "+919876543210",
  name: "Rahul Sharma",
  email: "rahul.sharma@example.com",
  city: "Chennai",
  country: "IND",
  zipCode: "600001",
};

const sampleMerchantUrl = {
  successUrl: "https://merchant.example.com/payment/success",
  cancelUrl: "https://merchant.example.com/payment/cancel",
  failureUrl: "https://merchant.example.com/payment/failure",
};

export const createOrder: Endpoint = {
  title: "Create order",
  eyebrow: "API reference / Payments",
  summary:
    "Start a new payment order. The response includes a checkoutUrl — redirect your customer there to complete the payment.",
  method: "POST",
  path: "/payment/orders",
  url: `${BASE_URL}/payment/orders`,
  headers: authHeaders,
  secretWarning,
  body: [
    commonFields.orgId,
    commonFields.amount,
    commonFields.clientOrderId,
    customerFields,
    {
      name: "paymentMethods",
      type: "array",
      description: "Methods offered at checkout: UPI, CARD, NET_BANKING",
    },
    merchantUrlFields,
    commonFields.description,
  ],
  sampleBody: {
    orgId: "ORG_2bh",
    amount: "2.00",
    clientOrderId: "MSFQGH8NJ5MIJU",
    customer: sampleCustomer,
    paymentMethods: ["UPI", "CARD", "NET_BANKING"],
    merchantUrl: sampleMerchantUrl,
    description: "customer buying",
  },
  responses: [
    {
      status: "200",
      tone: "success",
      title: "Order created",
      sampleLabel: "Order created",
      fields: [
        { name: "status", description: "CREATED when the order is accepted" },
        { name: "orderId", description: "ElixirPay order ID" },
        { name: "clientOrderId", description: "Your reference, echoed back" },
        {
          name: "amount · message",
          description: "Order amount and a readable result",
        },
        {
          name: "checkoutUrl",
          accent: true,
          description: "Redirect the customer here to pay",
        },
      ],
      sample: {
        status: "CREATED",
        orderId: "ORD_FZASRIA4Mi",
        clientOrderId: "MSFQGH8NJ5MIJU",
        amount: "2",
        message: "Successfully created Payment Order.",
        checkoutUrl: "http://localhost:8080/ORD_FZASRIA4Mi",
      },
    },
    {
      status: "4xx",
      tone: "danger",
      title: "Request rejected",
      sampleLabel: "Request rejected",
      fields: [
        { name: "message", description: "Why the request was rejected" },
      ],
      sample: { message: "Request rejected." },
    },
  ],
  tabbedResponses: false,
};

export const upiIntent: Endpoint = {
  title: "UPI intent & QR",
  eyebrow: "API reference / Payments",
  summary:
    "Generate a UPI payment link and a matching QR code. Use the link to open the customer’s UPI app, or show the QR for them to scan.",
  method: "POST",
  path: "/payments/upi",
  url: `${BASE_URL}/payments/upi`,
  headers: authHeaders,
  secretWarning,
  body: [
    commonFields.orgId,
    commonFields.amount,
    commonFields.clientOrderId,
    customerFields,
    merchantUrlFields,
    commonFields.description,
    {
      name: "paymentMethod",
      type: "string",
      required: true,
      highlight: true,
      description: "Set to UPI",
    },
    {
      name: "paymentChannel",
      type: "string",
      required: true,
      highlight: true,
      description: "Set to UPI_INTENT",
    },
  ],
  sampleBody: {
    orgId: "ORG_2bh",
    amount: "2.00",
    clientOrderId: "MSOP4BW6VCF4DC",
    customer: sampleCustomer,
    merchantUrl: sampleMerchantUrl,
    description: "customer buying",
    paymentMethod: "UPI",
    paymentChannel: "UPI_INTENT",
  },
  responses: [
    {
      status: "CREATED",
      tone: "success",
      title: "Payment link created",
      sampleLabel: "Success",
      fields: [
        { name: "orderId", description: "ElixirPay order ID" },
        {
          name: "paymentAttemptId",
          description: "ID of this attempt under the order",
        },
        {
          name: "clientOrderId · amount",
          description: "Echoed from your request",
        },
        {
          name: "url",
          accent: true,
          description: "upi:// link that opens the customer’s UPI app",
        },
        {
          name: "qrCode",
          accent: true,
          description: "Base64 PNG — use directly as an image source",
        },
      ],
      sample: {
        status: "CREATED",
        orderId: "ORD_FjZvcgJPyC",
        paymentAttemptId: "PAT_FjZvcgJPyD",
        clientOrderId: "MSOP4BW6VCF4DC",
        amount: "2",
        message: "Payment Attempted successfully under order ORD_FjZvcgJPyC.",
        url: "upi://pay?pa=rohithtest291499@fbl&pn=Rohith+Test&mc=8299&tr=FBLOMNI441791738PAY8365660821995122&tn=customer+buying&am=2.00&cu=INR",
        qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHsAAAB7…",
      },
    },
    {
      status: "FAILED",
      tone: "danger",
      title: "Payment initiation failed",
      sampleLabel: "Failure",
      note: "url and qrCode are empty",
      sample: {
        status: "FAILED",
        orderId: "ORD_FjZvcgJPyC",
        paymentAttemptId: "PAT_FjZvcgJPyD",
        clientOrderId: "MSOP4BW6VCF4DC",
        amount: "2",
        message: "Payment initiation failed.",
        url: "",
        qrCode: "",
      },
    },
  ],
  tabbedResponses: true,
};

export function endpointSamples(endpoint: Endpoint) {
  return requestSamples(endpoint.url, endpoint.sampleBody);
}

function fieldLines(fields: Field[], prefix = ""): string[] {
  return fields.flatMap((field) => {
    const meta = [field.type, field.required ? "required" : undefined]
      .filter(Boolean)
      .join(", ");
    const line = `- \`${prefix}${field.name}\`${meta ? ` (${meta})` : ""}: ${field.description}`;
    return [
      line,
      ...fieldLines(field.children ?? [], `${prefix}${field.name}.`),
    ];
  });
}

/** The endpoint as Markdown, for "Copy page" and "Copy for AI". */
export function endpointMarkdown(endpoint: Endpoint) {
  const [curl] = endpointSamples(endpoint);
  return [
    `# ${endpoint.title}`,
    "",
    endpoint.summary,
    "",
    `\`${endpoint.method} ${endpoint.url}\``,
    "",
    "## Headers",
    "",
    ...fieldLines(endpoint.headers),
    "",
    `> ${endpoint.secretWarning}`,
    "",
    "## Request body",
    "",
    ...fieldLines(endpoint.body),
    "",
    "## Example request",
    "",
    "```bash",
    curl.code,
    "```",
    "",
    "## Responses",
    ...endpoint.responses.flatMap((response) => [
      "",
      `### ${response.status} — ${response.title}`,
      "",
      ...(response.note ? [response.note, ""] : []),
      ...(response.fields ? [...fieldLines(response.fields), ""] : []),
      "```json",
      toJson(response.sample),
      "```",
    ]),
  ].join("\n");
}

/** Markdown with enough surrounding context for an AI assistant to use the endpoint correctly. */
export function endpointPrompt(endpoint: Endpoint) {
  return [
    "Use this ElixirPay API reference to help me integrate the endpoint below.",
    `Base URL: ${BASE_URL}. Requests are JSON over HTTPS and must be sent from a server.`,
    "Authenticate every request with the X-Client-Key and X-Client-Secret headers; never expose the secret in client-side code.",
    "",
    endpointMarkdown(endpoint),
  ].join("\n");
}
