import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import axios, { AxiosResponse } from "axios";
import ffmpeg from "fluent-ffmpeg";
import mime from "mime-types";
import path from "path";
import fs from "fs";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Interfaz que define las opciones de formato para la conversión de audio
 * @interface FormatOptions
 * @property {string} code - Código del codec de audio
 * @property {"mp3"} ext - Extensión del archivo de salida
 */
export interface FormatOptions {
  code: string;
  ext: "mp3";
}

/**
 * Objeto que contiene las configuraciones de formato disponibles
 */
const formats: Record<string, FormatOptions> = {
  mp3: {
    code: "libmp3lame",
    ext: "mp3",
  },
};

/**
 * Convierte un archivo de audio al formato especificado
 * @param {string} filePath - Ruta del archivo a convertir
 * @param {FormatOptions["ext"]} format - Formato de salida deseado (por defecto: mp3)
 * @returns {Promise<string>} Ruta del archivo convertido
 */
const convertAudio = async (
  filePath: string,
  format: FormatOptions["ext"] = "mp3"
): Promise<string> => {
  if (!filePath) {
    throw new Error("filePath is required");
  }
  const convertedFilePath = path.join(
    path.dirname(filePath),
    `${path.basename(filePath, path.extname(filePath))}.${formats[format].ext}`
  );

  await new Promise<void>((resolve, reject) => {
    ffmpeg(filePath)
      .audioCodec(formats[format].code)
      .audioBitrate("128k")
      .format(formats[format].ext)
      .output(convertedFilePath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });

  return convertedFilePath;
};

/**
 * Descarga un archivo desde una URL y lo guarda localmente
 * @param {string} url - URL del archivo a descargar
 * @param {string} [token] - Token de autorización opcional
 * @returns {Promise<Object>} Objeto con información del archivo descargado
 * @property {string} fileName - Nombre del archivo
 * @property {string} filePath - Ruta completa del archivo
 * @property {Buffer} fileBuffer - Buffer con el contenido del archivo
 * @property {string} extension - Extensión del archivo
 */
export const downloadFile = async (url: string, token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  let res: AxiosResponse<any, any>;
  try {
    res = await axios({
      url,
      method: "GET",
      headers,
      responseType: "stream",
    });
  } catch (error) {
    console.error(`Failed to fetch ${url}: ${error.response.statusText}`);
    throw new Error(`Failed to fetch ${url}: ${error.response.statusText}`);
  }

  const urlExtension = path.extname(url).slice(1);
  const mimeType = res.headers["content-type"];
  const extension = mime.extension(mimeType) || urlExtension || "bin";

  const fileName = `file-${Date.now()}.${extension}`;
  const folderPath = path.join(process.cwd(), "public");
  const filePath = path.join(folderPath, fileName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const fileStream = fs.createWriteStream(filePath);
  await new Promise((resolve, reject) => {
    res.data.pipe(fileStream);
    res.data.on("error", (err) => {
      reject(err);
    });
    fileStream.on("finish", function () {
      resolve(
        `File downloaded and saved as ${filePath} with extension ${extension}`
      );
    });
  });

  const audioExtensions = ["oga", "ogg", "wav", "mp3"];
  let finalFilePath = filePath;
  let finalExtension = extension;

  if (audioExtensions.includes(extension)) {
    try {
      finalFilePath = await convertAudio(filePath, "mp3");
      finalExtension = "mp3";
      console.log(`File converted to ${finalFilePath}`);
    } catch (error) {
      console.error(`Error converting file: ${error.message}`);
    }
  }

  return {
    fileName: path.basename(finalFilePath),
    filePath: finalFilePath,
    fileBuffer: fs.readFileSync(finalFilePath),
    extension: finalExtension,
  };
};

export default downloadFile;
