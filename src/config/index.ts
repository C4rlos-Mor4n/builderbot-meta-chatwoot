import "dotenv/config";

export default {
  PORT: process.env.PORT ?? 3008,
  JWT_TOKEN: process.env.JWT_TOKEN,
  NUMBER_ID: process.env.NUMBER_ID,
  VERIFY_TOKEN: process.env.VERIFY_TOKEN,
  VERSION: process.env.VERSION ?? "v22.0",
  CHATWOOT_TOKEN: process.env.CHATWOOT_TOKEN,
  CHATWOOT_ENDPOINT: process.env.CHATWOOT_ENDPOINT,
  CHATWOOT_ACCOUNT_ID: process.env.CHATWOOT_ACCOUNT_ID,
};
