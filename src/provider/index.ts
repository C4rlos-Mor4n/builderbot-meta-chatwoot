import { MetaProvider as Provider } from "@builderbot/provider-meta";
import { createProvider } from "@builderbot/bot";
import config from "../config";

export default createProvider(Provider, {
  jwtToken: config.JWT_TOKEN,
  numberId: config.NUMBER_ID,
  verifyToken: config.VERIFY_TOKEN,
  version: config.VERSION,
});
