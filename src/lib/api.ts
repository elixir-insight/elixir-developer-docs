import type { Field } from "#lib/field.ts";
import { requestSamples, toJson, type Json } from "#lib/samples.ts";

/**
 * Name of the environment variable that holds the base URL, version prefix included.
 * The value itself is server-only (see src/env.ts); docs and samples only ever name it.
 */
export const BASE_URL_ENV = "API_BASE_URL";

export interface ResponseCase {
  /** Optional internal key; not shown in the docs UI. */
  code?: string;
  message: string;
  when: string;
}

export interface ResponseSample {
  key: string;
  title: string;
  sample: Json;
}

export interface ResponseDef {
  status: string;
  tone: "success" | "danger";
  title: string;
  fields?: Field[];
  /** Exception-code catalogue shown under the response card. */
  cases?: ResponseCase[];
  note?: string;
  /** Label for this response's primary tab in the sample panel. */
  sampleLabel: string;
  sample: Json;
  /** Extra OpenAPI / playground examples under the same HTTP status. */
  extraSamples?: ResponseSample[];
}

export interface Endpoint {
  /** OpenAPI operationId — the playground and /api/execute allowlist key. */
  operationId: string;
  title: string;
  eyebrow: string;
  summary: string;
  method: "POST";
  /** Relative to the configured base URL, which already includes the version prefix. */
  path: string;
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
      description: "E.164 format with country code, e.g. +919876543210",
    },
    { name: "name", type: "string", required: true, description: "Full name" },
    {
      name: "email",
      type: "string",
      required: true,
      description: "Valid email address",
    },
    { name: "city", type: "string", required: true, description: "City" },
    {
      name: "country",
      type: "string",
      required: true,
      description: "Country, e.g. India",
    },
    {
      name: "zipCode",
      type: "string",
      required: true,
      description: "Postal or ZIP code",
    },
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
    description: "Encoded organization ID assigned by ElixirPay",
  },
  amount: {
    name: "amount",
    type: "string",
    required: true,
    description: 'Numeric string greater than 0, e.g. "1500" or "2.00"',
  },
  clientOrderId: {
    name: "clientOrderId",
    type: "string",
    required: true,
    description: "Your idempotency key — unique per organization",
  },
  description: {
    name: "description",
    type: "string",
    required: true,
    description: "Short description of the order",
  },
} satisfies Record<string, Field>;

const orderResponseFields: Field[] = [
  {
    name: "status",
    type: "string",
    description:
      "Order status: CREATED, ATTEMPTED, CAPTURED, EXPIRED, CANCELLED, SUSPECTED, FAILED, or REJECTED",
  },
  {
    name: "orderId",
    type: "string",
    description: "ElixirPay order ID, prefixed with ORD_",
  },
  {
    name: "clientOrderId",
    type: "string",
    description: "Your idempotency key, echoed back",
  },
  {
    name: "amount",
    type: "string",
    description: 'Numeric string, e.g. "1500"',
  },
  {
    name: "message",
    type: "string",
    description: "Human-readable result",
  },
  {
    name: "checkoutUrl",
    type: "string",
    accent: true,
    description: 'Checkout URL, or "" when not available',
  },
];

const errorResponseFields: Field[] = [
  {
    name: "message",
    type: "string",
    description: "Human-readable message",
  },
  {
    name: "statusCode",
    type: "number",
    description: "Status code carried in the body",
  },
];

const sampleCustomer = {
  phoneNumber: "+919876543210",
  name: "Rahul Sharma",
  email: "rahul.sharma@example.com",
  city: "Chennai",
  country: "India",
  zipCode: "600001",
};

const sampleMerchantUrl = {
  successUrl: "https://merchant.example.com/payment/success",
  cancelUrl: "https://merchant.example.com/payment/cancel",
  failureUrl: "https://merchant.example.com/payment/failure",
};

export const createOrder: Endpoint = {
  operationId: "createPaymentOrder",
  title: "Create order",
  eyebrow: "API reference / Payments",
  summary:
    "Start a new payment order. Success responses are a flat order object (no data wrapper) with checkoutUrl — redirect your customer there to pay. Errors use message and statusCode unless noted.",
  method: "POST",
  path: "/payment/orders",
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
      name: "paymentMethods",
      type: "array",
      description:
        "Optional methods offered at checkout: UPI, QR, CREDIT_CARD, COMMERCIAL_CREDIT_CARD, DEBIT_CARD, INTERNATIONAL_CARD, INTERNATIONAL_CREDIT_CARD, INTERNATIONAL_DEBIT_CARD, CORPORATE_CARD, NET_BANKING, CARD",
    },
  ],
  sampleBody: {
    orgId: "ORG_2bh",
    amount: "2.00",
    clientOrderId: "MSFQGH8NJ5MIJU",
    customer: sampleCustomer,
    merchantUrl: sampleMerchantUrl,
    description: "customer buying",
    paymentMethods: ["UPI", "CARD"],
  },
  responses: [
    {
      status: "201",
      tone: "success",
      title: "Order created",
      sampleLabel: "created",
      note: "Returned for new orders and for duplicate clientOrderId with the same payload. Duplicate replays always return 201 — status reflects the existing order (including FAILED or REJECTED). Body is a flat order object.",
      fields: orderResponseFields,
      sample: {
        status: "CREATED",
        orderId: "ORD_FZASRIA4Mi",
        clientOrderId: "MSFQGH8NJ5MIJU",
        amount: "2",
        message: "Successfully created Payment Order.",
        checkoutUrl: "https://checkout.elixirpay.example/ORD_FZASRIA4Mi",
      },
      extraSamples: [
        {
          key: "duplicate",
          title: "Duplicate clientOrderId (same payload)",
          sample: {
            status: "CREATED",
            orderId: "ORD_FZASRIA4Mi",
            clientOrderId: "MSFQGH8NJ5MIJU",
            amount: "2",
            message: "Payment Order Already Created for this Client Order ID.",
            checkoutUrl: "https://checkout.elixirpay.example/ORD_FZASRIA4Mi",
          },
        },
      ],
    },
    {
      status: "400",
      tone: "danger",
      title: "Bad Request",
      sampleLabel: "invalid-payload",
      note: "Payload or business validation failed. Body uses the error shape.",
      fields: errorResponseFields,
      cases: [
        {
          code: "ERR_AUTH_INVALID_INPUT_A00",
          message: "Invalid Payload",
          when: "Malformed JSON, empty body, or missing/invalid required field (except phone number)",
        },
        {
          code: "ERR_AUTH_INVALID_INPUT_A00",
          message:
            "Phone numbers must contain country code and be in E.164 format",
          when: "customer.phoneNumber is not valid E.164 or does not start with +",
        },
        {
          code: "ERR_PAYIN_ORDER_INVALID_INPUT_P01",
          message: "Invalid org ID",
          when: "orgId is not a valid encoded ID",
        },
        {
          code: "ERR_PAYIN_ORDER_INVALID_INPUT_P01",
          message: "Invalid payment amount",
          when: "amount is not a number",
        },
        {
          code: "ERR_PAYIN_ORDER_INVALID_INPUT_P01",
          message: "Failed to create payment order, amount must be more than 0.",
          when: "amount <= 0",
        },
        {
          code: "ERR_PAYIN_ORDER_INVALID_INPUT_P01",
          message: "Invalid Merchant URLs.",
          when: "Merchant URL data could not be processed",
        },
        {
          code: "ERR_PAYIN_ORDER_INVALID_INPUT_P01",
          message: "Received Invalid Payment Methods.",
          when: "An unsupported value in paymentMethods",
        },
        {
          code: "ERR_PAYIN_ORDER_VA_STATUS_VALIDATION_FAIL_P03",
          message:
            "Failed to create payment order, please contact customer support",
          when: "Virtual account is not eligible for payins",
        },
        {
          code: "ERR_PAYIN_ORDER_INVALID_PIPELINE_CLASS_P04",
          message:
            "Failed to create payment order, please contact customer support",
          when: "Organisation's payment pipeline is not supported",
        },
      ],
      sample: {
        message: "Invalid Payload",
        statusCode: 400,
      },
      extraSamples: [
        {
          key: "invalid-org",
          title: "Invalid org ID",
          sample: {
            message: "Invalid org ID",
            statusCode: 400,
          },
        },
        {
          key: "invalid-phone",
          title: "Invalid phone number",
          sample: {
            message:
              "Phone numbers must contain country code and be in E.164 format",
            statusCode: 400,
          },
        },
      ],
    },
    {
      status: "401",
      tone: "danger",
      title: "Unauthorized",
      sampleLabel: "missing-auth",
      note: "Authentication failed. These bodies contain statusCode and message only.",
      fields: [
        {
          name: "statusCode",
          type: "number",
          description: "Status code carried in the body (may differ from HTTP 401)",
        },
        {
          name: "message",
          type: "string",
          description: "Human-readable message",
        },
      ],
      cases: [
        {
          message: "Missing required authentication headers",
          when: "X-Client-Key or X-Client-Secret is missing",
        },
        {
          message: "Invalid API credentials",
          when: "Credentials are invalid",
        },
        {
          message: "invalid or revoked clientId",
          when: "Client key is unknown or revoked",
        },
        {
          message: "invalid client secret",
          when: "Client secret is invalid",
        },
        {
          message: "Unable to process the request at this time",
          when: "Credential check could not be completed",
        },
      ],
      sample: {
        statusCode: 400,
        message: "Missing required authentication headers",
      },
      extraSamples: [
        {
          key: "invalid-credentials",
          title: "Invalid API credentials",
          sample: {
            statusCode: 401,
            message: "Invalid API credentials",
          },
        },
      ],
    },
    {
      status: "409",
      tone: "danger",
      title: "Conflict",
      sampleLabel: "idempotency-conflict",
      note: "An order already exists for the same orgId + clientOrderId, but amount, customer, or merchantUrl fields differ from the original request.",
      fields: errorResponseFields,
      cases: [
        {
          code: "ERR_PAYIN_ORDER_IDEMPOTENCY_DIFFERENT_PAYLOAD_P09",
          message:
            "An order with this clientOrderId already exists, but the request does not match the original request.",
          when: "Same clientOrderId with a different payload",
        },
      ],
      sample: {
        message:
          "An order with this clientOrderId already exists, but the request does not match the original request.",
        statusCode: 409,
      },
    },
    {
      status: "422",
      tone: "danger",
      title: "Order rejected",
      sampleLabel: "rejected",
      note: "The payment pipeline rejected the order. Body uses the order object shape (not ErrorResponse); checkoutUrl is empty.",
      fields: orderResponseFields,
      sample: {
        status: "REJECTED",
        orderId: "ORD_FZASRIA4Mi",
        clientOrderId: "MSFQGH8NJ5MIJU",
        amount: "2",
        message: "Payment Order creation got Rejected.",
        checkoutUrl: "",
      },
    },
    {
      status: "500",
      tone: "danger",
      title: "Internal Server Error",
      sampleLabel: "server-error",
      note: "Server-side failure while creating or forwarding the order. Body uses the error shape.",
      fields: errorResponseFields,
      cases: [
        {
          code: "ERR_PAYIN_ORDER_DB_FAIL_P02",
          message: "Failed to create payment order, please try again.",
          when: "Organisation's virtual account could not be loaded",
        },
        {
          code: "ERR_PAYIN_ORDER_DB_FAIL_P02",
          message: "Failed to create payment order",
          when: "Order could not be saved",
        },
        {
          code: "ERR_PAYIN_ORDER_DB_FAIL_P02",
          message: "Failed to forward payment order request",
          when: "Order result could not be saved",
        },
        {
          code: "ERR_PAYIN_ORDER_PARSE_FAIL_P08",
          message: "Failed to create payment order",
          when: "Existing order details could not be read",
        },
        {
          code: "ERR_PAYIN_ORDER_BANK_PIPELINE_ERROR_P05",
          message: "Failed to forward payment order request",
          when: "Payment pipeline call failed or returned an unexpected result",
        },
        {
          code: "ERR_PAYIN_ORDER_INVALID_PIPELINE_CLASS_P06",
          message: "Failed to create payment order, contact customer support",
          when: "Payment pipeline integration flow is not configured",
        },
      ],
      sample: {
        message: "Failed to create payment order, please try again.",
        statusCode: 500,
      },
    },
    {
      status: "502",
      tone: "danger",
      title: "Bad Gateway",
      sampleLabel: "pipeline-failed",
      note: "The payment pipeline failed to create the order. Body uses the order object shape (not ErrorResponse); checkoutUrl is empty.",
      fields: orderResponseFields,
      sample: {
        status: "FAILED",
        orderId: "ORD_FZASRIA4Mi",
        clientOrderId: "MSFQGH8NJ5MIJU",
        amount: "2",
        message: "Failed to create Payment Order.",
        checkoutUrl: "",
      },
    },
    {
      status: "404",
      tone: "danger",
      title: "Not Found",
      sampleLabel: "not-found",
      note: "Wrong path or HTTP method.",
      fields: errorResponseFields,
      sample: {
        message:
          "You might have used an incorrect URL or method. Please verify the route and try again.",
        statusCode: 404,
      },
    },
  ],
  tabbedResponses: true,
};

export const upiIntent: Endpoint = {
  operationId: "createUpiIntentPayment",
  title: "UPI intent & QR",
  eyebrow: "API reference / Payments",
  summary:
    "Generate a UPI payment link and a matching QR code. Use the link to open the customer’s UPI app, or show the QR for them to scan.",
  method: "POST",
  path: "/payments/upi",
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
          description: "`upi://` link that opens the customer’s UPI app",
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

/**
 * The callback ElixirPay sends to the merchant. Inbound only — the docs server never
 * calls it, so the OpenAPI document lists it under `webhooks` rather than `paths`.
 */
export const paymentWebhook = {
  operationId: "receivePaymentWebhook",
  title: "Payment webhooks",
  summary:
    "ElixirPay calls your Payment Callback URL when a payment changes state. The body matches the pay-in transaction response.",
  secretHeader: {
    name: "X-Secret-Key",
    required: true,
    description:
      "The shared secret you chose, 10 to 15 characters. Verify it before trusting the callback.",
  } satisfies Field,
  payload: [
    { name: "status", type: "string", description: "Current payment status" },
    { name: "orderId", type: "string", description: "ElixirPay order ID" },
    { name: "attemptId", type: "string", description: "Payment attempt ID" },
    {
      name: "clientOrderId",
      type: "string",
      accent: true,
      description: "Your order reference — use it to find the order",
    },
    { name: "amount", type: "string", description: "Order amount" },
    { name: "message", type: "string", description: "Human-readable result" },
  ] satisfies Field[],
  sample: {
    status: "CREATED",
    orderId: "ORD_FZASRIA4Mi",
    attemptId: "39u92hdjs",
    clientOrderId: "MSFQGH8NJ5MIJU",
    amount: "2",
    message: "Successfully created Payment Order.",
  } satisfies Json,
};

export function endpointSamples(endpoint: Endpoint) {
  return requestSamples(endpoint.path, endpoint.sampleBody);
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
    `\`${endpoint.method} $${BASE_URL_ENV}${endpoint.path}\``,
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
    "## Example request body",
    "",
    "```json",
    toJson(endpoint.sampleBody),
    "```",
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
      ...(response.cases?.length
        ? [
            "| Message | When |",
            "| --- | --- |",
            ...response.cases.map((item) => `| ${item.message} | ${item.when} |`),
            "",
          ]
        : []),
      "```json",
      toJson(response.sample),
      "```",
      ...(response.extraSamples ?? []).flatMap((extra) => [
        "",
        `#### ${extra.title}`,
        "",
        "```json",
        toJson(extra.sample),
        "```",
      ]),
    ]),
  ].join("\n");
}

/** Markdown with enough surrounding context for an AI assistant to use the endpoint correctly. */
export function endpointPrompt(endpoint: Endpoint) {
  return [
    "Use this ElixirPay API reference to help me integrate the endpoint below.",
    `Base URL: the value of the ${BASE_URL_ENV} environment variable, which already includes the version prefix. Requests are JSON over HTTPS and must be sent from a server.`,
    "Authenticate every request with the X-Client-Key and X-Client-Secret headers; never expose the secret in client-side code.",
    "When generating client code, read credentials from environment variables and never hard-code secrets.",
    "",
    endpointMarkdown(endpoint),
  ].join("\n");
}
