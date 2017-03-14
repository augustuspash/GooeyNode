package com.augustuspash.gooeynode;

import java.net.ServerSocket;
import java.net.Socket;

import org.json.JSONObject;

import java.io.*;

public class GooeyJava {
	ServerSocket providerSocket;
	Socket connection = null;
	DataOutputStream out;
	DataInputStream in;
	String message;
	int port;
	GooeyReciever reciever;

	GooeyJava(int port, GooeyReciever reciever) {
		this.port = port;
		this.reciever = reciever;
	}
	
	public interface GooeyReciever {
		public void recieve(JSONObject json);
	}

	void run() {
		try {
			providerSocket = new ServerSocket(port);
			connection = providerSocket.accept();
			out = new DataOutputStream(connection.getOutputStream());
			out.flush();
			in = new DataInputStream(connection.getInputStream());
			do {
				message = in.readLine();
				if (message != null) {
					reciever.recieve(new JSONObject(message));
					break;
				}
			} while (true);
		} catch (IOException ioException) {
			ioException.printStackTrace();
		} finally {
			try {
				in.close();
				out.close();
				providerSocket.close();
			} catch (IOException ioException) {
				ioException.printStackTrace();
			}
		}
	}

	public static void main(String args[]) {
		GooeyJava server = new GooeyJava(6969, new GooeyReciever() {
			@Override
			public void recieve(JSONObject json) {
				System.out.println("recieved");
			}
		});
		while (true) {
			server.run();
		}
	}
}
