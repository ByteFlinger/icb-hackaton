package eu.brolien.appiot_java_example.data;

public class Device {

    private String id;
    private String externalId;
    private String name;
    
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getExternalId() {
        return externalId;
    }
    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    
    @Override
    public String toString() {
        return "Printer [id=" + id + ", externalId=" + externalId + ", name=" + name + "]";
    }
    
}
