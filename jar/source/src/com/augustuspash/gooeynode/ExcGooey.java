package com.augustuspash.gooeynode;

import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.augustuspash.gooeynode.GooeyJava.GooeyReciever;

public class ExcGooey {
	public static class Param {
		public String id;
		public String exc;
		public boolean req;
		public Param(String id, String exc, boolean req) {
			this.id = id;
			this.exc = exc;
			this.req = req;
		}
	}
	
	public static void main(String[] args) throws JSONException, IOException {
		String config = args[0];
		JSONObject obj = new JSONObject(new String(Files.readAllBytes(Paths.get(config))));
		String exc = obj.getString("exc");
		JSONArray paramObj = obj.getJSONArray("param");
		Param[][] params = new Param[paramObj.length()][];
		for (int i = 0; i < params.length; i++) {
			JSONArray ja = paramObj.getJSONArray(i);
			params[i] = new Param[ja.length()];
			for (int j = 0; j < ja.length(); j++) {
				JSONObject tmp = ja.getJSONObject(j);
				params[i][j] = new Param(tmp.getString("id"), tmp.getString("exc"), tmp.getBoolean("req"));
			}
		}
		
		GooeyJava server = new GooeyJava(Integer.parseInt(args[1]), new GooeyReciever() {
			@Override
			public void recieve(JSONObject json) {
				try {
					String cmd = exc + " ";
					Param[] param;
					if (json.has("i")) {
						param = params[json.getInt("i")];
					} else {
						param = params[0];
					}
					for (int i = 0; i < param.length; i++) {
						if (param[i].req && param[i].id.equals("") || json.has(param[i].id)) {
							cmd += param[i].exc + " " + (param[i].id.equals("") ? "" : json.getString(param[i].id));
						} else {
							throw new Exception("missing id");
						}
					}
					String[] command = { "cmd", };
					Process p = Runtime.getRuntime().exec(command);
					PrintWriter stdin = new PrintWriter(p.getOutputStream());
				    new Thread(new SyncPipe(p.getErrorStream(), System.err)).start();
				    new Thread(new SyncPipe(p.getInputStream(), System.out)).start();
					stdin.println(cmd);
					stdin.close();
					int returnCode = p.waitFor();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		});
		while (true) {
			server.run();
		}
	}
}
