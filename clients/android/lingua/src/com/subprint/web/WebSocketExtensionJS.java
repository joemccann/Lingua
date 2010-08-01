package com.whoopingkof.web;

public interface WebSocketExtensionJS 
{

	/**
	 * Open a new WebSocket instance
	 */
	public String open(String uri, String subProtocol);
	
	/**
	 * Close a WebSocket instance
	 * 
	 * @param id	WebSocket id
	 */
	public void close(String id);
	
	/**
	 * Send a WebSocket message
	 * 
	 * @param id		WebSocket ID
	 * @param message	Data to send
	 * @return	True for success, False for error
	 */
	public Boolean send(String id, String data);
	
}
