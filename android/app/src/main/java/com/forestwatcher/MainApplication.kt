package com.forestwatcher

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.marianhello.bgloc.react.BackgroundGeolocationPackage;
import com.cube.rnmbtiles.ReactNativeMBTilesPackage;
import com.forestwatcher.intents.IntentsPackage;
import com.forestwatcher.mapbox.FWMapboxPackage;
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;
import android.os.Build;
import android.os.LocaleList;

class MainApplication : NavigationApplication() {

  override val reactNativeHost: ReactNativeHost =
      object : NavigationReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              add(BackgroundGeolocationPackage())
              add(SafeAreaContextPackage())
              add(FWMapboxPackage())
              add(IntentsPackage())
              add(ReactNativeMBTilesPackage())
            }
        override fun getJSMainModuleName(): String = "index"
        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    // SoLoader.init(this, OpenSourceMergedSoMapping)
    // Note: DefaultNewArchitectureEntryPoint.load() is called by
    // NavigationApplication.super.onCreate() in RNN v8 when newArchEnabled=true.
    // Calling it again here would crash with "Feature flags cannot be overridden more than once".

    // Fix for GFW-791
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        resources.configuration.setLocales(LocaleList.getDefault())
    }
  }

}