# ProGuard rules for Body Region Detection App

# ===========================================
# MediaPipe Tasks Vision
# ===========================================

# Keep MediaPipe classes
-keep class com.google.mediapipe.** { *; }
-dontwarn com.google.mediapipe.**

# Keep WASM-related classes
-keep class org.chromium.** { *; }
-dontwarn org.chromium.**

# Keep TensorFlow Lite (used by MediaPipe)
-keep class org.tensorflow.** { *; }
-dontwarn org.tensorflow.**

# ===========================================
# Capacitor
# ===========================================

# Keep Capacitor classes
-keep class com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**

# Keep Capacitor plugins
-keep class com.capacitor.** { *; }
-dontwarn com.capacitor.**

# ===========================================
# Android WebView
# ===========================================

# Keep WebView JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ===========================================
# General Android Rules
# ===========================================

# Keep annotations
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# Keep enum values
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelable
-keepclassmembers class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

# Keep Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ===========================================
# React Native / WebView Bridge
# ===========================================

# Keep JavaScript interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ===========================================
# Performance Optimizations
# ===========================================

# Remove logging in release
-assumenosideeffects class android.util.Log {
    public static int v(...);
    public static int d(...);
    public static int i(...);
}

# Optimize string operations
-optimizationpasses 5
-optimizations !code/simplification/arithmetic,!field/*,!class/merging/*

# ===========================================
# Suppress Warnings
# ============================================

-dontwarn javax.annotation.**
-dontwarn sun.misc.Unsafe
-dontwarn android.webkit.WebView
