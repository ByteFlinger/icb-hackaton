import {SlackChatMessage} from "../model/slackChatMessage";
import { IntentDialog, EntityRecognizer, Prompts, Session, IEntity, Message }  from 'botbuilder';

export class BFChatMessageService implements ChatMessageService {
  getRoomSuggestionMessage(room: Room): Message {
    return new Message()
        .sourceEvent({
            slack: SlackChatMessage.getRoomSuggestionMessage(room)
        });
  }
}
