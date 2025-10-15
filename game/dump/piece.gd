extends Node2D
@onready var sprite = $Pieces

const SPRITE_SIZE = 16
const CELL_SIZE = 60

const X_OFFSET = 30
const Y_OFFSET = 30

@export var piece_type: globals.PIECE_TYPES
@export var color: globals.COLORS
@export var board_position: Vector2

var board_handle;

@export var moved: bool;

func init_piece(
	type: globals.PIECE_TYPES,
	col: globals.COLORS,
	board_pos: Vector2,
	board
):
	piece_type = type
	color = col
	board_position = board_pos
	board_handle = board
	moved = false
	
	update_sprite()
	
	position = Vector2(
		X_OFFSET + board_position[0] * CELL_SIZE,
		Y_OFFSET + board_position[1] * CELL_SIZE,
	)
	
func update_sprite():
	if sprite:
		var region_pos = globals.SPRITE_MAPPING[color][piece_type]
		sprite.region_rect = Rect2(
			region_pos.y * SPRITE_SIZE,
			region_pos.x * SPRITE_SIZE,
			SPRITE_SIZE,
			SPRITE_SIZE
		)

func move_position(to_move: Vector2):
	moved = true
	board_position = to_move
	position = Vector2(
		X_OFFSET + board_position[0] * CELL_SIZE,
		Y_OFFSET + board_position[1] * CELL_SIZE
	)
	
	if piece_type == globals.PIECE_TYPES.MASTER:
		board_handle.register_master(board_position, color)
