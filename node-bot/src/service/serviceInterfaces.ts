import { RoomState } from '../model/room';

export interface ChatMessageService {
   getRoomSuggestionMessage(room: RoomState, serviceState: any): any;
}
