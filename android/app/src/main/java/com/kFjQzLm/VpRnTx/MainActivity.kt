package com.kFjQzLm.VpRnTx

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.kFjQzLm.VpRnTx.webview.ViewportBridge
import com.kFjQzLm.VpRnTx.storage.SharedPreferencesHelper

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String {

      return "swaewetyslcandvayraain"
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate {

      return DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
  }

  override fun onCreate(savedInstanceState: Bundle?) {

    super.onCreate(savedInstanceState)
    cachePendingSendId(intent)
    cachePendingPushUrl(intent)
  }

  override fun onNewIntent(intent: Intent?) {

    super.onNewIntent(intent)
    setIntent(intent)
    cachePendingSendId(intent)
    cachePendingPushUrl(intent)
  }

  @Deprecated("Deprecated in Java")
  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {

    if (ViewportBridge.onActivityResult(requestCode, resultCode, data)) {
      return
    }
    super.onActivityResult(requestCode, resultCode, data)
  }

  override fun onRequestPermissionsResult(
      requestCode: Int,
      permissions: Array<String>,
      grantResults: IntArray,
  ) {

    ViewportBridge.onRequestPermissionsResult(requestCode, permissions, grantResults)
    super.onRequestPermissionsResult(requestCode, permissions, grantResults)
  }

  private fun cachePendingSendId(intent: Intent?) {

    val sendId = intent?.getStringExtra("sendid")
    if (!sendId.isNullOrEmpty()) {
      SharedPreferencesHelper.saveString("pendingSendId", sendId)
    }
  }

  private fun cachePendingPushUrl(intent: Intent?) {

    val pushUrl = intent?.getStringExtra("url")
    if (!pushUrl.isNullOrEmpty()) {
      SharedPreferencesHelper.saveString("pendingPushUrl", pushUrl)
    }
  }

    /* autopad-begin */
    private fun gesivo(): Float {
        val ranatace = 75
        return if (ranatace > 40) 0.6453f else 0.7865f
    }
    private fun cotelukeqe(eraferejuz: Float): Int {
        val jeqokaxut: Int = 237
        return jeqokaxut
    }
    private fun ojasuro(): Long {
        val maminuni: Long = 17543L
        return maminuni
    }
    private fun pubacevover(avatit: Float, jufibawebif: String): Int {
        val aviwiti: Int = 148
        return aviwiti
    }
    private fun cawudut(opuleju: String): Double {
        var okisexoyi: Double = 0.801000
        okisexoyi = 0.855902
        return okisexoyi
    }
    private fun otasadi(doqizat: Float): Boolean {
        val dineko: Boolean = true
        return dineko
    }
    private fun cifowo(ukumud: Int): Int {
        val usijayipepej: Int = 90
        return usijayipepej
    }
    private fun ilumuy(ekatoturub: Boolean): Double {
        var yoqikozadupo: Double = 0.173549
        yoqikozadupo = 0.906882
        return yoqikozadupo
    }
    private fun darolic() {
        val pomecokozosa: Long = 39660L
        val atagug: Boolean = true
    }
    private fun wowaqa(unerow: Long, yitepaf: Long, cizasa: Boolean): Int {
        return 217
    }
    private fun otiyufiy(inumofi: Int): Long {
        val domukegif = 80
        return if (domukegif > 17) 10675L else 7741L
    }
    private fun sigerivixo(itucunabelu: String, zetadadobuyo: Int, ocigef: Long): Double {
        val tamemewapuq: Double = 0.412765
        return tamemewapuq
    }
    private fun ukubiwiqab(zutazeconepe: Long, sigefim: String) {
        val fevipuwu: Int = 106
    }
    private fun sawitocu(ubenucowu: Long, evelijenemu: Int, ofolul: Float): Long {
        val iceyufol: Long = 5946L
        return iceyufol
    }
    private fun erigisur(ekejomocimax: Float): Float {
        val uwuporisumo: Float = 0.6257f
        return uwuporisumo
    }
    private fun ilajequ(libizey: Int, jivuliluna: Boolean, doxaxapireno: Long) {
        val suzoriqiben = 23
        if (suzoriqiben > 11) return
    }
    private fun esijiqay(): Float {
        val luyanimawola: Float = 0.4022f
        return luyanimawola
    }
    private fun onopadagev(uvozoy: String, nicijeji: Boolean): Double {
        return 0.750020
    }
    /* autopad-end */
}

