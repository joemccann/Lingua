package com.subprint.lingua;


import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.res.Configuration;
import android.location.LocationManager;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;
import android.widget.TableLayout.LayoutParams;
import android.webkit.JsResult;
import android.webkit.WebStorage;


public class Lingua extends Activity {
	

	/**
	 * WebView instance Needs to be a private member of the class so other
	 * methods have access.
	 */
	private WebView webView;

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		// Add the WebView
		webView = new WebView(this);
		webView.setLayoutParams(new LayoutParams(LayoutParams.FILL_PARENT,
				LayoutParams.FILL_PARENT));
		// Required to remove NATIVE scrollbars.
		webView.setVerticalScrollBarEnabled(false);
		webView.setHorizontalScrollBarEnabled(false);

		setContentView(webView);

		// Configure WebView settings
		WebSettings webSettings = webView.getSettings();
		webSettings.setSavePassword(false);
		webSettings.setSaveFormData(false);
		webSettings.setSupportZoom(false);
		webSettings.setBuiltInZoomControls(false);
		webSettings.setJavaScriptEnabled(true);

		// Required for use with Lawnchair.
		webSettings.setDatabaseEnabled(true);
		webSettings
				.setDatabasePath("/data/data/com.subprint.Lingua/databases");
		webSettings.setGeolocationEnabled(true);

		// TODO Check if WebChromeClient has already been set
		// Set WebChromeClient to allow JS dialogs
		// (http://lexandera.com/2009/01/adding-alert-support-to-a-webview/)
		final Context application = this;
		webView.setWebChromeClient(new WebChromeClient() {
			@Override
			public boolean onJsAlert(WebView view, String url, String message,
					final JsResult result) {
				// Native toast non blocking...
				Toast.makeText(application, message, Toast.LENGTH_SHORT).show();
				result.confirm();
				return true;
			}

			// Needed for access to SQLite db.
			@Override
			public void onExceededDatabaseQuota(String url,
					String databaseIdentifier, long currentQuota,
					long estimatedSize, long totalUsedQuota,
					WebStorage.QuotaUpdater quotaUpdater) {
				quotaUpdater.updateQuota(204801);
			}

			// Needed for sending console.log() JavaScript messages to logcat
			// Run in shell to filter logcat for just the web console: adb
			// logcat WEB_CONSOLE:V *:S
			// http://developer.android.com/guide/developing/tools/adb.html#logcat
			public void onConsoleMessage(String message, int lineNumber,
					String sourceID) {
				Log.d("WEB_CONSOLE", message + " -- From line " + lineNumber
						+ " of " + sourceID);
			}

		});


		// Load the application file
		webView.loadUrl("file:///android_asset/index.html");
	}

	// Handle orientation changes from landscape to portrait.
	/**
	 * {@inheritDoc}
	 */
	@Override
	public void onConfigurationChanged(Configuration newConfig) {
		// TODO customize within the CSS? -->
		// http://broadcast.oreilly.com/2010/04/using-css-media-queries-ipad.html
		// Changed the android:configChanges="orientation" in this Activity's
		// declaration in the Manifest.
		super.onConfigurationChanged(newConfig);
	}

	// Overrides the default "back" button, which would exit the app, and
	// instead uses the browser history.
	/**
	 * {@inheritDoc}
	 */
	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event) {
		if ((keyCode == KeyEvent.KEYCODE_BACK) && webView.canGoBack()) {
			webView.goBack();
			return true;
		}
		return super.onKeyDown(keyCode, event);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		MenuInflater inflater = getMenuInflater();
//		inflater.inflate(R.menu.menu_home, menu);
		return true;
	}

	/**
	 * {@inheritDoc}
	 */
	public boolean onOptionsItemSelected(MenuItem item) {
		// Consume the selection event.
		return true;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public void onPause() {
		// TODO: Capture current page (the html file) and 'save' it.
		super.onPause();
		try {
		} catch (Exception ex) {
		}

	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public void onResume() {
		super.onResume();
	}


}
