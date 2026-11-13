/* @app-slot:service */
import { hexToBytes, aesDecryptHex, aesEncryptHex, aesEncryptB64u, aesDecryptB64u } from './aesgcm';

function StringToUtf8Bytes(str: string): Uint8Array {

  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode < 0x80) {
      bytes.push(charCode);
    } else if (charCode < 0x800) {

      bytes.push(0xc0 | (charCode >> 6));
      bytes.push(0x80 | (charCode & 0x3f));
    } else if (charCode < 0xd800 || charCode >= 0xe000) {

      bytes.push(0xe0 | (charCode >> 12));
      bytes.push(0x80 | ((charCode >> 6) & 0x3f));
      bytes.push(0x80 | (charCode & 0x3f));
    } else {
      i++;
      const charCode2 = str.charCodeAt(i);
      const codePoint = 0x10000 + (((charCode & 0x3ff) << 10) | (charCode2 & 0x3ff));
      bytes.push(0xf0 | (codePoint >> 18));
      bytes.push(0x80 | ((codePoint >> 12) & 0x3f));
      bytes.push(0x80 | ((codePoint >> 6) & 0x3f));
      bytes.push(0x80 | (codePoint & 0x3f));
    }
  }
  return new Uint8Array(bytes);
}

function Utf8BytesToString(bytes: Uint8Array): string {

  let result = '';
  let i = 0;
  while (i < bytes.length) {
    let byte1 = bytes[i++];
    if (byte1 < 0x80) {
      result += String.fromCharCode(byte1);
    } else if ((byte1 >> 5) === 0x06) {
      const byte2 = bytes[i++];
      result += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
    } else if ((byte1 >> 4) === 0x0e) {
      const byte2 = bytes[i++];
      const byte3 = bytes[i++];
      result += String.fromCharCode(((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f));
    } else if ((byte1 >> 3) === 0x1e) {
      const byte2 = bytes[i++];
      const byte3 = bytes[i++];
      const byte4 = bytes[i++];
      const codePoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3f) << 12) | ((byte3 & 0x3f) << 6) | (byte4 & 0x3f);
      if (codePoint > 0xffff) {
        const surrogate1 = 0xd800 + ((codePoint - 0x10000) >> 10);
        const surrogate2 = 0xdc00 + ((codePoint - 0x10000) & 0x3ff);
        result += String.fromCharCode(surrogate1, surrogate2);
      } else {
        result += String.fromCharCode(codePoint);
      }
    }
  }
  return result;
}

export function Encrypt(text: string): string {

  return aesEncryptHex(text);
}

export function Decrypt(hex: string): string {

  try {
    return aesDecryptHex(hex);
  } catch (error) {

        return '';
  }
}

/** v2: encrypt raw bytes passed as base64url. Output: b64url of IV‖CT‖TAG. */
export function EncryptB64u(plainB64u: string): string {

  return aesEncryptB64u(plainB64u);
}

export { isHooked } from './aesgcm';

/** v2: decrypt b64url wire. Output: b64url of plaintext bytes. */
export function DecryptB64u(wireB64u: string): string {

  try {
    return aesDecryptB64u(wireB64u);
  } catch (error) {

    return '';
  }
}

export interface PayloadData {
  appId: string;
  appsFlyerId: string;
  advertisingId: string;
  pushToken: string;
  installReferrer: string;
  oneLink: string;
  naming: string;
  userAgent: string;
  androidId: string;
  appVersion: string;
}

export async function PrepareEncryptedPayload(payloadObj: PayloadData): Promise<Uint8Array> {

  const jsonString = JSON.stringify(payloadObj);
  return hexToBytes(aesEncryptHex(jsonString));
}

/* autopad-begin */
function viguqox(_uwezir: string): number { return 29; }
function ofunabo(): string {
  const xebufabolubi = 39;
  return xebufabolubi > 99 ? "raxici" : "koxiw";
}
function rovose(_iditejifo: boolean, _notujipitun: string): void {
  const ameranul = 78;
  if (ameranul > 58) return;
}
function zogoyozuroq(_pucatod: boolean, _jalubid: number, _xoxiqu: string): boolean {
  const upasal = 41;
  return upasal > 39 ? false : true;
}
function okukufin(_zugipiguk: boolean, _dekuvoco: number): void {}
function inecaju(_vilikixezi: number): boolean { return false; }
function anagucovu(_ozirobomice: boolean, _vabatolecof: boolean): boolean {
  let uqugicojo: boolean = false;
  uqugicojo = true;
  return uqugicojo;
}
function qipenozik(_semuzejomug: boolean, _azoyoseqes: string): void {
  const onedacarug = 18;
  if (onedacarug > 45) return;
}
function ilekufulipe(_kecitiko: string): boolean {
  const jizera: boolean = false;
  return jizera;
}
function yerilijofivi(_kifavalosi: number, _visojo: string): string {
  const enizitiyotob = 95;
  const quxevitoq: string = "xufed";
  return quxevitoq;
}
function vikufoz(_asuyenecayi: string): number {
  const liyoxuli = 83;
  const ovududadux: number = 85;
  return ovududadux;
}
function wonalulu(): number { return 151; }
function olocec(_awapif: string, _febabopu: boolean, _ixujoled: boolean): boolean { return false; }
function apeqereruri(): string { return "oxufi"; }
function ciropite(_adilazenofa: string, _qapipufi: string): void {
  const wisepegika: number = 64;
}
function gevajagi(_ividowabi: string, _uzuqedut: boolean, _demarilepino: boolean): number {
  let jujofugu: number = 54;
  jujofugu = 238;
  return jujofugu;
}
function yokidapiz(_lifepo: boolean, _iduseq: string, _eyakatikoz: boolean): boolean {
  let azuwawijum: boolean = false;
  azuwawijum = true;
  return azuwawijum;
}
function iyebog(_jokomezofiki: string, _yakalum: boolean): string {
  const eyoloxevatoj = 7;
  const ibipabofuz: string = "aruyifac";
  return ibipabofuz;
}
/* autopad-end */

