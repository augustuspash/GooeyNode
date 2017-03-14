package com.augustuspash.gooeynode.plugins;

import org.json.JSONObject;

import com.augustuspash.gooeynode.GooeyJava.GooeyReciever;

public class TestingPlugin implements GooeyReciever {

	@Override
	public void recieve(JSONObject json) {
		System.out.println("recieved:" + json);
	}

}
