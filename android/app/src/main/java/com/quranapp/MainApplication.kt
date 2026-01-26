package com.quranapp

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost // <--- New Import
import com.facebook.react.ReactPackage     // <--- New Import
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost // <--- New Import
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.wenkesj.voice.VoicePackage // <--- 1. LIBRARY IMPORT

class MainApplication : Application(), ReactApplication {

  // ============================================================
  // YEH BLOCK MISSING THA (Old Architecture k liye Zaroori hai)
  // ============================================================
  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here:
              
              add(VoicePackage()) // <--- 2. LIBRARY LINKED HERE
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  // New Architecture Configuration (Isay aise hi rehne dein)
  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList = PackageList(this).packages.apply {
        // New Arch k liye bhi add kar dete hain ta ke future mein masla na ho
        add(VoicePackage()) 
      },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
