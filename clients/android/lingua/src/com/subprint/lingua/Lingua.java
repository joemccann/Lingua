package com.whoopingkof.realtimetwits;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.res.Configuration;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;
import android.webkit.JsResult;
import android.webkit.WebStorage;

import com.whoopingkof.web.WebSocketExtension;

public class RealTimeTwits extends Activity {
	
	/**
	 * WebSocketManager instance
	 */
	private WebSocketExtension socketExtension;

	// Handle orientation changes from landscape to portrait.
	@Override
	public void onConfigurationChanged(Configuration newConfig){        
	    // Just reload the initial view.
		// TODO customize within the CSS? --> http://broadcast.oreilly.com/2010/04/using-css-media-queries-ipad.html
		super.onConfigurationChanged(newConfig);
	}
	
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Add the WebView
        WebView webView = new WebView(this);
       
        // Required to remove NATIVE scrollbars.
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        
        setContentView(webView);
        
        // Configure WebView settings
        WebSettings webSettings = webView.getSettings();
        webSettings.setSavePassword(false);
        webSettings.setSaveFormData(false);
        webSettings.setSupportZoom(false);        
        // Required for use with Lawnchair.
        webSettings.setDatabaseEnabled(true); 
        webSettings.setDatabasePath("/data/data/com.whoopingkof.realtimetwits/databases");
        webSettings.setGeolocationEnabled(true);
        
		// TODO Check if WebChromeClient has already been set
	    // Set WebChromeClient to allow JS dialogs (http://lexandera.com/2009/01/adding-alert-support-to-a-webview/)
	    final Context application = this;
	    webView.setWebChromeClient(new WebChromeClient() {  
	        @Override  
	        public boolean onJsAlert(WebView view, String url, String message, final JsResult result)  
	        {  
	        	// Native toast non blocking...	
	        	Toast.makeText(application, message, Toast.LENGTH_SHORT).show();
	        	result.confirm();
	            return true;  
	        } 
	        
	        // Needed for access to SQLite db.
	        @Override
	        public void onExceededDatabaseQuota(String url, String databaseIdentifier, long currentQuota, long estimatedSize, long totalUsedQuota, WebStorage.QuotaUpdater quotaUpdater) { 
	        	quotaUpdater.updateQuota(204801); 
	        } 
	        
	        // Needed for sending console.log() JavaScript messages to logcat
	        // Run in shell to filter logcat for just the web console: adb logcat WEB_CONSOLE:V *:S
	        // http://developer.android.com/guide/developing/tools/adb.html#logcat
	        public void onConsoleMessage(String message, int lineNumber, String sourceID) {
	        	Log.d("WEB_CONSOLE", message + " -- From line " + lineNumber + " of " + sourceID);
	        }
	    	
	    }); 
        
        // Create the WebSocket extension and expose interface to JS
        this.socketExtension = new WebSocketExtension(webView);

        // Load the application file
        webView.loadUrl("file:///android_asset/index.html");
    }
    
    
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
    	  MenuInflater inflater = getMenuInflater();
    	  inflater.inflate(R.menu.menu_home, menu);
    	  return true;
    }
    
    /* Handles item selections */
    /**
     * {@inheritDoc}
    */
       public boolean onOptionsItemSelected(MenuItem item)
       {
    	   // TODO: Change this
    	if (item.getItemId() == R.id.refresh)
        {
           // For this demo, lets just give back what
           // we found.
           AlertDialog.Builder dialogBuilder = new 
             AlertDialog.Builder(this);
       
          dialogBuilder.setMessage(" You selected " + 
               item.getTitle());
       
           dialogBuilder.setCancelable(true);
           dialogBuilder.create().show();
        }
         
        // Consume the selection event.
         return true;
      }
    
    @Override
    public void onPause()
    {
    	super.onPause();
    	try
    	{
    		this.socketExtension.closeAll();
    	}
    	catch (Exception ex)
    	{
    	}
    }

    @Override
    public void onResume()
    {
    	super.onResume();
    }


}
