import { ChatwootClass } from "./services/Chatwoot/chatwoot.class";
import { MemoryDB as Database, createBot } from "@builderbot/bot";
import { handleMediaDownload } from "./utils/handleMediaDownload";
import { handlerMessage } from "./services";
import templates from "./templates";
import provider from "./provider";
import config from "./config";

const chatwoot = new ChatwootClass({
  account: config.CHATWOOT_ACCOUNT_ID,
  endpoint: config.CHATWOOT_ENDPOINT,
  token: config.CHATWOOT_TOKEN,
});

const main = async () => {
  const bot = await createBot(
    {
      flow: templates,
      provider: provider,
      database: new Database(),
    },
    {
      extensions: {
        chatwoot,
      },
    }
  );

  provider.on("message", async (payload) => {
    return new Promise(async (resolve, reject) => {
      try {
        const attachment = [];

        const messageContent = payload?.body.includes("_event_")
          ? "Archivo adjunto"
          : payload.body;

        resolve(
          await handlerMessage(
            {
              phone: payload.from,
              name: payload.pushName,
              message: messageContent,
              attachment,
              mode: "incoming",
            },
            chatwoot
          )
        );
      } catch (error) {
        console.log("[ERROR MESSAGE]", error);
        reject(error);
      }
    });
  });

  bot.on("send_message", async (payload) => {
    return new Promise(async (resolve, reject) => {
      try {
        const attachment = [];

        if (payload.options?.media) {
          const mediaFilePath = await handleMediaDownload(
            payload.options.media
          );
          if (mediaFilePath) {
            attachment.push(mediaFilePath);
          }
        }

        let message: string | string[] = [];
        if (Array.isArray(message) && message.length) {
          message = message.join("\n");
        } else {
          message = payload.answer;
        }

        resolve(
          await handlerMessage(
            {
              phone: payload.from,
              name: payload.from,
              message: message as string,
              mode: "outgoing",
              attachment,
            },
            chatwoot
          )
        );
      } catch (error) {
        console.log("[ERROR SEND_MESSAGE]", error);
        reject(error);
      }
    });
  });

  provider.server.post(
    "/chatwoot",
    async (req: any, res: any): Promise<void> => {
      try {
        const { body } = req;
        const { event, conversation, custom_attributes } = body;

        const phone =
          conversation?.custom_attributes?.phone_number?.replace("+", "") ||
          custom_attributes?.phone_number?.replace("+", "") ||
          body?.meta?.sender?.phone_number.replace("+", "") ||
          body.conversation?.meta?.sender?.phone_number.replace("+", "");

        if (
          body?.private == false &&
          event === "message_created" &&
          body?.message_type === "outgoing" &&
          conversation?.channel?.includes("Channel::Api")
        ) {
          const agent = body?.sender?.name;
          const contentWithAgent = `*AGENTE: ${agent}*\n${body?.content ?? ""}`;

          if (body?.attachments?.length) {
            // hacer logica de cuando es un archivo
          }

          await provider.sendText(`${phone}@c.us`, contentWithAgent);
          res.statusCode = 200;
          res.end();
          return;
        }
        res.statusCode = 200;
        res.end();
        return;
      } catch (error) {
        console.error("[ERROR]: chatwoot", error);
        res.statusCode = 500;
        res.end(error);
        return;
      }
    }
  );

  bot.httpServer(+config.PORT);
};

main();
