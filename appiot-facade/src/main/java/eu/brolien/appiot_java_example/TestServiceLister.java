package eu.brolien.appiot_java_example;

import java.util.Iterator;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;

import se.sigma.sensation.client.sdk.dto.DeviceNetworkResponse;
import se.sigma.sensation.client.sdk.dto.LocationResponse;
import se.sigma.sensation.client.sdk.dto.PagedResponse;
import se.sigma.sensation.client.sdk.dto.SensorCollectionResponse;
import se.sigma.sensation.client.sdk.dto.SensorListResponse;

@Service
public class TestServiceLister {

    private static final Logger log = LoggerFactory.getLogger(TestServiceLister.class);

    @Autowired
    private Connector connector;

    public TestServiceLister() {
        //Executors.newSingleThreadScheduledExecutor().scheduleAtFixedRate(this::listResources, 1, 10, TimeUnit.SECONDS);
        //Executors.newSingleThreadScheduledExecutor().scheduleAtFixedRate(this::listTags, 1, 10, TimeUnit.SECONDS);
        //Executors.newSingleThreadScheduledExecutor().scheduleAtFixedRate(this::listDevices, 1, 10, TimeUnit.SECONDS);
        //Executors.newSingleThreadScheduledExecutor().scheduleAtFixedRate(this::listLocations, 1, 10, TimeUnit.SECONDS);

    }

    private void listResources() {
        try {
            System.out.println("-----Resources-----");
            System.out.println(connector.getResourceManager().get());
        } catch (Exception e) {
            log.warn("", e);
        }
    }

    private void listTags() {
        try {
            System.out.println("----TAGS----");
            System.out.println(connector.getTagManager().get());
        } catch (Exception e) {
            log.warn("", e);
        }

    }

    private void listDevices() {
        try {
            System.out.println("----DEVS----");
            List<DeviceNetworkResponse> resp =  connector.getDeviceManager().getDeviceNetworks();
        } catch (Exception e) {
            log.warn("", e);
        }

    }

    private void listLocations() {
        try {
            
            System.out.println("----Locations----");
            List<LocationResponse> locations = connector.getLocationManager().getLocations();
            
            System.out.println("Locations: " + locations.size());
            
            for (LocationResponse loc : locations) {
                System.out.println(loc.externalId + " " + loc.locationType + " " + loc.name);
                
                PagedResponse<SensorCollectionResponse> sensors = connector.getLocationManager().getSensorCollections(loc.id);
                Iterator<SensorCollectionResponse> iter = sensors.rows.iterator();
                while (iter.hasNext()) {
                    SensorCollectionResponse resp = iter.next();
                    
                    System.out.println(resp.getLocationName() + " " + resp.getName() + " " + resp.getId());

                    System.out.println(connector.getSensorCollectionManager().getById(resp.getId()));
                    
                    SensorCollectionResponse sensor = connector.getSensorCollectionManager().getSensorCollection(resp.getId());
                    System.out.println(new Gson().toJson(sensor));
                    
                }
                
            }
            
        } catch (Exception e) {
            log.warn("", e);
        }

    }

    
}
