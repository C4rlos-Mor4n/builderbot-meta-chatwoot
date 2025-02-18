import downloadFile from "./downloader";
import * as fs from "fs/promises";

const FILE_CLEANUP_DELAY_MS = 1000 * 60 * 5;

/**
 * Programa la eliminación de archivos después de un tiempo determinado
 *
 * @param files - Array de rutas de archivos que se eliminarán
 * @returns void
 *
 * @description
 * Esta función programa la eliminación de archivos después de un tiempo específico
 * definido por FILE_CLEANUP_DELAY_MS. Si ocurre un error durante la eliminación
 * de algún archivo, se registra una advertencia pero continúa con los demás archivos.
 */
function scheduleFileCleanup(files: string[]): void {
  setTimeout(async () => {
    for (const file of files) {
      try {
        await fs.unlink(file);
      } catch (err) {
        console.warn(`Error deleting file ${file}:`, err);
      }
    }
  }, FILE_CLEANUP_DELAY_MS);
}

/**
 * Gestiona la descarga de archivos multimedia desde una URL
 *
 * @param mediaUrl - URL del archivo multimedia a descargar o ruta local del archivo
 * @returns Promise<string | null> - Retorna la ruta del archivo descargado o null si falla
 *
 * @description
 * Esta función verifica si la URL proporcionada es una URL HTTP:
 * - Si es una URL HTTP, descarga el archivo y programa su limpieza automática
 * - Si no es una URL HTTP, retorna la ruta proporcionada sin modificaciones
 * - En caso de error durante la descarga, retorna null
 */
async function handleMediaDownload(mediaUrl: string): Promise<string | null> {
  try {
    if (mediaUrl.startsWith("http")) {
      const { filePath } = await downloadFile(mediaUrl);
      scheduleFileCleanup([filePath]);
      return filePath;
    } else {
      return mediaUrl;
    }
  } catch (err) {
    console.error(`Failed to download media from ${mediaUrl}:`, err);
    return null;
  }
}

export { handleMediaDownload };
