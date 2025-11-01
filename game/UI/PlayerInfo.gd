## UI Component para exibir informações do jogador recebidas do React
extends Control

@onready var player_name_label: Label = $PlayerNameLabel

func _ready() -> void:
	# Conecta ao sinal do JavaScriptBridge
	if JavaScriptBridge:
		JavaScriptBridge.player_data_received.connect(_on_player_data_received)
		# Se já tiver dados, atualiza imediatamente
		if not JavaScriptBridge.player_name.is_empty():
			_update_player_name(JavaScriptBridge.player_name)

func _on_player_data_received(data: Dictionary) -> void:
	if data.has("player_name"):
		_update_player_name(data.get("player_name", ""))
	elif data.has("player_data") and data.player_data.has("apelido"):
		_update_player_name(data.player_data.get("apelido", ""))

func _update_player_name(name: String) -> void:
	if player_name_label:
		var display_text = "Jogador: " + name
		player_name_label.text = display_text
		print("[PlayerInfo] Nome do jogador atualizado: ", display_text)

