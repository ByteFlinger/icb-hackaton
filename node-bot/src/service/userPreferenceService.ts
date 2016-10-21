import {Room, RoomState} from "../model/room";
import {UserPreference} from "../model/userPreference";
export class UserPreferenceService {

    public getPreferedRoom(userPreference: UserPreference): Room {
        console.log("Asked to get preference from ", userPreference);
        if (userPreference) {
            return userPreference.roomPreference;
        }

        return null;
    }

    public setPreferedRoom(userPreference: UserPreference, room: RoomState) {
        console.log("Asked to set preference ", userPreference);
        if (!userPreference) {
            userPreference = new UserPreference();
        }

        userPreference.roomPreference = room;
    }
}
