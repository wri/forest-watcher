package com.forestwatcher

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.security.ProviderInstaller
import com.reactnativenavigation.NavigationActivity

class MainActivity : NavigationActivity(), ProviderInstaller.ProviderInstallListener {

    private val PROVIDER_INSTALLER_RECOVERY_REQUEST_CODE = 1
    private var retryProviderInstall = false

    override fun onCreate(savedInstanceState: Bundle?) {
        // Rewrite ACTION_SEND intents before super so RN Linking.getInitialURL() can read the URI.
        // When sharing via the Files app or other apps, the URI is in EXTRA_STREAM rather than
        // Intent.getData(), which is what RN's Linking module reads.
        intent?.let { rewriteSendIntentAsView(it) }
        super.onCreate(savedInstanceState)
        ProviderInstaller.installIfNeededAsync(this, this)
    }

    override fun onNewIntent(intent: Intent) {
        rewriteSendIntentAsView(intent)
        super.onNewIntent(intent)
    }

    /**
     * For ACTION_SEND intents (e.g. "Share" from Files app), the file URI is placed in
     * EXTRA_STREAM rather than Intent.getData(). React Native's Linking module only reads
     * Intent.getData(), so we rewrite the intent to ACTION_VIEW with the URI as data.
     */
    private fun rewriteSendIntentAsView(intent: Intent) {
        if (intent.action == Intent.ACTION_SEND) {
            val uri: Uri? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
            } else {
                @Suppress("DEPRECATION")
                intent.getParcelableExtra(Intent.EXTRA_STREAM)
            }
            if (uri != null) {
                intent.data = uri
                intent.action = Intent.ACTION_VIEW
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == PROVIDER_INSTALLER_RECOVERY_REQUEST_CODE) {
            // Adding a fragment via GoogleApiAvailability.showErrorDialogFragment
            // before the instance state is restored throws an error. So instead,
            // set a flag here, which will cause the fragment to delay until
            // onPostResume.
            retryProviderInstall = true
        }
    }

    override fun onPostResume() {
        super.onPostResume()
        if (retryProviderInstall) {
            // We can now safely retry installation.
            ProviderInstaller.installIfNeededAsync(this, this)
        }
        retryProviderInstall = false
    }

    override fun onProviderInstalled() {
        Log.d("3SC", "Updated security provider successfully")
    }

    override fun onProviderInstallFailed(errorCode: Int, recoveryIntent: Intent?) {
        Log.d("3SC", "Unable to update security provider: $errorCode")
        val availability = GoogleApiAvailability.getInstance()
        if (availability.isUserResolvableError(errorCode)) {
            // Recoverable error. Show a dialog prompting the user to
            // install/update/enable Google Play services.
            availability.showErrorDialogFragment(this, errorCode, PROVIDER_INSTALLER_RECOVERY_REQUEST_CODE)
        }
    }
}