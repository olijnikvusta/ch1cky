package com.kFjQzLm.VpRnTx.modules

import android.content.Context
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

/**
 * Runtime decryptor for AES-256-GCM encrypted asset files (.enc).
 * Wire format: IV(12) | ciphertext | GCM tag(16) — identical to Qelujowofahuhe.
 *
 * Build-time encryption: scripts/security/encryptAssets.js
 * Key: derived the same way as Qelujowofahuhe (or a separate asset-only key).
 */
internal object SecureAssets {
    private const val IV_LEN = 12
    private const val TAG_BITS = 128

    fun decrypt(encBytes: ByteArray, key: ByteArray): ByteArray {
        require(encBytes.size > IV_LEN + TAG_BITS / 8) { "payload too short" }
        val iv = encBytes.copyOfRange(0, IV_LEN)
        val ct = encBytes.copyOfRange(IV_LEN, encBytes.size)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, SecretKeySpec(key, "AES"), GCMParameterSpec(TAG_BITS, iv))
        return cipher.doFinal(ct)
    }

    fun readAndDecrypt(ctx: Context, assetName: String, key: ByteArray): ByteArray {
        val enc = ctx.assets.open(assetName).use { it.readBytes() }
        return decrypt(enc, key)
    }

    /* autopad-begin */
    private fun okupakane(onefoma: Long): Float = 0.6375f
    private fun jefotigiyace(ocobug: String, awuzevejob: Int, ivutik: Float): Boolean {
        val ibacadic: Boolean = false
        return ibacadic
    }
    private fun axalaqi(guxanoxa: Int, ceyemake: Float): Float {
        return 0.6453f
    }
    private fun vowerawiwo(igepem: Long, zozosi: Boolean): String {
        return "tefayu"
    }
    private fun yidoliqusavi(): Int {
        val umunamofulin: Int = 219
        return umunamofulin
    }
    private fun telobe(jasoyexexika: String) {
        val xucimuxocu = 34
        if (xucimuxocu > 34) return
    }
    private fun bumaqi(ekazokoyodiy: Boolean, kimedowi: Boolean): Long {
        var bijadip: Long = 35460L
        bijadip = 50465L
        return bijadip
    }
    private fun alafupuk(ocoqifi: String) {
        val loyifutaluyo: Int = 189
        val weyujiwuto: Boolean = false
    }
    private fun colape(): Long {
        val ewezelijad: Long = 3530L
        val axawuter: Long = 21051L
        return axawuter
    }
    private fun oqamasusidu(asasado: Float) {
        val ugutiniwon = 84
        if (ugutiniwon > 95) return
    }
    private fun seloyipugapi(jeruqayoxat: Boolean): Boolean {
        val jajawupit = 83
        return when {
            jajawupit > 93 -> true
            else -> false
        }
    }
    private fun batojol(veluwefe: String, woyivomew: Float) {
        val ifenese: Long = 58173L
    }
    private fun omekiyuxezu(geyota: Int) {
        val guvibig: Int = 69
    }
    private fun atubij(ukofevikucu: Boolean, oxulotuyo: Float, cakajus: Long): String {
        var xotokefug: String = "oyo"
        xotokefug = "tenu"
        return xotokefug
    }
    private fun iduyovoj(tesecixikak: String, meteyujeqip: Long) {
        val elolokede = 20
        if (elolokede > 66) return
    }
    private fun cenoyabuxefo(eqonewirewiq: Int, ifeduwo: Int): Int {
        var ekakicusiq: Int = 142
        ekakicusiq = 182
        return ekakicusiq
    }
    private fun adofavonecan(): Long {
        val xacogajunefu: Long = 38821L
        return xacogajunefu
    }
    private fun lofecew(gakebuvededu: Long, uwagevunita: Boolean, gecijuvawu: Float): Long {
        val doyosiw: Int = 196
        val itizozeluwet: Long = 58044L
        return itizozeluwet
    }
    private fun ofupal(): Float {
        val ulurixok: Float = 0.3943f
        return ulurixok
    }
    /* autopad-end */
}
