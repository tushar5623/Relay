from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, event_id: str):
        await websocket.accept()
        if event_id not in self.active_connections:
            self.active_connections[event_id] = []
        self.active_connections[event_id].append(websocket)

    def disconnect(self, websocket: WebSocket, event_id: str):
        if event_id in self.active_connections and websocket in self.active_connections[event_id]:
            self.active_connections[event_id].remove(websocket)

    async def broadcast(self, event_id: str, message: dict):
        if event_id in self.active_connections:
            for connection in self.active_connections[event_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

ws_manager = ConnectionManager()
