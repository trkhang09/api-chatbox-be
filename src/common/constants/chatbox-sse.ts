export enum ChatboxSseEvent {
  MESSAGE = 'message',
  DELTA = 'delta',
}
export enum ChatboxSseMessageType {
  COMPLETE = 'message_stream_complete',
  CHAT_CREATED = 'chat_created',
}
