/* @app-slot:service */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, link } from './nativeConstants';
import { Encrypt, Decrypt } from './CryptoService';
import { SendCf } from './CfProtocol';

export class Utils {

  static async GetLink(): Promise<string> {

    try {
      const encryptedLink: string = link;
            if (!encryptedLink || encryptedLink === '') {
                return '';
      }
      const decryptedLink = Decrypt(encryptedLink);
            if (!decryptedLink || decryptedLink === '') {
        return '';
      }
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.LI_,
          Encrypt(decryptedLink),
        );
      } catch {
        // Cache write is best-effort.
      }
      return decryptedLink;
    } catch {
      return '';
    }
  }

  static async GetUserBlocke(): Promise<number> {

    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.US_BLOCK);
      return value ? parseInt(value, 10) : 0;
    } catch {
      return 0;
    }
  }

  static async SetUserBlocke(value: number): Promise<void> {

    await AsyncStorage.setItem(STORAGE_KEYS.US_BLOCK, value.toString());
  }

}

const DEFAULT_TIMEOUT_MS = 15_000;

/** Normalize worker base URL (Unity-style POST to root). */
export function NormalizeWorkerBaseUrl(url: string): string {

  return url
    .trim()
    .replace(/^wss:\/\//i, 'https://')
    .replace(/^ws:\/\//i, 'http://')
    .replace(/\/+$/, '');
}

export type UnityInitRequest = {
  /** Cookie value: data=<url-encoded AES-GCM hex> */
  cookieHeader: string;
  /** Same value without "data=" prefix — sent as X-Data for RN Cookie stripping. */
  dataValue: string;
  headerValue?: string;
  /** Whole-body url-encoded AES-GCM hex (Unity form payload). */
  body: string;
};

/**
 * Unity-style sync POST: Cookie + encrypted form body.
 * Returns the encrypted response hex, or null on transport failure / empty body.
 */
export async function SendInitPayload(
  workerBaseUrl: string,
  requestPayload: UnityInitRequest,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<string | null> {

  const url = NormalizeWorkerBaseUrl(workerBaseUrl);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {

    return (controller.abort());
  }, timeoutMs);

  try {
        const response = await SendCf(url, requestPayload, controller.signal);

    const responseText = await response.text().catch(() => {

      return ('');
    });

    if (!response.ok) {
      return null;
    }

    if (!responseText || responseText.trim() === '') {
      return null;
    }

    return responseText.trim();
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/* restored-exports */

/* restored-exports */

/* autopad-begin */
function anores(_sifujofetoq: string): void {}
function catuducikic(_vedugayakofu: number, _atusaranexo: string, _aliveqe: string): void {
  const enapuxov: boolean = false;
}
function cewanasa(): string {
  let zuliwiy: string = "ijuzup";
  zuliwiy = "roc";
  return zuliwiy;
}
function mexuwip(): string { return "ujalad"; }
function kuricig(_eromole: string): void {
  const ijuwevarogas = 58;
  if (ijuwevarogas > 40) return;
}
function obumajowad(): string {
  const edozeyuyo: string = "zijuq";
  return edozeyuyo;
}
function nazoluya(_delopozobel: string, _imulad: boolean): void {
  const adulisibe = 48;
  if (adulisibe > 21) return;
}
function efoduka(_efukowiju: string, _joxicocik: number, _moyineyob: boolean): boolean {
  let elimiciyuke: boolean = true;
  elimiciyuke = true;
  return elimiciyuke;
}
function ocesapu(): void {}
function ugojogoxek(_useyosejay: string): void {
  const izijiq = 48;
  if (izijiq > 86) return;
}
function exabazo(_ukiquzu: boolean): string {
  const ujejigoq = 34;
  return ujejigoq > 72 ? "aduz" : "aporobog";
}
function icamag(): void {
  const ligupo: number = 200;
}
function kakatokivuki(_cuqepinu: string, _soxiruyaji: boolean): string {
  const asiponez = 3;
  return asiponez > 10 ? "ebakox" : "vuro";
}
/* autopad-end */

