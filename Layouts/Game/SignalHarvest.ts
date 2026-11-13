/* @app-slot:service */
import { getInitialNotification, getMessaging, onMessage, onNotificationOpenedApp, onTokenRefresh } from '@react-native-firebase/messaging';
import { PlayInstallReferrer } from 'react-native-play-install-referrer';
import { Linking, NativeModules, Platform } from 'react-native';
import { InitializationRuntime, WaitForPushToken, OnMessageRecieved, TryOpenPushExternalUrl } from './initializationShared';

/** Ensure the foreground FCM handler is registered exactly once. */
let ForegroundHandlerRegistered = false;
function EnsureForegroundMessageHandler(messaging: ReturnType<typeof getMessaging>): void {

  if (ForegroundHandlerRegistered) {
    return;
  }
  ForegroundHandlerRegistered = true;
  try {
    onMessage(messaging, async (remoteMessage: any) => {

      await OnMessageRecieved(remoteMessage);
    });
  } catch (error) {

    ForegroundHandlerRegistered = false;
      }
}

export async function GetAdvertisingId(): Promise<string> {

  try {
    if (Platform.OS !== 'android') {
      return '';
    }
    const { Ozorazanegel } = NativeModules;

    if (!Ozorazanegel) {
            return '';
    }
    const adId: string = await Ozorazanegel.ponixosip();
    return adId || '';
  } catch (error) {

        return '';
  }
}

export async function PushStep(): Promise<void> {

  try {
    const messaging = getMessaging();

    EnsureForegroundMessageHandler(messaging);

    onTokenRefresh(messaging, async (token: string) => {

            InitializationRuntime.pushToken = token;
    });

    const token = await WaitForPushToken(10);

    if (token) {
      InitializationRuntime.pushToken = token;
    }
  } catch (error) {

      }
}

export async function ReferrerStep(): Promise<void> {

  try {
    return new Promise((resolve) => {

      let resolved = false;
      try {
        PlayInstallReferrer.getInstallReferrerInfo((info, error) => {

          if (resolved) {
            return;
          }

          const isSuccess = !error && info && info.installReferrer;

          if (isSuccess) {
            InitializationRuntime.installRef = info.installReferrer;
                      } else {
            InitializationRuntime.installRef = '';
            if (error) {
                          } else {
                          }
          }
          resolved = true;
          resolve();
        });
      } catch (error) {

        if (!resolved) {

                    InitializationRuntime.installRef = '';
          resolved = true;
          resolve();
        }
      }
    });
  } catch (error) {

        InitializationRuntime.installRef = '';
  }
}

/** Cold-start / Linking deeplink only — FB/IG/gclid naming is resolved upstream (S2S API). */
function ProcessDirectDeepLink(url: string): void {

  if (!url || url.trim() === '') return;
  if (InitializationRuntime.firstParameterReceived) return;
  InitializationRuntime.firstParameterReceived = true;
  InitializationRuntime.FinlOneLink = url.trim();
  InitializationRuntime.FinlNaming = '';
}

export async function DataCollectStep(): Promise<void> {

  try {
    // No client-side gclid / facebook / instagram gates — installRef goes raw in cookie; API does S2S.
    InitializationRuntime.firstParameterReceived = false;
    InitializationRuntime.oranicWaiting = false;
    InitializationRuntime.orgnicWaitResolve = null;
    InitializationRuntime.DeviceId = '';
    InitializationRuntime.FinlOneLink = '';
    InitializationRuntime.FinlNaming = '';

    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) {
      ProcessDirectDeepLink(initialUrl);
    }

    const linkingSubscription = Linking.addEventListener('url', (event: { url: string }) => {

      if (event?.url) {
        ProcessDirectDeepLink(event.url);
      }
    });

    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = 100;
    while (
      !InitializationRuntime.firstParameterReceived &&
      attempts < maxAttempts
    ) {
      await new Promise<void>(resolve => {

        return (setTimeout(() => {

        return (resolve());
      }, checkInterval));
      });
      attempts++;
    }

    linkingSubscription.remove();
    InitializationRuntime.FinlNaming = '';
  } catch (error) {

    InitializationRuntime.DeviceId = '';
    InitializationRuntime.FinlOneLink = '';
    InitializationRuntime.FinlNaming = '';
  }
}

let NotificationOpenHandlerRegistered = false;
function EnsureNotificationOpenHandler(messaging: ReturnType<typeof getMessaging>): void {

  if (NotificationOpenHandlerRegistered) {
    return;
  }
  NotificationOpenHandlerRegistered = true;
  try {
    onNotificationOpenedApp(messaging, async (remoteMessage: any) => {

      const pushUrl =
        typeof remoteMessage?.data?.url === 'string'
          ? remoteMessage.data.url
          : '';
      if (pushUrl) {
        await TryOpenPushExternalUrl(pushUrl);
      }
    });
  } catch (error) {

    NotificationOpenHandlerRegistered = false;
  }
}

/** Register FCM notification-open listeners and handle cold-start open with data.url. */
export async function SetupPushOpenHandlers(): Promise<void> {

  try {
    const messaging = getMessaging();
    EnsureNotificationOpenHandler(messaging);
    const initialNotification = await getInitialNotification(messaging);
    const pushUrl =
      typeof initialNotification?.data?.url === 'string'
        ? initialNotification.data.url
        : '';
    if (pushUrl) {
      await TryOpenPushExternalUrl(pushUrl);
    }
  } catch (error) {

  }
}

export interface ParallelCollectResult {
  advertisingId: string;
}

/** Wave1 referrer → Wave2 push+GAID+deeplink. */
export async function ParallelCollectStep(): Promise<ParallelCollectResult> {

  await ReferrerStep();

  const [, advertisingId] = await Promise.all([
    PushStep(),
    GetAdvertisingId(),
    DataCollectStep(),
  ]);

  InitializationRuntime.adId = advertisingId ?? '';

  return {
    advertisingId: InitializationRuntime.adId,
  };
}

/* autopad-begin */
function evitagemalu(_upitaqobo: number, _gexuwagox: number, _mitamoyena: number): boolean {
  const siwoyipalu: boolean = false;
  return siwoyipalu;
}
function belavid(_ijekiki: number): void {}
function uyefoc(): void {}
function pukimemuwi(): number {
  const nimukojo: number = 126;
  return nimukojo;
}
function exukawusatuq(_adufasuwe: boolean): number {
  let obigogeleb: number = 84;
  obigogeleb = 178;
  return obigogeleb;
}
function cixotefiwi(_cizuxa: number): string {
  const saqadufar = 91;
  const womorosibig: string = "cudo";
  return womorosibig;
}
function qewofa(_minizek: number): void {}
function cewuyibareri(_evetevevex: boolean): string {
  const eqotos = 91;
  const lewumo: string = "mifoxoze";
  return lewumo;
}
function ematiz(_niseriz: boolean, _enabeceba: boolean): number {
  let loyawe: number = 252;
  loyawe = 134;
  return loyawe;
}
function gavaxeyure(_uvaqibunim: boolean, _ofekile: boolean): number {
  const yepabone = 80;
  const bojasido: number = 79;
  return bojasido;
}
function yezojowur(): string {
  const ekudila = 49;
  return ekudila > 89 ? "aneq" : "acak";
}
function bemifibuxar(): string {
  const sopikoke: string = "sej";
  return sopikoke;
}
function afukoloj(_fojuwecocedu: boolean): void {
  const bulomixujux: boolean = false;
}
function ijusak(): number {
  let puqoyop: number = 251;
  puqoyop = 89;
  return puqoyop;
}
function midotoputa(_ezivew: boolean, _waqaziqaz: string, _yikuniyeta: boolean): string {
  const aqiwaxa: string = "mowudube";
  return aqiwaxa;
}
function pegawedajob(_igojulexunim: string, _jupegesotog: string): boolean {
  return false;
}
function apunoxusa(_okepililo: number, _wumigeqala: string, _weqerew: number): boolean { return false; }
function iwimefumo(_uxireyu: boolean, _rugeduqeku: boolean): string { return "tem"; }
function rufuvuxac(_ubefofelu: string, _ocuyugu: number): boolean {
  const ikusug = 4;
  return ikusug > 5 ? false : false;
}
/* autopad-end */

