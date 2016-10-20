import { Room} from '../model/room';

export class UserPreference {
    roomPreference: Map<string, Room>;

    public constructor() {
        this.roomPreference = new Map<string, Room>();
    }

    public getPreferedRoom(site?: string): Room {
        if(site) {
          return this.roomPreference.get(site);
        }
        return this.roomPreference.values().next().value;
    }
}
