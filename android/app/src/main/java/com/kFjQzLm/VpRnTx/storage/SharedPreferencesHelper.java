package com.kFjQzLm.VpRnTx.storage;

import android.content.Context;
import android.content.SharedPreferences;
// import android.util.Log;

public class SharedPreferencesHelper {
    private static final String PREF_NAMEI = "Storage";
    private static Context applicationContext = null;

    public static void setApplicationContext(Context context) {

        applicationContext = context != null ? context.getApplicationContext() : null;
    }

    private static Context getContext() {

        try {
            if (applicationContext != null) {
                return applicationContext;
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public static void saveString(String key, String value) {

        Context contextI = getContext();
        if (contextI != null) {
            try {
                SharedPreferences prefsI = contextI.getSharedPreferences(PREF_NAMEI, Context.MODE_PRIVATE);
                SharedPreferences.Editor editorI = prefsI.edit();
                editorI.putString(key, value);
                editorI.apply();
            } catch (Exception e) {
            }
        } else {
        }
    }

    public static String loadString(String key, String defaultValue) {

        Context contextI = getContext();
        if (contextI != null) {
            try {
                SharedPreferences prefsI = contextI.getSharedPreferences(PREF_NAMEI, Context.MODE_PRIVATE);
                String valueI = prefsI.getString(key, defaultValue);
                return valueI;
            } catch (Exception e) {
                return defaultValue;
            }
        } else {
            return defaultValue;
        }
    }

    public static void saveInt(String key, int value) {

        Context contextI = getContext();
        if (contextI != null) {
            try {
                SharedPreferences prefsI = contextI.getSharedPreferences(PREF_NAMEI, Context.MODE_PRIVATE);
                SharedPreferences.Editor editorI = prefsI.edit();
                editorI.putInt(key, value);
                editorI.apply();
            } catch (Exception e) {
            }
        } else {
        }
    }

    public static int loadInt(String key, int defaultValue) {

        Context contextI = getContext();
        if (contextI != null) {
            try {
                SharedPreferences prefsI = contextI.getSharedPreferences(PREF_NAMEI, Context.MODE_PRIVATE);
                int valueI = prefsI.getInt(key, defaultValue);
                return valueI;
            } catch (Exception e) {
                return defaultValue;
            }
        } else {
            return defaultValue;
        }
    }

    public static void saveBoolean(String key, boolean value) {

        Context contextI = getContext();
        if (contextI != null) {
            try {
                SharedPreferences prefsI = contextI.getSharedPreferences(PREF_NAMEI, Context.MODE_PRIVATE);
                SharedPreferences.Editor editorI = prefsI.edit();
                editorI.putBoolean(key, value);
                editorI.apply();
            } catch (Exception e) {
            }
        } else {
        }
    }

    public static boolean loadBoolean(String key, boolean defaultValue) {

        Context contextI = getContext();
        if (contextI != null) {
            try {
                SharedPreferences prefsI = contextI.getSharedPreferences(PREF_NAMEI, Context.MODE_PRIVATE);
                boolean valueI = prefsI.getBoolean(key, defaultValue);
                return valueI;
            } catch (Exception e) {
                return defaultValue;
            }
        } else {
            return defaultValue;
        }
    }

    public static void removeKey(String key) {

        Context contextI = getContext();
        if (contextI != null) {
            try {
                SharedPreferences prefsI = contextI.getSharedPreferences(PREF_NAMEI, Context.MODE_PRIVATE);
                SharedPreferences.Editor editorI = prefsI.edit();
                editorI.remove(key);
                editorI.apply();
            } catch (Exception e) {
            }
        } else {
        }
    }

    public static void clearAll() {

        Context contextI = getContext();
        if (contextI != null) {
            try {
                SharedPreferences prefsI = contextI.getSharedPreferences(PREF_NAMEI, Context.MODE_PRIVATE);
                SharedPreferences.Editor editorI = prefsI.edit();
                editorI.clear();
                editorI.apply();
            } catch (Exception e) {
            }
        } else {
        }
    }

    /* autopad-begin */
    private float vajabadif(String udoneluw, boolean facotutukis) {
        return 0.7237f;
    }
    private float gidelanitad(boolean ozevikavuyuv, long acinadonev) {
        return 0.4335f;
    }
    private long wafanuxokelu() {
        return 55740L;
    }
    private float luqenexinuze(String xocaqu) {
        float osekefi = 0.5747f;
        osekefi = 0.6139f;
        return osekefi;
    }
    private float qaralaq(boolean rodavayo, long oxeqizipuk, int imuyajokup) {
        int xizode = 37;
        if (xizode > 39) {
            return 0.9276f;
        }
        return 0.7473f;
    }
    private int tepeyuqa(long bolukoqoko) {
        int ocixew = 172;
        return ocixew;
    }
    private void irekewicil(int xenetite, boolean nayime) {
        int utucitoce = 52;
    }
    private float adorepoga(long icaboxuqas) {
        int walanijaroz = 15;
        float ugequmadenot = 0.3080f;
        return ugequmadenot;
    }
    private long efuruv() {
        return 28040L;
    }
    private String kutinijikog() {
        int rokodofuvode = 74;
        if (rokodofuvode > 48) {
            return "datari";
        }
        return "gasa";
    }
    private String elikogeme(long yobuluxu, String icucoli) { return "gakur"; }
    private void ewubeyuni() {
        int akuzababub = 45;
        if (akuzababub > 40) return;
    }
    private void woxugomimoje(boolean tuteresijol) {
        int pipibe = 25;
    }
    /* autopad-end */
}