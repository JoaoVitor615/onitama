## Simple LAN networking using WebSocketPeer
extends Node

signal connected
signal disconnected
signal move_received(move: Dictionary)
signal joined_room(room: String, name: String)
signal presence_update(room: String, presentes: int)

var _ws: WebSocketPeer
var _url: String = ""
var _room: String = ""
var _name: String = ""
var _role: String = "client" # "host" or "client"
var _is_connected: bool = false

func connect_and_join(url: String, room: String, name: String, role: String = "client") -> void:
    _url = url
    _room = room
    _name = name
    _role = role

    _ws = WebSocketPeer.new()
    var err = _ws.connect_to_url(_url)
    if err != OK:
        push_error("[Network] Failed to connect: %s" % err)
        return
    set_process(true)

func _process(_delta: float) -> void:
    if _ws == null:
        return
    _ws.poll()

    match _ws.get_ready_state():
        WebSocketPeer.STATE_OPEN:
            if not _is_connected:
                _is_connected = true
                emit_signal("connected")
                print("[Network] Conectado ao servidor: %s" % _url)
                # Send join message
                var join_payload := {
                    "type": "join",
                    "room": _room,
                    "name": _name,
                    "role": _role
                }
                _ws.send_text(JSON.stringify(join_payload))
            # Read incoming packets
            while _ws.get_available_packet_count() > 0:
                var pkt: PackedByteArray = _ws.get_packet()
                var txt := pkt.get_string_from_utf8()
                var json := JSON.new()
                if json.parse(txt) == OK:
                    var data: Dictionary = json.get_data()
                    if data.has("type"):
                        if data.type == "move":
                            emit_signal("move_received", data)
                        elif data.type == "joined":
                            var room: String = str(data.get("room", _room))
                            var pname: String = str(data.get("name", _name))
                            print("[Network] Entrou na sala '%s' como '%s'" % [room, pname])
                            emit_signal("joined_room", room, pname)
                        elif data.type == "presence_update":
                            var room2: String = str(data.get("room", _room))
                            var presentes: int = int(data.get("presentes", 0))
                            print("[Network] Presença na sala '%s': %d jogadores" % [room2, presentes])
                            emit_signal("presence_update", room2, presentes)
        WebSocketPeer.STATE_CLOSING, WebSocketPeer.STATE_CLOSED:
            if _is_connected:
                _is_connected = false
                emit_signal("disconnected")
                var code := _ws.get_close_code()
                var reason := _ws.get_close_reason()
                print("[Network] Desconectado. Código: %d, razão: %s" % [code, reason])
            set_process(false)

func send_move(move: Dictionary) -> void:
    if _ws == null or _ws.get_ready_state() != WebSocketPeer.STATE_OPEN:
        return
    var payload := {
        "type": "move",
        "room": _room,
        "name": _name,
        "move": move
    }
    _ws.send_text(JSON.stringify(payload))