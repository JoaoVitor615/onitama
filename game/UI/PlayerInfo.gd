## UI Component para exibir informações do jogador recebidas do React
extends Control

@onready var player_name_label: Label = $PlayerNameLabel
@onready var username_label: Label = $UsernameLabel

func _ready() -> void:
	# Espera um frame para garantir que o autoload está carregado
	await get_tree().process_frame
	_connect_to_bridge()

func _connect_to_bridge() -> void:
	# Acessa o autoload WebBridge (renomeado para evitar conflito com singleton do Godot)
	var bridge = get_node_or_null("/root/WebBridge")
	if not bridge:
		# Tenta novamente depois
		get_tree().create_timer(0.1).timeout.connect(_connect_to_bridge)
		return
	
	# Conecta ao sinal
	if bridge.has_signal("player_data_received"):
		if not bridge.player_data_received.is_connected(_on_player_data_received):
			bridge.player_data_received.connect(_on_player_data_received)
	
	# Verifica se já tem dados
	var current_name = bridge.get("player_name")
	if current_name and str(current_name) != "":
		_update_player_name(str(current_name))

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
	
	# Atualiza também o UsernameLabel se existir
	if username_label:
		username_label.text = name
