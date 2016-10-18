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
import eu.brolien.appiot_java_example.data.Room;
import eu.brolien.appiot_java_example.data.TaggedData;
import se.sigma.sensation.client.sdk.SensationException;
import se.sigma.sensation.client.sdk.dto.LocationResponse;
import se.sigma.sensation.client.sdk.dto.PagedResponse;
import se.sigma.sensation.client.sdk.dto.SensorCollectionResponse;
import se.sigma.sensation.client.sdk.dto.SensorListResponse;

@Service
public class RoomCache {

    private static final Logger log = LoggerFactory.getLogger(TestServiceLister.class);

    private List<Room> rooms = new ArrayList<>();

    @Autowired
    private Connector connector;

    public void refresh() throws SensationException, ClientProtocolException, IOException {
        if (rooms.isEmpty()) {
            buildData();
        } else {
            refreshSensors();
        }
    }

    private void refreshSensors() throws SensationException {
        for (Room room : rooms) {
            updateSensorData(room, room.getSensorCollectionId());
        }
    }

    private void buildData() throws SensationException, ClientProtocolException, IOException {
        List<Room> rooms = new ArrayList<>();
        List<LocationResponse> locations = connector.getLocationManager().getLocations();
        Map<String, LocationResponse> map = new HashMap<>();
        for (LocationResponse loc : locations) {
            map.put(loc.id, loc);
        }

        for (LocationResponse loc : locations) {
            PagedResponse<SensorCollectionResponse> sensors = connector.getLocationManager()
                    .getSensorCollections(loc.id);

            System.out.println(loc.name + " " + loc.getParentLocationName() + " type: " + loc.getLocationType());

            Iterator<SensorCollectionResponse> iter = sensors.rows.iterator();

            Room room = new Room();

            room.setLocationName(loc.name);
            room.setFloor(loc.parentLocationName);
            room.setId(loc.id);
            room.setName(loc.name);
            LocationResponse parent = map.get(loc.parentLocationId);
            if (parent != null) {
                room.setSite(parent.parentLocationName);
            }
            while (iter.hasNext()) {
                SensorCollectionResponse resp = iter.next();

                String json = connector.getSensorCollectionManager().getById(resp.getId());

                Gson gson = new Gson();

                TaggedData taggedData = gson.fromJson(json, TaggedData.class);

                if (taggedData.hasTag("conference room") || taggedData.hasTag("Minimeeting room")) {

                    room.addTags(taggedData.Tags);

                    room.setSensorCollectionId(resp.getId());

                    updateSensorData(room, resp.getId());
                    rooms.add(room);
                }
            }
        }
        this.rooms = rooms;
    }

    private void updateSensorData(Room room, String id) throws SensationException {
        List<SensorListResponse> sensor = connector.getSensorCollectionManager().getSensors(id);


        for (SensorListResponse slr : sensor) {
            if (slr.getLatestMeasurement() != null) {
                switch (slr.getSensorTypeTypeId()) {

                case 1000: // booking
                    room.setBooking(slr.getLatestMeasurement().getValues()[0]);
                    break;
                case 1: // temp actual
                    room.setActualTemp(slr.getLatestMeasurement().getValues()[0]);
                    break;
                case 2: // temp set
                    room.setSetTemp(slr.getLatestMeasurement().getValues()[0]);
                    break;
                case 8: // presence
                    room.setPresence(slr.getLatestMeasurement().getValues()[0]);
                    break;
                case 68: // presence LORA
                    room.setPresence(slr.getLatestMeasurement().getValues()[0]);
                }
            }
        }
    }

    public List<Room> getRooms() {
        return new ArrayList<>(rooms);
    }

}
