## Bridge para comunicação entre JavaScript (React) e Godot
## Recebe dados do JavaScript e permite que o jogo acesse essas informações
extends Node

signal player_data_received(data: Dictionary)
signal game_data_updated(data: Dictionary)

var player_name: String = ""
var player_data: Dictionary = {}
var is_javascript_ready: bool = false
var _polling_timer: Timer

## Recebe dados do JavaScript via função global (pode receber JSON string ou Dictionary)
func receive_from_javascript(data) -> void:
	var data_dict: Dictionary = {}
	
	# Se receber string JSON, converte para Dictionary
	if typeof(data) == TYPE_STRING:
		var json = JSON.new()
		var parse_result = json.parse(data)
		if parse_result == OK:
			data_dict = json.get_data()
		else:
			print("[JavaScriptBridge] Erro ao fazer parse do JSON: ", data)
			return
	elif typeof(data) == TYPE_DICTIONARY:
		data_dict = data
	else:
		print("[JavaScriptBridge] Tipo de dado não suportado: ", typeof(data))
		return
	
	print("[JavaScriptBridge] Dados recebidos do JavaScript: ", data_dict)
	
	if data_dict.has("player_name"):
		player_name = str(data_dict.get("player_name", ""))
	
	if data_dict.has("player_data"):
		player_data = data_dict.get("player_data", {})
		# Atualiza campos individuais para facilitar acesso
		if player_data.has("apelido") and player_name.is_empty():
			player_name = str(player_data.get("apelido", ""))
	
	emit_signal("player_data_received", data_dict)

## Envia dados para o JavaScript (pode ser usado para notificar eventos do jogo)
func send_to_javascript(data: Dictionary) -> void:
	if not OS.has_feature("web"):
		print("[JavaScriptBridge] Não está rodando na web, ignorando envio para JS")
		return
	
	var js_code = "if (window.receiveFromGodot) { window.receiveFromGodot(%s); }" % JSON.stringify(data)
	JavaScriptBridge.eval(js_code, true)

func _ready() -> void:
	# Configura a função global para receber dados do JavaScript
	if OS.has_feature("web"):
		await get_tree().process_frame  # Espera um frame para garantir que tudo está carregado
		_setup_javascript_interface()
		_setup_postmessage_listener()
		_setup_polling_timer()
	else:
		print("[JavaScriptBridge] Não está rodando na web, bridge JavaScript desabilitado")

func _setup_polling_timer() -> void:
	_polling_timer = Timer.new()
	_polling_timer.wait_time = 0.1
	_polling_timer.autostart = true
	_polling_timer.timeout.connect(_check_for_data)
	add_child(_polling_timer)

func _setup_javascript_interface() -> void:
	# Usa uma abordagem simples: armazena dados em uma variável global
	# e o Godot faz polling para verificar novos dados
	var js_code = """
	(function() {
		window._godotDataQueue = [];
		if (!window.sendToGodot) {
			window.sendToGodot = function(data) {
				window._godotDataQueue.push(data);
			};
		}
		window.godotReady = true;
		console.log('Godot bridge ready');
	})();
	"""
	JavaScriptBridge.eval(js_code, true)
	is_javascript_ready = true
	print("[JavaScriptBridge] Interface JavaScript configurada")
	
func _check_for_data() -> void:
	if not OS.has_feature("web"):
		return
	
	# Verifica se há novos dados na fila
	var js_code = """
	(function() {
		if (window._godotDataQueue && window._godotDataQueue.length > 0) {
			return JSON.stringify(window._godotDataQueue.shift());
		}
		return null;
	})();
	"""
	
	var result = JavaScriptBridge.eval(js_code, true)
	if result != null:
		var result_str = str(result)
		if result_str != "" and result_str != "null":
			receive_from_javascript(result_str)

func _setup_postmessage_listener() -> void:
	# Configura listener para postMessage (usado quando o Godot está em iframe)
	# O listener será configurado no JavaScript do HTML, mas podemos também fazer aqui
	var js_code = """
	window.addEventListener('message', function(event) {
		// Verifica se a mensagem é do React/iframe pai
		if (event.data && event.data.type === 'GODOT_DATA') {
			var payload = event.data.payload || event.data;
			if (window.sendToGodot) {
				window.sendToGodot(payload);
			} else {
				// Se sendToGodot não estiver pronto, tenta diretamente
				setTimeout(function() {
					if (window.sendToGodot) {
						window.sendToGodot(payload);
					}
				}, 100);
			}
		}
	});
	console.log('PostMessage listener configurado');
	"""
	
	JavaScriptBridge.eval(js_code, true)
	
	# Também expõe uma função que pode ser chamada diretamente do React
	# Esta função será registrada para ser chamada via call_deferred do Godot
	var direct_call_code = """
	window.receiveFromReact = function(data) {
		if (window.sendToGodot) {
			window.sendToGodot(data);
		}
	};
	"""
	JavaScriptBridge.eval(direct_call_code, true)

