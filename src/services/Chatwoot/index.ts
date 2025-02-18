import { ChatwootClass } from "./chatwoot.class";

/**
 * Maneja los mensajes entrantes y gestiona las interacciones con Chatwoot
 *
 * @param dataIn - Objeto que contiene los datos del mensaje
 * @param dataIn.phone - Número de teléfono del contacto
 * @param dataIn.name - Nombre del contacto
 * @param dataIn.message - Contenido del mensaje
 * @param dataIn.mode - Modo/tipo del mensaje
 * @param dataIn.attachment - Array de archivos adjuntos del mensaje
 * @param chatwoot - Instancia de ChatwootClass para operaciones de API
 *
 * @returns Promise<void>
 *
 * @description
 * Esta función realiza las siguientes operaciones:
 * 1. Crea o encuentra una bandeja de entrada llamada "BOTWS"
 * 2. Crea o encuentra un contacto usando el teléfono y nombre proporcionados
 * 3. Crea o encuentra una conversación para el contacto
 * 4. Crea un nuevo mensaje en la conversación
 */
export const handlerMessage = async (
  dataIn: {
    phone: string;
    name: string;
    message: string;
    mode: string;
    attachment: any[];
  },
  chatwoot: ChatwootClass
) => {
  try {
    const inbox = await chatwoot.findOrCreateInbox({ name: "BOTWS" });

    const contact = await chatwoot.findOrCreateContact({
      from: dataIn.phone,
      name: dataIn.name,
      inbox: inbox.id,
    });

    const conversation = await chatwoot.findOrCreateConversation({
      inbox_id: inbox.id,
      contact_id: contact.id,
      phone_number: dataIn.phone,
    });

    return await chatwoot.createMessage({
      msg: dataIn.message,
      mode: dataIn.mode,
      conversation_id: conversation.id,
      attachment: dataIn.attachment,
    });
  } catch (error) {
    console.log(error);
  }
};
