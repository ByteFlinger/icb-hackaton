interface Room {
    id: string;
    name: string;
    locationName?: string;
    floor?: string;
    site?: string;
    tags?: Array<string>;
}

interface RoomState extends Room {
    booking?: boolean;
    actualTemp?: number;
    setTemp?: number;
    presence?: boolean;
    sensorLocationId?: any;
    sensorCollectionId?: any;
}

class RequestedRoom {
    site?: string;
    floor?: string;
    type?: string;
    name?: string;

    isEmpty() : boolean {
      return !this.site && !this.floor && !this.type && !this.name;
    }

    static fromRoom(room: Room): RequestedRoom {
      let rr: RequestedRoom;
      rr.site = room.site;
      rr.name = room.name;
      rr.floor = room.floor;
      rr.type = room.tags[0];
      return rr;
    }
}
