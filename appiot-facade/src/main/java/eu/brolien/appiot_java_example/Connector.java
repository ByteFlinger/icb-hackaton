package eu.brolien.appiot_java_example;

import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Service;

import se.sigma.sensation.client.sdk.AuthenticationException;
import se.sigma.sensation.client.sdk.AuthenticationManager;
import se.sigma.sensation.client.sdk.ClientManager;
import se.sigma.sensation.client.sdk.apimanagers.DeviceNetworkManager;
import se.sigma.sensation.client.sdk.apimanagers.LocationManager;
import se.sigma.sensation.client.sdk.apimanagers.ResourceManager;
import se.sigma.sensation.client.sdk.apimanagers.SensorCollectionManager;
import se.sigma.sensation.client.sdk.apimanagers.TagManager;

@Service
public class Connector implements ApplicationContextAware {
    private static final Logger log = LoggerFactory.getLogger(Connector.class);

    private ResourceManager resourceManager;
    private TagManager tagManager;

    private DeviceNetworkManager deviceManager;

    private LocationManager locationManager;

    private SensorCollectionManager sensorCollectionManager;

    private void setup(ApplicationContext ctx) {

        Properties props = ApplicationProperties.load(ctx);

        try {
            log.info("connecting with user: " + props.getProperty(ApplicationProperties.KEY_USERNAME));
            String authorizationToken = AuthenticationManager.getAuthorizationToken(
                    props.getProperty(ApplicationProperties.KEY_TENANT),
                    props.getProperty(ApplicationProperties.KEY_RESOURCE_ID),
                    props.getProperty(ApplicationProperties.KEY_CLIENT_ID),
                    props.getProperty(ApplicationProperties.KEY_USERNAME),
                    props.getProperty(ApplicationProperties.KEY_PASSWORD));

            log.info("got auth token: " + authorizationToken);
            ClientManager clientApi = new ClientManager(props.getProperty(ApplicationProperties.KEY_API_ADDRESS),
                    authorizationToken);
            clientApi.setDeviceNetwork(props.getProperty(ApplicationProperties.KEY_DEVICE_NETWORK_ID));
            log.info("got client api");
            resourceManager = clientApi.getResourceManager();
            tagManager = clientApi.getTagManager();
            tagManager.setDeviceNetworkId(props.getProperty(ApplicationProperties.KEY_DEVICE_NETWORK_ID));
            resourceManager.setDeviceNetworkId(props.getProperty(ApplicationProperties.KEY_DEVICE_NETWORK_ID));
            deviceManager = clientApi.getDeviceNetworkManager();
            locationManager = clientApi.getLocationManager();
            locationManager.setDeviceNetworkId(props.getProperty(ApplicationProperties.KEY_DEVICE_NETWORK_ID));
            sensorCollectionManager = clientApi.getSensorCollectionManager();
            log.info("resource manager base address: " + resourceManager.getManagerBaseAddress());
            log.info("location manager base address: " + locationManager.getManagerBaseAddress());
            
        } catch (AuthenticationException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        setup(applicationContext);

    }

    public ResourceManager getResourceManager() {
        return resourceManager;
    }

    public TagManager getTagManager() {
        return tagManager;
    }

    public DeviceNetworkManager getDeviceManager() {
        return deviceManager;
    }
    
    public LocationManager getLocationManager() {
        return locationManager;
    }
    
    public SensorCollectionManager getSensorCollectionManager() {
        return sensorCollectionManager;
    }

}
