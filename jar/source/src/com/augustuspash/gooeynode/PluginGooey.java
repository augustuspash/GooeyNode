package com.augustuspash.gooeynode;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.json.JSONException;
import org.json.JSONObject;

import com.augustuspash.gooeynode.GooeyJava.GooeyReciever;

public class PluginGooey {
	public static void main(String[] args) {
		String config = args[0];
		JSONObject obj;
		try {
			obj = new JSONObject(new String(Files.readAllBytes(Paths.get(config))));
			File dir = new File(obj.getString("path"));
			URL loadPath= dir.toURI().toURL();
			URL[] classUrl = new URL[]{loadPath};

			ClassLoader cl = new URLClassLoader(classUrl);

			Class<?> loadedClass = cl.loadClass(obj.getString("classname"));
			GooeyReciever reciever = (GooeyReciever) loadedClass.newInstance();
			
			GooeyJava server = new GooeyJava(Integer.parseInt(args[1]), reciever);
			while (true) {
				server.run();
			}
		} catch (JSONException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		} catch (InstantiationException e) {
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			e.printStackTrace();
		}
		
	}
	
}
