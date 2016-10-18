package eu.brolien.appiot_java_example.data;

import java.util.ArrayList;
import java.util.List;

public class Room extends Device{

    private String locationName;
    private boolean booking;
    private double actualTemp;
    private double setTemp;
    private boolean presence;
    private String sensorLocationId;
    private String sensorCollectionId;

    private String floor;
    private String site;
    private List<String> tags = new ArrayList<>();

    public String getLocationName() {
        return locationName;
    }

    public String getSensorCollectionId() {
        return sensorCollectionId;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public List<String>  getTags() {
        return tags;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public boolean isBooking() {
        return booking;
    }

    public void setBooking(boolean booking) {
        this.booking = booking;
    }

    public boolean isPresence() {
        return presence;
    }

    public void setPresence(boolean presence) {
        this.presence = presence;
    }

    public double getActualTemp() {
        return actualTemp;
    }

    public String getSensorLocationId() {
        return sensorLocationId;
    }

    public void setSensorLocationId(String sensorLocationId) {
        this.sensorLocationId = sensorLocationId;
    }

    public String getFloor() {
        return floor;
    }

    public double getSetTemp() {
        return setTemp;
    }

    public void setBooking(double d) {
        booking = d > 0;
        
    }

    public void setActualTemp(double d) {
        actualTemp = d;
    }

    public void setSetTemp(double d) {
        setTemp = d;
    }

    public void setPresence(double d) {
        presence = d > 0;
    }

    public void setSensorCollectionId(String id) {
        sensorCollectionId = id;
    }

    public void setFloor(String floor) {
        this.floor = floor;
    }


    public String getSite() {
        return site;
    }

    public void setSite(String site) {
        this.site = site;
    }


    public void addTags(List<Tag> tags) {
        for (Tag tag : tags) {
            if (!this.tags.contains(tag.Name)) {
                this.tags.add(tag.Name);
            }
        }
    }

    
}
