package eu.brolien.appiot_java_example.data;

import java.util.ArrayList;
import java.util.List;

public class TaggedData {

    public List<Tag> Tags = new ArrayList<>();

    public boolean hasTag(String string) {
        for (Tag tag : Tags) {
            if (tag.Name.toLowerCase().equals(string.toLowerCase())) {
                return true;
            }
        }
        return false;
    } 
    
}
