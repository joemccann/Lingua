
package com.subprint.lingua;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;

import com.phonegap.*;

public class Lingua extends DroidGap
{
@Override
public void onCreate(Bundle savedInstanceState)
{
super.onCreate(savedInstanceState);
super.loadUrl("file:///android_asset/index.html");

}
}
