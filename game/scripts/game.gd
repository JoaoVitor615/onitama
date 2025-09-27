extends Node2D

var game_over;
var player_color;
var status; # who is playing
var player2_type; # Where AI or Human is playing

# To drag piece
var is_dragging: bool;
var selected_piece = null;
var previous_position = null;

@onready var board = $Board;

func _ready():
	init_game()
	
func _input(event):
	if Input.is_action_just_pressed("left_click"):
		var pos = get_pos_under_mouse()
		selected_piece = board.get_piece(pos)
		if selected_piece == null or selected_piece.color != status:
			return
		is_dragging = true
		previous_position = selected_piece.position
		selected_piece.z_index = 100
	elif event is InputEventMouseMotion and is_dragging:
		selected_piece.position = get_global_mouse_position()
	elif Input.is_action_just_released("left_click") and is_dragging:
		var is_valid_move = drop_piece()
		if !is_valid_move:
			selected_piece.position = previous_position
		selected_piece.z_index = 1
		selected_piece = null
		is_dragging = false
			
	
func init_game():
	is_dragging = false
	player_color = globals.COLORS.RED
	status = globals.COLORS.RED
	player2_type = globals.PLAYER_2_TYPE.HUMAN

func get_pos_under_mouse():
	var pos = get_global_mouse_position()
	pos.x = int(pos.x / 60)
	pos.y = int(pos.y / 60)
	return pos
	
func drop_piece():
	var to_move = get_pos_under_mouse()
	if valid_move(selected_piece.position, to_move):
		var dest_piece = board.get_piece(to_move)
		if dest_piece != null and dest_piece.color != selected_piece.color:
			board.delete_piece(dest_piece)
		selected_piece.move_position(to_move)
		status = globals.COLORS.BLUE if status == globals.COLORS.RED else globals.COLORS.RED
		return true
	return false

func valid_move(from_pos, to_pos):
	return true
