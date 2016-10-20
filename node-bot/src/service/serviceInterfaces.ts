import { RoomState } from '../model/room';

export interface ChatMessageService {
   getRoomSuggestionMessage(room: RoomState): any;
}
