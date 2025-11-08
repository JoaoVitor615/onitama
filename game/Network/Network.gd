## Simple LAN networking using WebSocketPeer
extends Node

signal connected
signal disconnected
signal move_received(move: Dictionary)

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
                    if data.has("type") and data.type == "move":
                        emit_signal("move_received", data)
        WebSocketPeer.STATE_CLOSING, WebSocketPeer.STATE_CLOSED:
            if _is_connected:
                _is_connected = false
                emit_signal("disconnected")
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