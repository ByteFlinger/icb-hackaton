import { RequestedRoom, Room, RoomState } from '../model/room';

export class SlackChatMessage implements ChatMessage {

    text?: string;
    attachments?: Array<SlackMessageAttachment>;

    public constructor(text?: string, attachments?: Array<SlackMessageAttachment>) {
        this.text = text;
        this.attachments = attachments;
    }

    static getRoomSuggestionMessage(room: RoomState): any {
       console.log("Slack message creation");
        let site = new SlackMessageAttachmentField("Site", room.site);
        let floor = new SlackMessageAttachmentField("Floor", room.floor);
        let temperature = new SlackMessageAttachmentField("Temperature", room.actualTemp.toString());

        let anotherRoomAction = new SlackMessageAttachmentAction("another", "Find another", "button", "another");
        let bookRoomAction = new SlackMessageAttachmentAction("book", "Book it!", "button", "bookit");


        console.log("HELLO133");
        let attachment = new SlackMessageAttachment();
        attachment.fallback = `Found a room for you\nSite: ${room.site}\nFloor: ${room.floor}\nName: ${room.name}\nTemperature: ${room.actualTemp}\n\nI hope the lights don't work`;
        attachment.callback_id = room.name;
        attachment.title = room.name;

        if (room.booking) {
            attachment.color = "warning";
            attachment.text = "Booked but empty at the moment";
            attachment.actions = [anotherRoomAction];
        } else {
            attachment.color = "good";
            attachment.text = "Not booked";
            attachment.actions = [anotherRoomAction, bookRoomAction];
        }
        console.log("HELLO144");
        return new SlackChatMessage("Room availability", [attachment]);

    }

}

class SlackMessageAttachment {
    fallback?: string;
    color?: string;
    title?: string;
    callback_id?: string;
    text?: string;
    fields?: Array<SlackMessageAttachmentField>;
    actions?: Array<SlackMessageAttachmentAction>;
}

class SlackMessageAttachmentField {
    title: string;
    value: string;
    short?: boolean = true;

    public constructor(title: string, value: string, short?: boolean) {
        this.title = title;
        this.value = value;
        if(short) {
            this.short = short;
        }
    }
}

class SlackMessageAttachmentAction {
    name: string;
    text: string;
    type: string;
    value: string;

    public constructor(name: string, text: string, type: string, value: string) {
        this.name = name;
        this.text = text;
        this.type = type;
        this.value = value;
    }
}
