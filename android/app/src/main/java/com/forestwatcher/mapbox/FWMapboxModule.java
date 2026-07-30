package com.forestwatcher.mapbox;

import androidx.annotation.NonNull;
import android.util.Log;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.mapbox.mapboxsdk.Mapbox;

/**
 * Simple RN native module to modify some functionality of Mapbox to better support Forest Watcher requirements
 */
public class FWMapboxModule extends ReactContextBaseJavaModule
{
	private static final String TAG = "FWMapboxModule";

	public FWMapboxModule(ReactApplicationContext reactContext)
	{
		super(reactContext);
	}

	@NonNull
	@Override
	public String getName()
	{
		return "FWMapbox";
	}

	/**
	 * Needs to be called after Mapbox access token has been initialised.
	 */
	@ReactMethod
	public void installOfflineModeInterceptor(boolean isOfflineModeEnabled, String mapboxToken)
	{
		getReactApplicationContext().runOnUiQueueThread(new Runnable()
		{
			@Override
			public void run()
			{
				if (mapboxToken == null || mapboxToken.trim().isEmpty())
				{
					Log.w(TAG, "Skipping Mapbox interceptor installation because MAPBOX_TOKEN is empty.");
					return;
				}

				// HttpRequestUtil depends on legacy Mapbox SDK singleton initialisation.
				Mapbox.getInstance(getReactApplicationContext(), mapboxToken);
				MapboxOfflineModeInterceptor.installCustomForestWatcherHttpClient();
				setOfflineModeEnabled(isOfflineModeEnabled);
			}
		});
	}

	@ReactMethod
	public void setOfflineModeEnabled(boolean isOfflineModeEnabled)
	{
		MapboxOfflineModeInterceptor.INSTANCE.setOfflineModeEnabled(isOfflineModeEnabled);
	}
}
