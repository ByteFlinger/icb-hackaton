import {SlackChatMessage} from "../model/slackChatMessage";
import { IntentDialog, EntityRecognizer, Prompts, Session, IEntity, Message }  from 'botbuilder';
import { RoomState } from '../model/room';
import {ChatMessageService} from "./serviceInterfaces";

export class BFChatMessageService implements ChatMessageService {
  getRoomSuggestionMessage(room: RoomState, session: Session): Message {
    return new Message(session)
        .sourceEvent({
            slack: SlackChatMessage.getRoomSuggestionMessage(room)
        });
  }
}
