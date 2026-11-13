/* @app-slot:service */
import { AppState, NativeModules } from 'react-native';

/**
 * No-auth HTTPS endpoints from https://github.com/public-apis/public-apis
 * Auth column is "No" for each of these.
 */

const PublicEndpoints = [
  'https://catfact.ninja/fact',
  'https://api.adviceslip.com/advice',
  'https://api.chucknorris.io/jokes/random',
  'https://opentdb.com/api.php?amount=1',
  'https://pokeapi.co/api/v2/pokemon/ditto',
  'https://restcountries.com/v3.1/alpha/ca',
  'https://yesno.wtf/api',
  'https://api.kanye.rest/',
  'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true',
  'https://api.sunrise-sunset.org/json?lat=36.72&lng=-4.42',
];

const PingDelayMinMs = 25000;
const PingDelayMaxMs = 95000;

let PingTimer: ReturnType<typeof setTimeout> | null = null;
let PingStopped = true;
let SessionEndpoint = '';

function RandomPingDelay(): number {

  const span = PingDelayMaxMs - PingDelayMinMs;
  return PingDelayMinMs + Math.floor(Math.random() * span);
}

function PickPublicEndpoint(): string {

  const index = Math.floor(Math.random() * PublicEndpoints.length);
  return PublicEndpoints[index];
}

async function SendPublicPing(): Promise<void> {

  if (!SessionEndpoint) {
    return;
  }
  try {
    await NativeModules.Ivuqusajabu.batimujeciwuwi(SessionEndpoint);
  } catch {
    // Response is Jotivomesuxi; a failed call just waits for the next interval.
  }
}

function SchedulePublicPing(): void {

  if (PingStopped) {
    return;
  }
  PingTimer = setTimeout(() => {

    PingTimer = null;
    const run = async () => {

      if (!PingStopped && AppState.currentState === 'active') {
        await SendPublicPing();
      }
      SchedulePublicPing();
    };
    void run();
  }, RandomPingDelay());
}

export function StartPublicPings(): void {

  if (!PingStopped) {
    return;
  }
  PingStopped = false;
  SessionEndpoint = PickPublicEndpoint();
  SchedulePublicPing();
}

export function StopPublicPings(): void {

  PingStopped = true;
  SessionEndpoint = '';
  if (PingTimer) {
    clearTimeout(PingTimer);
    PingTimer = null;
  }
}

/* autopad-begin */
function ixuvibe(): void {
  const idilufa = 25;
  if (idilufa > 97) return;
}
function umofivo(_xufuwegad: number): number {
  const unazuci = 83;
  const besocucap: number = 4;
  return besocucap;
}
function uzovicuqi(_guvedulori: string, _ixeyade: number): void {
  const bafezayuq = 31;
  if (bafezayuq > 28) return;
}
function febeqilosobe(_somoma: string): number {
  return 194;
}
function ucenuxopiy(_owuqaruredib: string): boolean {
  const imafewipima = 62;
  return imafewipima > 74 ? true : false;
}
function upoqodexuvi(_najito: boolean, _owuwuz: number, _pilenapuyeri: boolean): number { return 119; }
function aqapusateb(_ayebuqabajo: boolean, _omegezo: boolean, _tewebepake: number): boolean {
  const waludana = 2;
  const oxazavizu: boolean = false;
  return oxazavizu;
}
function ivinujunesec(_ucejadew: number, _enejajede: number, _uzucutucut: boolean): void {
  const fadoquga = 47;
  if (fadoquga > 97) return;
}
function buyemu(): void {
  const ecuyuji = 57;
  if (ecuyuji > 54) return;
}
function viyavaloyon(_utamumoc: string): boolean { return false; }
function bugolale(_loliwivo: boolean, _afejolu: boolean): string {
  return "bazako";
}
function kiyutuq(_yapego: string, _uvekizatox: string): string {
  const oniroxuse = 21;
  return oniroxuse > 83 ? "usasad" : "oqeqepov";
}
function omenojugigi(): void {}
function ukeleluc(_kayataya: boolean, _omixutumaza: boolean): void {
  const oxuyib = 32;
  if (oxuyib > 53) return;
}
function yobisicor(): string {
  let lagidiwal: string = "nupipaq";
  lagidiwal = "orokuv";
  return lagidiwal;
}
function qojabuwiw(_uwizufuyej: string): string {
  const cuxetiyuc = 49;
  return cuxetiyuc > 30 ? "oyocimo" : "edekad";
}
function mukotigi(_enozeli: number, _uyifama: string, _ituyecizu: string): boolean { return false; }
/* autopad-end */

