package eu.brolien.appiot_java_example.services;

import java.util.Iterator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import eu.brolien.appiot_java_example.cache.RoomCache;
import eu.brolien.appiot_java_example.data.Room;

@Controller
@RequestMapping("/rooms")
public class RoomService {

    @Autowired
    private RoomCache roomCache;

    @RequestMapping(method = RequestMethod.GET)
    public @ResponseBody List<Room> list(@RequestParam(name = "tag", defaultValue = "") String tag,
            @RequestParam(name = "floor", required = false) String floor,
            @RequestParam(name = "site", required = false) String site,
            @RequestParam(name = "booking", required = false) Boolean booking,
            @RequestParam(name = "presence", required = false) Boolean presence) {
        System.out.println("tag=" + tag);
        System.out.println("floor=" + floor);
        System.out.println("site=" + site);
        System.out.println("booking=" + booking);
        System.out.println("presence=" + presence);

        List<Room> rooms = roomCache.getRooms();
/**
        Iterator<Room> i = rooms.iterator();
        while (i.hasNext()) {
            Room r = i.next();
            if (tag != null) {
                if (!r.getTags().contains(tag)) {
                    i.remove();
                }
            }
            if (floor != null) {
                if (!r.getFloor().equals(floor)) {
                    i.remove();
                }
            }
            if (site != null) {
                if (!r.getSite().equals(site)) {
                    i.remove();
                }
            }
            if (booking != null) {
                if (booking != r.isBooking()) {
                    i.remove();
                }
            }
            if (presence != null) {
                if (presence != r.isPresence()) {
                    i.remove();
                }
            }
            
        }**/

        return rooms;
    }

}
