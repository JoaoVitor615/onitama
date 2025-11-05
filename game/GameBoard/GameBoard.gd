class_name GameBoard
extends Node2D

const DIRECTIONS = [Vector2.LEFT, Vector2.RIGHT, Vector2.UP, Vector2.DOWN]

## Resource of type Grid.
@onready var grid: Resource = preload("res://GameBoard/Grid.tres")

@export var red_card_button_1: TextureButton
@export var red_card_button_2: TextureButton
@export var blue_card_button_1: TextureButton
@export var blue_card_button_2: TextureButton
@export var neutral_card_button: TextureButton
@export var timer_label: Label # O texto visual
@export var start_label: Label
@export var powerup_label: Label # O label da "animação" de 3s
@export var red_powerup_1: TextureButton
@export var red_powerup_2: TextureButton
@export var red_powerup_3: TextureButton
@export var blue_powerup_1: TextureButton
@export var blue_powerup_2: TextureButton
@export var blue_powerup_3: TextureButton
@onready var _turn_timer: Timer = $TurnTimer # O timer lógico


# Variáveis para guardar os DADOS das cartas em cada slot
var _red_card_1: Card.CardType
var _red_card_2: Card.CardType
var _blue_card_1: Card.CardType
var _blue_card_2: Card.CardType
var _neutral_card: Card.CardType
var _red_powerup_used = {1: false, 2: false, 3: false}
var _blue_powerup_used = {1: false, 2: false, 3: false}
# Para o Power-up 1 (Tempo)
var _next_turn_time = 20.0 # O tempo normal do próximo turno

# Para o Power-up 3 (Congelar)
var _is_selecting_freeze_target = false

# Para travar a UI durante animações
var _ui_locked = false

# O tipo da carta selecionada (null = nenhuma)
var _selected_card: Variant = null
# Qual slot foi usado (1=R1, 2=R2, 3=B1, 4=B2)
var _card_used_slot: int = 0

## Mapping of coordinates of a cell to a reference to the unit it contains.
var _units := {}
var _active_unit: Unit
var _walkable_cells := []

#TURNO
enum PlayerTurn { BLUE, RED } # BLUE = Top, RED = Bottom
var current_turn: PlayerTurn = PlayerTurn.RED

@onready var _unit_overlay: UnitOverlay = $UnitOverlay
@onready var _unit_path: UnitPath = $UnitPath
@onready var _cursor: Cursor = $Cursor
@onready var game_label: Label = $GameLabel

func _ready() -> void:
	_reinitialize()
	
	# --- NOVO CÓDIGO DE CARTAS ---
	_deal_cards() # Sorteia e distribui as 5 cartas
	_update_card_visuals() # Define as texturas dos botões
	_update_button_interactivity() # Desabilita botões do jogador 2
	_cursor.hide() # Esconde o cursor
	# Conecta os NOVOS sinais
	red_card_button_1.pressed.connect(_on_red_card_1_pressed)
	red_card_button_2.pressed.connect(_on_red_card_2_pressed)
	blue_card_button_1.pressed.connect(_on_blue_card_1_pressed)
	blue_card_button_2.pressed.connect(_on_blue_card_2_pressed)
	_turn_timer.timeout.connect(_on_turn_timer_timeout)
	red_powerup_1.pressed.connect(_on_red_powerup_1_pressed)
	red_powerup_2.pressed.connect(_on_red_powerup_2_pressed)
	red_powerup_3.pressed.connect(_on_red_powerup_3_pressed)
	blue_powerup_1.pressed.connect(_on_blue_powerup_1_pressed)
	blue_powerup_2.pressed.connect(_on_blue_powerup_2_pressed)
	blue_powerup_3.pressed.connect(_on_blue_powerup_3_pressed)

# 1. Prepara a tela para a espera
	timer_label.text = "E..." # Mensagem no timer principal
	
	# 2. Garante que a 'StartLabel' exista e esteja visível
	if not start_label:
		# Se a label não foi conectada, apenas espera 5s e começa
		await get_tree().create_timer(5.0).timeout
		_start_turn_timer()
	else:
		# A 'StartLabel' EXISTE, vamos fazer a contagem!
		start_label.visible = true
		
		# 3. Mostra a mensagem inicial
		start_label.text = "Prepare-se!"
		await get_tree().create_timer(1.0).timeout # Espera 1 segundo
		
		# 4. Inicia o loop de contagem regressiva (de 4 até 1)
		for i in range(4, 0, -1): # Loop de 4, 3, 2, 1
			start_label.text = str(i) # Converte o número 'i' para texto
			await get_tree().create_timer(1.0).timeout # Espera 1 segundo
		
		# 5. Limpa a tela de espera
		start_label.visible = false
		
		# 6. AGORA SIM, Inicia o primeiro turno
		_start_turn_timer()

func _process(_delta: float) -> void:
	if Input.is_action_just_pressed("ui_select_red1"):
		red_card_button_1.pressed.emit()
	if Input.is_action_just_pressed("ui_select_red2"):
		red_card_button_2.pressed.emit()
	if Input.is_action_just_pressed("ui_select_blue1"):
		blue_card_button_1.pressed.emit()
	if Input.is_action_just_pressed("ui_select_blue2"):
		blue_card_button_2.pressed.emit()
	if not _turn_timer.is_stopped():
		# Atualiza o texto do Label com o tempo restante
		# "%.1f" formata o número para mostrar apenas 1 casa decimal (ex: 19.3)
		timer_label.text = "%.1f" % _turn_timer.time_left
	
func _unhandled_input(event: InputEvent) -> void:
	
	if _active_unit and event.is_action_pressed("ui_cancel"):
		_deselect_active_unit()
		_clear_active_unit()


func _get_configuration_warning() -> String:
	var warning := ""
	if not grid:
		warning = "You need a Grid resource for this node to work."
	return warning


## Returns `true` if the cell is occupied by a unit.
func is_occupied(cell: Vector2) -> bool:
	return _units.has(cell)


## Returns an array of cells a given unit can walk using the flood fill algorithm.
func get_walkable_cells(unit: Unit, selected_card: Card.CardType) -> PackedVector2Array:
	
	# 1. Pega todos os movimentos POSSÍVEIS da carta
	var potential_moves = Card.get_relative_position(unit, selected_card)
	
	# 2. Cria uma lista vazia para os movimentos VÁLIDOS
	var valid_moves := PackedVector2Array() 
	
	# 3. Filtra a lista
	for move in potential_moves:
		
		if grid.is_within_bounds(move): 
			valid_moves.append(move)
	
	# 4. Retorna APENAS os movimentos que estão dentro do tabuleiro
	return valid_moves


## Clears, and refills the `_units` dictionary with game objects that are on the board.
func _reinitialize() -> void:
	_units.clear()

	for child in get_children():
		var unit := child as Unit
		if not unit:
			continue
		_units[unit.cell] = unit



## Updates the _units dictionary with the target position for the unit and asks the _active_unit to walk to it.
func _move_active_unit(new_cell: Vector2) -> void:
	if not new_cell in _walkable_cells:
		return

	var captured_master = false 

	# 1. Lógica de Captura
	if is_occupied(new_cell):
		var target_unit = _units[new_cell]
		
		if target_unit.invert_movement == _active_unit.invert_movement:
			return
		else:
			if target_unit.is_master_piece:
				captured_master = true

			_units.erase(new_cell) 
			target_unit.queue_free()
	
	# 2. Lógica de Movimento
	_units.erase(_active_unit.cell)
	_units[new_cell] = _active_unit
	_turn_timer.stop() # Para o timer, pois o jogador fez um movimento
	_deselect_active_unit()
	_active_unit.walk_along(_unit_path.current_path)
	
	await _active_unit.walk_finished 
	
	_swap_cards()
	
	# 3. Checa a Vitória por Captura
	if captured_master:
		_game_over(_active_unit) 
		return 

	# 4. VERIFICAÇÃO DE VITÓRIA 2: CAMINHO DO RIO (CORRIGIDA)
	if _active_unit.is_master_piece:
		var target_cell = Vector2i.ZERO
		
		if _active_unit.invert_movement: # Mestre AZUL (Top, true)
			# Templo Vermelho (Bottom, centro, 2, 4)
			target_cell = Vector2i(grid.size.x / 2, grid.size.y - 1) 
		else: # Mestre VERMELHO (Bottom, false)
			# Templo Azul (Top, centro, 2, 0)
			target_cell = Vector2i(grid.size.x / 2, 0) 
		
		if Vector2i(_active_unit.cell) == target_cell:
			_game_over(_active_unit)
			return

	# 5. Se ninguém venceu, troca o turno
	_switch_turn()
	_clear_active_unit()


## Selects the unit in the `cell` if there's one there.
## Sets it as the `_active_unit` and draws its walkable cells and interactive move path. 
func _select_unit(cell: Vector2) -> void:
	if not _units.has(cell):
		return
	_active_unit = _units[cell]
	_active_unit.is_selected = true
	_walkable_cells = get_walkable_cells(_active_unit, _selected_card) 
	_unit_overlay.draw(_walkable_cells)
	


## Deselects the active unit, clearing the cells overlay and interactive path drawing.
func _deselect_active_unit() -> void:
	_active_unit.is_selected = false
	_unit_overlay.clear()
	_unit_path.stop()


## Clears the reference to the _active_unit and the corresponding walkable cells.
func _clear_active_unit() -> void:
	_active_unit = null
	_walkable_cells.clear()
	_selected_card = null
	_card_used_slot = 0
	

func _show_Cursor():
	_cursor.show()
	if Input.is_action_just_pressed("ui_select_red1") or Input.is_action_just_pressed("ui_select_red2"):
		_cursor.cell = $RedMaster.cell
	if Input.is_action_just_pressed("ui_select_blue1") or Input.is_action_just_pressed("ui_select_blue2"):
		_cursor.cell = $BlueMaster.cell
		
	
	
func _on_Cursor_accept_pressed(cell: Vector2) -> void:
	var unit_at_cell = _units.get(cell, null)
	
	if not _active_unit:
		# 1. NENHUMA UNIDADE SELECIONADA
		if _selected_card == null:
			game_label.text = "Selecione uma CARTA primeiro!"
			return
			
		if unit_at_cell:
			
			# --- VERIFICAÇÃO DE TURNO (CORRIGIDA) ---
			# É o turno do VERMELHO (Bottom, false), mas a peça é AZUL (Top, true)?
			if current_turn == PlayerTurn.RED and unit_at_cell.invert_movement:
				game_label.text = "É a vez do VERMELHO"
				return
			
			# É o turno do AZUL (Top, true), mas a peça é VERMELHA (Bottom, false)?
			elif current_turn == PlayerTurn.BLUE and not unit_at_cell.invert_movement:
				game_label.text = "É a vez do AZUL"
				return
			# -----------------------------
		
			_select_unit(cell)
			
			
	elif _active_unit.is_selected:
		# 2. UMA UNIDADE JÁ ESTÁ SELECIONADA
		
		if unit_at_cell:
			# 2a. Clicou em uma célula OCUPADA
			
			if unit_at_cell == _active_unit:
				# Clicou na MESMA unidade -> Cancela tudo
				_deselect_active_unit()
				_clear_active_unit()
			
			# Clicou em OUTRA unidade "amiga"?
			elif unit_at_cell.invert_movement == _active_unit.invert_movement:
				# Troca a seleção (NÃO limpa a carta)
				_deselect_active_unit()
				_select_unit(cell)
			else:
				# Clicou em uma unidade "inimiga" -> Tenta mover/capturar
				_move_active_unit(cell)
		else:
			# 2b. Clicou em uma célula VAZIA
			
			if cell in _walkable_cells:
				# Célula vazia válida -> Move
				_move_active_unit(cell)
			else:
				# Célula vazia inválida -> Cancela tudo
				_deselect_active_unit()
				_clear_active_unit()

## Updates the interactive path's drawing if there's an active and selected unit.
func _on_Cursor_moved(new_cell: Vector2) -> void:
	if _active_unit and _active_unit.is_selected:
		_unit_path.draw(_active_unit.cell, new_cell)
		
		
func _switch_turn() -> void:
	if current_turn == PlayerTurn.RED: # Se era o VERMELHO (Bottom)
		current_turn = PlayerTurn.BLUE # Agora é o AZUL (Top)
		game_label.label_settings.font_color = 0x0080ffff
		
		game_label.text = "--- TURNO: JOGADOR AZUL ---"
	elif current_turn == PlayerTurn.BLUE: # Se era o AZUL (Top)
		current_turn = PlayerTurn.RED # Agora é o VERMELHO (Bottom)
		game_label.label_settings.font_color = 0xff0000ff
		
		game_label.text = "--- TURNO: JOGADOR VERMELHO ---"
	_update_button_interactivity() # Atualiza quais botões podem ser clicados
	_start_turn_timer() # Inicia o timer para o PRÓXIMO jogador


func _on_red_card_1_pressed():
	if current_turn != PlayerTurn.RED: return
	_selected_card = _red_card_1
	_card_used_slot = 1 # Lembra qual slot foi usado
	game_label.text = "Carta selecionada: %s" % Card.card_names[_red_card_1]
	_show_Cursor()
	
func _on_red_card_2_pressed():
	if current_turn != PlayerTurn.RED: return
	_selected_card = _red_card_2
	_card_used_slot = 2
	game_label.text = "Carta selecionada: %s" % Card.card_names[_red_card_2]
	_show_Cursor()

func _on_blue_card_1_pressed():
	if current_turn != PlayerTurn.BLUE: return
	_selected_card = _blue_card_1
	_card_used_slot = 3
	game_label.text = "Carta selecionada: %s" % Card.card_names[_blue_card_1]
	_show_Cursor()
func _on_blue_card_2_pressed():
	if current_turn != PlayerTurn.BLUE: return
	_selected_card = _blue_card_2
	_card_used_slot = 4
	game_label.text = "Carta selecionada: %s" % Card.card_names[_blue_card_2]
	_show_Cursor()
	
func _game_over(winning_unit: Unit):
	set_process_unhandled_input(false) 

	# 1. Descobre quem venceu (CORRIGIDO)
	var winner_color = "VERMELHO" # Assume VERMELHO (Bottom, false) venceu
	if winning_unit.invert_movement: # Se a peça vencedora for AZUL (Top, true)
		winner_color = "AZUL"
		
	# 2. Mostra a mensagem de vitória
	if winning_unit.invert_movement :
		game_label.text = "FIM DE JOGO!\nO Jogador %s VENCEU!" % winner_color
	else:
		game_label.text = "FIM DE JOGO!\nO Jogador %s VENCEU!" % winner_color
		
	for unit in _units.values():
		unit.set_process(false)


# Sorteia as 5 cartas da partida
func _deal_cards():
	var all_cards = Card.cards.keys()
	all_cards.shuffle() # Embaralha a lista de 16 cartas

	# Distribui as 5 primeiras
	# Lembre-se: Vermelho = Bottom = false | Azul = Top = true
	_red_card_1 = all_cards[0]
	_red_card_2 = all_cards[1]
	_blue_card_1 = all_cards[2]
	_blue_card_2 = all_cards[3]
	_neutral_card = all_cards[4]

# Atualiza as texturas dos botões
func _update_card_visuals():
	red_card_button_1.texture_normal = Card.get_card_texture(_red_card_1)
	red_card_button_2.texture_normal = Card.get_card_texture(_red_card_2)
	blue_card_button_1.texture_normal = Card.get_card_texture(_blue_card_1)
	blue_card_button_2.texture_normal = Card.get_card_texture(_blue_card_2)
	neutral_card_button.texture_normal = Card.get_card_texture(_neutral_card)

# Habilita/Desabilita os botões de acordo com o turno
func _update_button_interactivity():
	# Se a UI está travada (ex: durante a animação), desabilita TUDO
	if _ui_locked:
		_set_all_ui_disabled(true)
		return

	# Lógica normal de turno
	var is_red_turn = (current_turn == PlayerTurn.RED)
	red_card_button_1.disabled = not is_red_turn
	red_card_button_2.disabled = not is_red_turn
	blue_card_button_1.disabled = is_red_turn
	blue_card_button_2.disabled = is_red_turn

	# Lógica dos Power-ups (só pode usar no seu turno E se não foi usado)
	red_powerup_1.disabled = (not is_red_turn) or _red_powerup_used[1]
	red_powerup_2.disabled = (not is_red_turn) or _red_powerup_used[2]
	red_powerup_3.disabled = (not is_red_turn) or _red_powerup_used[3]
	
	blue_powerup_1.disabled = is_red_turn or _blue_powerup_used[1]
	blue_powerup_2.disabled = is_red_turn or _blue_powerup_used[2]
	blue_powerup_3.disabled = is_red_turn or _blue_powerup_used[3]

# Troca a carta usada com a carta neutra
func _swap_cards():
	var old_neutral_card = _neutral_card
	
	match _card_used_slot:
		1: # Vermelho 1 usou
			_neutral_card = _red_card_1
			_red_card_1 = old_neutral_card
		2: # Vermelho 2 usou
			_neutral_card = _red_card_2
			_red_card_2 = old_neutral_card
		3: # Azul 1 usou
			_neutral_card = _blue_card_1
			_blue_card_1 = old_neutral_card
		4: # Azul 2 usou
			_neutral_card = _blue_card_2
			_blue_card_2 = old_neutral_card
	
	_update_card_visuals() # Atualiza as texturas imediatamente

		
func _on_turn_timer_timeout() -> void:
	print("Tempo esgotado! Trocando o turno.")
	
	# Se o jogador estava com uma peça selecionada, cancela tudo
	if _active_unit:
		_deselect_active_unit()
		_clear_active_unit()
	
	# PENALIDADE: Troca o turno do jogador
	_switch_turn()

# Função para (re)iniciar o timer
func _start_turn_timer() -> void:
	_turn_timer.wait_time = _next_turn_time # Usa a variável
	_turn_timer.start()
	_next_turn_time = 20.0 # Reseta para o padrão
	print("Turno iniciado. O jogador tem %s segundos." % _turn_timer.wait_time)

# Trava/Destrava todos os 10 botões (Cartas e Poderes)
func _set_all_ui_disabled(is_disabled: bool) -> void:
	 red_card_button_1.disabled = is_disabled
	 red_card_button_2.disabled = is_disabled
	 blue_card_button_1.disabled = is_disabled
	 blue_card_button_2.disabled = is_disabled
	 
	 red_powerup_1.disabled = is_disabled
	 red_powerup_2.disabled = is_disabled
	 red_powerup_3.disabled = is_disabled
	 blue_powerup_1.disabled = is_disabled
	 blue_powerup_2.disabled = is_disabled
	 blue_powerup_3.disabled = is_disabled
	
func _play_powerup_animation(text: String) -> void:
	_ui_locked = true
	_set_all_ui_disabled(true) # Trava tudo
	
	powerup_label.text = text
	powerup_label.visible = true
	
	await get_tree().create_timer(3.0).timeout
	
	powerup_label.visible = false
	_ui_locked = false
	# NÃO re-habilita aqui, deixa o _update_button_interactivity fazer isso
