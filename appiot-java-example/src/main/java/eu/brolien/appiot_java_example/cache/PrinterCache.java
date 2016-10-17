package eu.brolien.appiot_java_example.cache;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.http.client.ClientProtocolException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;

import eu.brolien.appiot_java_example.Connector;
import eu.brolien.appiot_java_example.TestServiceLister;
import eu.brolien.appiot_java_example.data.Printer;
import se.sigma.sensation.client.sdk.SensationException;
import se.sigma.sensation.client.sdk.dto.LocationResponse;
import se.sigma.sensation.client.sdk.dto.PagedResponse;
import se.sigma.sensation.client.sdk.dto.SensorCollectionResponse;

@Service
public class PrinterCache {

    private static final Logger log = LoggerFactory.getLogger(TestServiceLister.class);

    private List<Printer> printers = new ArrayList<>();

    @Autowired
    private Connector connector;

    @SuppressWarnings("unchecked")
    public void refresh() throws SensationException, ClientProtocolException, IOException {
        List<Printer> printers = new ArrayList<>();
        List<LocationResponse> locations = connector.getLocationManager().getLocations();
        for (LocationResponse loc : locations) {
            PagedResponse<SensorCollectionResponse> sensors = connector.getLocationManager()
                    .getSensorCollections(loc.id);
            Iterator<SensorCollectionResponse> iter = sensors.rows.iterator();
            while (iter.hasNext()) {
                SensorCollectionResponse resp = iter.next();
                
                System.out.println(resp.getId());

                String json = connector.getSensorCollectionManager().getById(resp.getId());

                Gson gson = new Gson();

                Map<String, Object> map = new HashMap<>();
                map = gson.fromJson(json, map.getClass());

                Object tags = map.get("Tags");
                if (tags.toString().contains("LaserJet")) {
                    Printer p = new Printer();
                    p.setId(resp.getId());
                    p.setName(resp.getName());
                    printers.add(p);
                }
            }
        }
        this.printers = printers;

    }

    public List<Printer> getPrinters() {
        return printers;
    }

}
