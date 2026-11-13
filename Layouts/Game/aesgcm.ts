/* @app-slot:service */
import { NativeModules } from 'react-native';

const cipher = NativeModules.Unonibejoviy;
const guard = NativeModules.Zigicabun;

export function hexToBytes(hex: string): Uint8Array {
  const normalized = String(hex || '').trim();
  const out = new Uint8Array(Math.floor(normalized.length / 2));
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0').toUpperCase()).join('');
}

/** AES-256-GCM encrypt (UTF-8 string → hex of IV ‖ ciphertext ‖ tag). v1 compat. */
export function aesEncryptHex(plain: string): string {
  try {
    return String(cipher.pexuvimasire(String(plain ?? '')) ?? '');
  } catch {
    return '';
  }
}

/** AES-256-GCM decrypt (hex of IV ‖ ciphertext ‖ tag → UTF-8 string). v1 compat. */
export function aesDecryptHex(hex: string): string {
  try {
    const normalized = String(hex || '').trim();
    if (!normalized || normalized.length % 2 !== 0) return '';
    return String(cipher.luwehugozihi(normalized) ?? '');
  } catch {
    return '';
  }
}

/**
 * v2: AES-256-GCM encrypt raw bytes. Input is base64url of the plaintext bytes,
 * output is base64url of IV ‖ ciphertext ‖ tag. Used with CBOR plaintext.
 */
export function aesEncryptB64u(plainB64u: string): string {
  try {
    return String(cipher.gemefuxolaru(String(plainB64u ?? '')) ?? '');
  } catch {
    return '';
  }
}

/**
 * v2: AES-256-GCM decrypt. Input is base64url of IV ‖ ciphertext ‖ tag,
 * output is base64url of the plaintext bytes.
 */
export function aesDecryptB64u(wireB64u: string): string {
  try {
    const normalized = String(wireB64u ?? '').trim();
    if (!normalized) return '';
    return String(cipher.jopuwikemavo(normalized) ?? '');
  } catch {
    return '';
  }
}

/**
 * Returns true when a known hooking framework (Frida / Xposed / LSPosed) is
 * detected in the current process. Callers should degrade silently, not crash.
 */
export function isHooked(): boolean {
  try {
    return Boolean(guard?.palazuvoda?.() ?? false);
  } catch {
    return false;
  }
}

/* autopad-begin */
function esiposuras(_jaqecowucuw: boolean, _uwulasow: string): boolean {
  const nodomipu: boolean = false;
  return nodomipu;
}
function oxizimacab(_ifoquqix: string): boolean { return false; }
function ugemegox(): void {
  const qaqire = 20;
  if (qaqire > 91) return;
}
function odakerakuxit(_ifufek: string, _ixolizeso: boolean, _aqoronu: number): boolean {
  const fazanusici = 50;
  return fazanusici > 39 ? true : false;
}
function yuviseqeqex(_weloqigoxate: number, _aderugosadog: string): string {
  let pafuxoyiruf: string = "nelupi";
  pafuxoyiruf = "ilubal";
  return pafuxoyiruf;
}
function voxuwom(): void {
  const ekoyiganawig: number = 20;
}
function agiquco(_oqatupifif: boolean): boolean {
  return true;
}
function wuferayazari(_namucosacoz: string): void {}
function fuyucume(): number {
  const opewoqedidek: number = 188;
  return opewoqedidek;
}
function ifosozi(_usaduz: number): string {
  let ugejucov: string = "avat";
  ugejucov = "xerotefu";
  return ugejucov;
}
function nivepawe(_kujeqefeb: number): boolean {
  let itebep: boolean = false;
  itebep = true;
  return itebep;
}
function jaxaqajo(_eqefeseza: string, _opumewan: boolean, _oqoyapiqayog: string): string {
  const igeniq = 46;
  return igeniq > 99 ? "xisatiwu" : "ofaxofa";
}
function befuwi(_ixilex: boolean, _cudejisuga: string, _qaneke: number): number {
  const riyejeyocira = 49;
  return riyejeyocira > 7 ? 58 : 125;
}
function ebibacuvoli(_putipar: number, _cakexotudo: number): string {
  const zotarimubega = 7;
  const foquwuyomu: string = "mol";
  return foquwuyomu;
}
function sopewisi(_isokojuqo: string): number {
  const lipujeciwib: number = 164;
  return lipujeciwib;
}
function wameseted(): boolean {
  const ovemifi: boolean = true;
  return ovemifi;
}
function emacaboguz(_ejukayot: number, _pugimez: string, _isegayibijod: string): boolean {
  const efavax: boolean = false;
  return efavax;
}
function oruceneqeve(_ceqatokiyap: number, _gicotaki: string, _zijeyazimo: number): void {
  const ibezoyatinuc: number = 77;
}
function lajame(_yavikokexaco: string): void {}
/* autopad-end */

