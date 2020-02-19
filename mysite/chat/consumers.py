from channels.generic.websocket import AsyncWebsocketConsumer
import json

def time_now():
    from datetime import datetime
    # current date and time
    now = datetime.now()
    timestamp = datetime.timestamp(now)
    return timestamp


class ChatConsumer(AsyncWebsocketConsumer):
    from collections import defaultdict
    tally = defaultdict(int)
        
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        self.tally[self.room_name] += 1
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': 'number ' + str(self.tally[self.room_name]),
                'name': 'XXX'
            }
        )


    async def disconnect(self, close_code):
        # Leave room group
        self.tally[self.room_name] -= 1
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        name = text_data_json['name']

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'name':name
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        name = event['name']

        print(message, name)
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'name':name
        }))