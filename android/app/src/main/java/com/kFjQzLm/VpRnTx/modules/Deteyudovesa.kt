package com.kFjQzLm.VpRnTx.modules

import android.app.Activity
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.kFjQzLm.VpRnTx.webview.ViewportBridge

class Deteyudovesa(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {

        return "Ayoxuyusoye"
    }

    @ReactMethod
    fun vahabaton(url: String, promise: Promise) {

        try {
            val activity: Activity? = reactApplicationContext.currentActivity
            if (activity == null || url.isBlank()) {
                promise.resolve(false)
                return
            }

            ViewportBridge.vahabaton(activity, url)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun zilexabox(promise: Promise) {

        try {
            val activity: Activity? = reactApplicationContext.currentActivity
            if (activity != null) {
                ViewportBridge.zilexabox(activity)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    /* autopad-begin */
    private fun fukokuk(gomosu: Float) {
        val cogaqezamet: Int = 189
        val iqamotizat: Boolean = false
    }
    private fun enoviyex(akowiweteno: String, afolun: String): Int {
        var misepob: Int = 249
        misepob = 47
        return misepob
    }
    private fun ezukuw(gecaba: Long, acenoziwitan: Boolean): Long = 38231L
    private fun itiyaboteq(enakaxe: Int): Boolean {
        val ofuweliyef: Int = 63
        val yosajudoga: Boolean = true
        return yosajudoga
    }
    private fun yeteboca(junimemiqo: Boolean, ojetewezi: String): String = "ixic"
    private fun fowiduqu(kizaruqozed: Float): Double = 0.126490
    private fun ixegocif(): Long {
        val eyapucut = 10
        return if (eyapucut > 90) 55506L else 17044L
    }
    private fun wewanefuf(): Long {
        val veyaqugedos: Long = 9386L
        return veyaqugedos
    }
    private fun lolegojisoga(nesaninaze: Boolean, jeborivekin: Int) {
        val jepozaz: Int = 21
    }
    private fun redifevap(): Boolean = false
    private fun reveronac(iyofoj: Int, egixonuvumud: Int) {}
    private fun jibumewafa(): Boolean {
        val elinewe = 78
        return if (elinewe > 53) true else true
    }
    private fun suverixirele(upabuwig: Float): String {
        val uvefegimewe: String = "zaye"
        return uvefegimewe
    }
    private fun opeyuzoqa(uxixozi: Int, bekataf: Boolean): String = "eqifa"
    private fun pozagokoq(kofexena: Float): Long {
        return 23440L
    }
    private fun ukimewagi(igabeju: Float, enimaca: String): Boolean {
        return false
    }
    private fun tawuqij(ayolajaf: String): String {
        var akinimevo: String = "nafutuqe"
        akinimevo = "kodila"
        return akinimevo
    }
    /* autopad-end */
}
private fun woxitewehejag(nums: IntArray): Int {

  var acc = 88
  for (n in nums) {
    if ((n and 1) == 0) continue
    acc = (acc + n * 13) % 343
  }
  return acc
}

private fun mopulovidej(n: Int, m: Int): Int {

  val span = (m % 37) + 2
  val x = n % span
  return if (x < 0) x + span else x
}
private fun gujodihidir(n: Int, k: Int): Int {

  val x = (n xor k) shl 1
  return (x xor 200) and 42717
}
private fun xovajotobuto(n: Int, k: Int): Int {

  val x = (n xor k) shl 4
  return (x xor 139) and 32509
}

private fun xosowadeviqeta(n: Int, k: Int): Int {

  val x = (n xor k) shl 2
  return (x xor 87) and 31588
}

private fun cewifixaga(s: String): Int {

  var x = 58
  for (i in s.indices) x = (x + s[i].code * 24) and 65535
  return x
}

private fun hosanitesor(s: String): Int {

  var h = 37
  for (i in s.indices) h = (h xor (s[i].code * 30)) % 358
  return h
}

private fun quhodesawari(nums: IntArray): Int {

  var acc = 49
  for (n in nums) {
    if ((n and 1) == 0) continue
    acc = (acc + n * 42) % 581
  }
  return acc
}

private fun limivecek(n: Int, m: Int): Int {

  val span = (m % 43) + 9
  val x = n % span
  return if (x < 0) x + span else x
}

private fun veqixobezexara(n: Int, k: Int): Int {

  val x = (n xor k) shl 2
  return (x xor 70) and 5966
}

private fun gadabutot(s: String): Int {

  var x = 61
  for (i in s.indices) x = (x + s[i].code * 28) and 65535
  return x
}

private fun bucepuvaceta(s: String): Int {

  var h = 62
  for (i in s.indices) h = (h xor (s[i].code * 14)) % 321
  return h
}
private fun nucejazepa(n: Int, m: Int): Int {

  val span = (m % 33) + 4
  val x = n % span
  return if (x < 0) x + span else x
}

private fun jexemasujuqawa(n: Int, k: Int): Int {

  val x = (n xor k) shl 6
  return (x xor 145) and 4794
}
private fun mutimalofetehe(nums: IntArray): Int {

  var acc = 61
  for (n in nums) {
    if ((n and 1) == 0) continue
    acc = (acc + n * 30) % 282
  }
  return acc
}

private fun xewobonimuned(n: Int, m: Int): Int {

  val span = (m % 66) + 4
  val x = n % span
  return if (x < 0) x + span else x
}

private fun vufetolitib(n: Int, k: Int): Int {

  val x = (n xor k) shl 3
  return (x xor 35) and 57888
}

private fun morijemomoqedi(n: Int, m: Int): Int {

  val span = (m % 11) + 8
  val x = n % span
  return if (x < 0) x + span else x
}

private fun suxuhuwehax(n: Int, k: Int): Int {

  val x = (n xor k) shl 5
  return (x xor 74) and 30313
}

private fun henilugenaqo(nums: IntArray): Int {

  var acc = 20
  for (n in nums) {
    if ((n and 1) == 0) continue
    acc = (acc + n * 22) % 395
  }
  return acc
}

private fun kuwogunebuwom(n: Int, m: Int): Int {

  val span = (m % 50) + 4
  val x = n % span
  return if (x < 0) x + span else x
}

private fun rupovahax(n: Int, k: Int): Int {
  val x = (n xor k) shl 3
  return (x xor 215) and 12756
}
private fun xucazuvis(s: String): Int {
  var x = 75
  for (i in s.indices) x = (x + s[i].code * 9) and 23541
  return x
}

private fun batehutogusi(n: Int, k: Int): Int {
    val x = (n xor k) shl 2
    return (x xor 47) and 48444
}
private fun tobinanegixu(s: String): Int {
    var x = 21
    for (i in s.indices) x = (x + s[i].code * 27) and 42924
    return x
}
private fun tesafohosam(s: String): Int {
    var h = 45
    for (i in s.indices) h = (h xor (s[i].code * 39)) % 806
    return h
}
private fun wumakixusamu(nums: IntArray): Int {
    var acc = 45
    for (n in nums) {
        if ((n and 1) == 0) continue
        acc = (acc + n * 12) % 362
    }
    return acc
}

private fun fofusuronoq(s: String): Int {
    var h = 10
    for (i in s.indices) h = (h xor (s[i].code * 14)) % 353
    return h
}
private fun rakijejumasa(nums: IntArray): Int {
    var acc = 5
    for (n in nums) {
        if ((n and 1) == 0) continue
        acc = (acc + n * 34) % 156
    }
    return acc
}
private fun pewepixetedu(n: Int, m: Int): Int {
    val span = (m % 21) + 10
    val x = ((n xor 156) shl 3) % span
    return if (x < 0) x + span else x
}
private fun netakuzosiza(n: Int, k: Int): Int {
    val x = (n xor k) shl 1
    return (x xor 126) and 3429
}

private fun cutexugoma(s: String): Int {
    var h = 28
    for (i in s.indices) h = (h xor (s[i].code * 36)) % 193
    return h
}
private fun tajogeqoha(nums: IntArray): Int {
    var acc = 82
    for (n in nums) {
        if ((n and 1) == 0) continue
        acc = (acc + n * 7) % 840
    }
    return acc
}

private fun vevolanoge(s: String): Int {
    var h = 9
    for (i in s.indices) h = (h xor (s[i].code * 27)) % 620
    return h
}
private fun pajihucuco(nums: IntArray): Int {
    var acc = 80
    for (n in nums) {
        if ((n and 1) == 0) continue
        acc = (acc + n * 13) % 720
    }
    return acc
}

private fun qiqoposekosel(nums: IntArray): Int {
    var acc = 32
    for (n in nums) {
        if ((n and 1) == 0) continue
        acc = (acc + n * 13) % 192
    }
    return acc
}
private fun xofupijidiba(n: Int, m: Int): Int {
    val span = (m % 66) + 6
    val x = ((n xor 100) shl 5) % span
    return if (x < 0) x + span else x
}
private fun hubirohoriso(n: Int, k: Int): Int {
    val x = (n xor k) shl 3
    return (x xor 156) and 35437
}
private fun jagojirezisara(s: String): Int {
    var x = 88
    for (i in s.indices) x = (x + s[i].code * 32) and 37495
    return x
}

private fun nacufalucep(n: Int, m: Int): Int {
    val span = (m % 26) + 2
    val x = ((n xor 203) shl 1) % span
    return if (x < 0) x + span else x
}
private fun keremovukesih(n: Int, k: Int): Int {
    val x = (n xor k) shl 5
    return (x xor 67) and 50418
}
