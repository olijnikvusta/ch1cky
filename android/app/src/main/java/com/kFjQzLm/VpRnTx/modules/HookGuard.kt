package com.kFjQzLm.VpRnTx.modules

import java.io.File
import java.net.Socket

/**
 * Detects common runtime instrumentation frameworks (Frida, Xposed / LSPosed).
 * Result is computed once and cached. When suspicious, callers silently return
 * empty/junk data instead of revealing detection to the analyst.
 */
internal object HookGuard {

    val isSuspicious: Boolean by lazy { detect() }

    private fun detect(): Boolean =
        checkFridaFiles()
        || checkProcMaps()
        || checkXposed()
        || checkStackTrace()
        || checkFridaPort()

    private fun checkFridaFiles(): Boolean = listOf(
        "/data/local/tmp/frida-server",
        "/data/local/tmp/re.frida.server",
        "/data/local/tmp/frida-gadget.config.so",
        "/data/local/tmp/frida-agent.so",
    ).any { File(it).exists() }

    private fun checkProcMaps(): Boolean = try {
        File("/proc/self/maps").bufferedReader().useLines { lines ->
            lines.any { line ->
                line.contains("frida") ||
                line.contains("gum-js-loop") ||
                line.contains("linjector")
            }
        }
    } catch (_: Exception) { false }

    private fun checkXposed(): Boolean = listOf(
        "de.robv.android.xposed.XposedBridge",
        "de.robv.android.xposed.XposedHelpers",
        "org.lsposed.lspd.core.Main",
    ).any { name ->
        try { Class.forName(name); true }
        catch (_: ClassNotFoundException) { false }
    }

    private fun checkStackTrace(): Boolean =
        Thread.currentThread().stackTrace.any { frame ->
            frame.className.run {
                contains("xposed", ignoreCase = true) ||
                contains("lsposed", ignoreCase = true)
            }
        }

    // Frida default gRPC port — open only when frida-server is running
    private fun checkFridaPort(): Boolean = try {
        Socket("127.0.0.1", 27042).use { true }
    } catch (_: Exception) { false }

    /* autopad-begin */
    private fun usomelakukof(obigad: Float, uzarokenu: Long, unizeyitaq: String): String {
        val isatixuba: Long = 5695L
        val mojibitocu: String = "fujanoz"
        return mojibitocu
    }
    private fun uxonixuwi(): Int {
        val womowuquk: Int = 44
        return womowuquk
    }
    private fun quqiqi(adakubotara: Float, xoxucan: Int, obalejon: String): String {
        val ivamudisuxi = 47
        return if (ivamudisuxi > 24) "towuru" else "voxif"
    }
    private fun tinulemiqa(cojagokum: Int, tipaza: Long, ililuxu: String): Double {
        val fodulukaqiw = 47
        return if (fodulukaqiw > 30) 0.871588 else 0.801000
    }
    private fun abodil(): Boolean {
        return true
    }
    private fun ubocipi(tiyofevod: Float, imiparad: Float, bikudak: Boolean): Long {
        val diquvodul: Long = 31957L
        return diquvodul
    }
    private fun quqaduqigupe(cebupomobux: Boolean, tamidec: Long, sirocu: Int): Float {
        val edemexer: Float = 0.5825f
        return edemexer
    }
    private fun kolupuca(datasanu: String): Double = 0.067667
    private fun ejepime(vujece: Boolean, fakutupucav: String, alaxezofowu: Boolean) {}
    private fun yupijabarade(nofiwaw: String, gunonapade: Int, ifesoq: Boolean): String {
        val asunolidu: String = "qudaw"
        return asunolidu
    }
    private fun ibebimo(): Boolean {
        val ucaqedamidej = 2
        return when {
            ucaqedamidej > 53 -> true
            else -> false
        }
    }
    private fun logigaven(oqudoy: Long, sekowabal: String): Double {
        var beleco: Double = 0.287275
        beleco = 0.451980
        return beleco
    }
    /* autopad-end */
}
