# board.gd - FIXED VERSION
extends Node2D

@export var pieces = []
@export var piece_scene = preload("res://scenes/Piece.tscn")

@export var red_master_pos: Vector2
@export var blue_master_pos: Vector2

const CELL_SIZE = 60

func _ready():
	draw_board()
	init_pieces()

func draw_board():
	for x in range(5):
		for y in range(5):
			draw_cell(x, y)

func draw_cell(x, y):
	var panel = Panel.new()
	
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0, 0, 0)  
	style.border_width_left = 1
	style.border_width_right = 1
	style.border_width_top = 1
	style.border_width_bottom = 1
	style.border_color = Color(0, 0.4, 0.6)  
	
	panel.add_theme_stylebox_override("panel", style)
	panel.size = Vector2(CELL_SIZE, CELL_SIZE)
	panel.position = Vector2(x * CELL_SIZE, y * CELL_SIZE)
	
	panel.z_index = -1
	
	add_child(panel)

func init_pieces():
	for piece_tuple in globals.INITIAL_PIECE_SET_SINGLE:
		var piece_type = piece_tuple[0]
		var blue_piece_pos = Vector2(piece_tuple[1], piece_tuple[2])
		var red_piece_pos = Vector2(piece_tuple[1], 5 - 1 - piece_tuple[2])
		
		var blue_piece = piece_scene.instantiate()
		add_child(blue_piece)
		blue_piece.init_piece(
			piece_type,
			globals.COLORS.BLUE,
			blue_piece_pos,
			self
		)

		blue_piece.z_index = 1
		pieces.append(blue_piece)
		
		var red_piece = piece_scene.instantiate()
		add_child(red_piece)
		red_piece.init_piece(
			piece_type,
			globals.COLORS.RED,
			red_piece_pos,
			self
		)

		red_piece.z_index = 1
		pieces.append(red_piece)
		
		if piece_type == globals.PIECE_TYPES.MASTER:
			register_master(red_piece_pos, globals.COLORS.RED)
			register_master(blue_piece_pos, globals.COLORS.BLUE)

func register_master(pos, col):
	match col:
		globals.COLORS.RED:
			red_master_pos = pos
		globals.COLORS.BLUE:
			blue_master_pos = pos

func get_piece(pos: Vector2):
	for piece in pieces:
		if piece.board_position == pos:
			return piece

func delete_piece(piece):
	for i in range(len(pieces)):
		if pieces[i] == piece:
			var popped = pieces.pop_at(i)
			popped.queue_free()
			return
