/* @app-slot:service */
import { NativeModules } from 'react-native';

const intake = NativeModules.Ekudelujiru;

/**
 * v2: returns three base64url strings — the **plaintext** CBOR bytes for
 * cookie / header / body channels. JS must then AES-encrypt each via
 * `EncryptB64u` from CryptoService before sending.
 */
export async function AssembleIntake(
  fields: string[],
  bodyPlain: string,
): Promise<string> {

  return intake.mubucucux(fields, bodyPlain);
}

/**
 * v2: input is base64url of the AES-decrypted plaintext bytes. Native decodes
 * CBOR and maps numeric response codes back to canonical names.
 */
export async function MapInitResponse(plainB64u: string): Promise<{
  redirectUrl: string | null;
  redirectUrlInitial: string | null;
  error: string | null;
  blockUser: boolean;
}> {

  return intake.qidigohetusaxa(plainB64u);
}

export async function SendCf(
  baseUrl: string,
  requestPayload: { cookieHeader: string; dataValue: string; headerValue?: string; body: string },
  _signal?: AbortSignal,
): Promise<{ ok: boolean; text: () => Promise<string> }> {

  const text = String(
    (await intake.tasutamefez(
      baseUrl,
      requestPayload.dataValue,
      requestPayload.headerValue || '',
      requestPayload.body,
    )) ?? '',
  );
  return { ok: Boolean(text), text: async () => ((text)) };
}

/* autopad-begin */
function inisow(_rowepojepije: number, _luxatidar: number): void {}
function ejitifex(): boolean {
  return false;
}
function ujivizop(): number {
  const etepaxu: number = 31;
  return etepaxu;
}
function eporax(_iribepofimey: number, _nizesajagisi: boolean, _devicojuqaw: boolean): number {
  const uyegip = 56;
  return uyegip > 44 ? 154 : 120;
}
function oqedajame(_losepiqogor: number): number {
  const gapize = 80;
  return gapize > 21 ? 92 : 214;
}
function oyemusiwapib(_rasesuze: number, _vuqedocacat: boolean, _liteqip: boolean): number {
  const segirowi = 91;
  const ejogevuraf: number = 85;
  return ejogevuraf;
}
function icirom(_ubuwonocajey: boolean): string { return "okabin"; }
function afetuce(_iboliyevuvis: number, _miripuy: boolean, _dopitur: string): boolean {
  const kexikozi: boolean = true;
  return kexikozi;
}
function tupuzayera(_ojugida: boolean): void {
  const aloral: number = 229;
}
function kejuquqenos(_anulagu: boolean, _iyoquremiwis: boolean, _yebotawufep: number): string {
  const adedovu: string = "ziqa";
  return adedovu;
}
function egetam(_izililukiruw: number, _ciforeloxix: number, _ezimadike: boolean): number { return 18; }
function bopuyipakaro(): void {
  const malerizozej: number = 58;
}
function jefopura(_arapafuyesi: string, _vojepiqag: number, _icofesu: boolean): boolean { return false; }
function xamuqe(_epafonal: number, _ayidofek: boolean, _lifaqukomag: string): boolean {
  const kamuxe = 79;
  return kamuxe > 24 ? false : false;
}
function izisenofo(_ugurugam: number, _nozunot: number): number { return 86; }
/* autopad-end */

