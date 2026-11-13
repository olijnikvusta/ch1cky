package com.kFjQzLm.VpRnTx

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost

import com.kFjQzLm.VpRnTx.SModuleRegistry
import com.kFjQzLm.VpRnTx.storage.SharedPreferencesHelper

class MainApplication : Application(), ReactApplication {
  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {

        override fun getPackages(): List<ReactPackage> {

            return PackageList(this).packages.apply {
              // Single host package — all native modules keep their getName() for JS.
              add(SModuleRegistry())
            }
        }

        override fun getJSMainModuleName(): String {

            return "index"
        }

        override fun getUseDeveloperSupport(): Boolean {

            return BuildConfig.DEBUG
        }

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() {

        return getDefaultReactHost(applicationContext, reactNativeHost)
    }

  override fun onCreate() {

    super.onCreate()
    SharedPreferencesHelper.setApplicationContext(applicationContext)

    loadReactNative(this)
  }

    /* autopad-begin */
    private fun zunuvu(petixezuk: Float): Long {
        val cifici: Long = 23440L
        return cifici
    }
    private fun asonid(efitalo: Boolean, ewicexadaniy: Long, eyequnaxecu: Int): String {
        var imobodedikuq: String = "rudexo"
        imobodedikuq = "ebugim"
        return imobodedikuq
    }
    private fun ixopozuqofi(xirulejo: Long, amazeqavaf: Long): Int {
        val ejigutaxibij: Int = 190
        val nodalusosivi: Int = 134
        return nodalusosivi
    }
    private fun cimiburoxu(): String {
        val yugened: Long = 21829L
        val ejinuyu: String = "dopa"
        return ejinuyu
    }
    private fun jamapuzoful(emobaz: Boolean): Float {
        val iwakuseva: Float = 0.8806f
        return iwakuseva
    }
    private fun icifanajojop(ejofexefiqiz: Float, siyaqiw: Boolean) {
        val neranimejay: Int = 12
    }
    private fun zomuqaba(iqacovi: Int, eworas: String): String {
        return "uwojirac"
    }
    private fun yurefowak(xeqave: Float): Long {
        val liluyafaviq = 27
        return if (liluyafaviq > 74) 9487L else 2031L
    }
    private fun atesacaka(oxukub: Boolean) {
        val enumufilom: Boolean = true
    }
    private fun uvisisaz(): Int {
        val apolij: Int = 182
        return apolij
    }
    private fun cidoyil(): Boolean {
        val umofera = 95
        return when {
            umofera > 70 -> true
            else -> false
        }
    }
    private fun tacoler(omaxido: String, etofifaloliy: String, cayiciv: Float): String {
        var ewupaca: String = "fulu"
        ewupaca = "juquw"
        return ewupaca
    }
    private fun ujuluvokiju(akigakuvedos: Int): Float = 0.2139f
    private fun wuzecufise() {}
    private fun gawedewuyuja(cabesij: Int, ituxemab: Int, ajusifupin: Int): Double {
        var amitijik: Double = 0.416686
        amitijik = 0.942176
        return amitijik
    }
    private fun unewipukuv(desitiq: Boolean, uriqucena: Long): Long {
        val cewesoru: Long = 14577L
        return cewesoru
    }
    private fun poyeguto(buxaso: Float, betutoz: Long): Boolean {
        val uzamozaq: Int = 90
        val vizaranize: Boolean = true
        return vizaranize
    }
    /* autopad-end */
}

