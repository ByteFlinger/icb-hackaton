package eu.brolien.appiot_java_example;

import java.util.Properties;

import org.springframework.context.ApplicationContext;

public class ApplicationProperties {

	public static final String KEY_TENANT 		= "tenant";
	public static final String KEY_RESOURCE_ID 	= "resourceId";
	public static final String KEY_CLIENT_ID 	= "clientId";
	public static final String KEY_API_ADDRESS 	= "apiAddress";
	public static final String KEY_USERNAME 	= "username";
	public static final String KEY_PASSWORD 	= "password";
	public static final String KEY_DEVICE_NETWORK_ID= "deviceNetworkId";
	private static final String[] KEYS = {KEY_TENANT, KEY_RESOURCE_ID, KEY_CLIENT_ID, KEY_API_ADDRESS, KEY_USERNAME, KEY_PASSWORD, KEY_DEVICE_NETWORK_ID};
	
	public static Properties load(ApplicationContext ctx) {
		Properties props = new Properties();
		for (String key : KEYS) {
			System.out.println(key);
			props.setProperty(key, ctx.getEnvironment().getProperty(key));
		}
		return props;
	}
}
