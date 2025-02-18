import { addKeyword } from "@builderbot/bot";

export const welcomeFlow = addKeyword(["ping"]).addAnswer(
  `🙌 Hello welcome to this *Chatbot*`,
  null,
  async (ctx, { endFlow }) => {
    return await endFlow("Pong!");
  }
);
