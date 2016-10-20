import {SlackChatMessage} from "../model/slackChatMessage";
import { IntentDialog, EntityRecognizer, Prompts, Session, IEntity, Message }  from 'botbuilder';
import { RoomState } from '../model/room';
import {ChatMessageService} from "./serviceInterfaces";

export class BFChatMessageService implements ChatMessageService {
  getRoomSuggestionMessage(room: RoomState): Message {
    console.log("We are returning a slack message");
    return new Message()
        .sourceEvent({
            slack: SlackChatMessage.getRoomSuggestionMessage(room)
        });
  }
}
