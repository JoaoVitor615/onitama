class_name Card
extends Node

static func get_relative_position(unit: Unit, card: CardType) -> Array[Vector2]:
	var result: Array[Vector2] = []
	for mov in cards[card]:
		if unit.invert_movement:
			result.append((-1 * mov) + unit.cell)
		else:
			result.append(mov + unit.cell)
	return result
	
static var cards: Dictionary[CardType, PackedVector2Array] = { 
	CardType.TIGER    : [Vector2i(0, -2), Vector2i(0, 1)],
	CardType.COBRA    : [Vector2i(-1, 0), Vector2i(1, -1), Vector2i(1, 1)],
	CardType.CRAB     : [Vector2i(-2, 0), Vector2i(2, 0), Vector2i(0, -1)],
	CardType.MONKEY   : [Vector2i(-1, -1), Vector2i(1, -1), Vector2i(-1, 1), Vector2i(1, 1)],
	CardType.CRANE    : [Vector2i(0, -1), Vector2i(-1, 1), Vector2i(1, 1)],
	CardType.DRAGON   : [Vector2i(-2, -1), Vector2i(2, -1), Vector2i(-1, 1), Vector2i(1, 1)],
	CardType.ELEPHANT : [Vector2i(-1, 0), Vector2i(1, 0), Vector2i(-1, -1), Vector2i(1, -1)],
	CardType.MANTIS   : [Vector2i(0, 1), Vector2i(-1, -1), Vector2i(1, -1)],
	CardType.BOAR     : [Vector2i(0, -1), Vector2i(-1, 0), Vector2i(1, 0)],
	CardType.FROG     : [Vector2i(-2, 0), Vector2i(-1, -1), Vector2i(1, 1)],
	CardType.GOOSE    : [Vector2i(-1, 0), Vector2i(1, 0), Vector2i(-1, -1), Vector2i(1, 1)],
	CardType.HORSE    : [Vector2i(0, -1), Vector2i(-1, 0), Vector2i(0, 1)],
	CardType.EEL      : [Vector2i(-1, 0), Vector2i(-1, -1), Vector2i(1, 1)],
	CardType.RABBIT   : [Vector2i(2, 0), Vector2i(1, -1), Vector2i(-1, 1)],
	CardType.ROOSTER  : [Vector2i(-1, 0), Vector2i(1, 0), Vector2i(1, -1), Vector2i(-1, 1)],
	CardType.OX       : [Vector2i(0, -1), Vector2i(1, 0), Vector2i(0, 1)]
}
enum CardType {
	TIGER, 
	CRAB, 
	MONKEY, 
	CRANE,
	DRAGON, 
	ELEPHANT, 
	MANTIS, 
	BOAR, 
	FROG, 
	GOOSE,
	HORSE, 
	EEL, 
	RABBIT, 
	ROOSTER, 
	OX,
	COBRA
}

static var card_textures: Dictionary[CardType, String] = {
	CardType.TIGER    : "res://GameBoard/Cards/tiger.png",
	CardType.CRAB     : "res://GameBoard/Cards/crab.png",
	CardType.MONKEY   : "res://GameBoard/Cards/monkey.png",
	CardType.CRANE    : "res://GameBoard/Cards/crane.png",
	CardType.DRAGON   : "res://GameBoard/Cards/dragon.png",
	CardType.ELEPHANT : "res://GameBoard/Cards/elephant.png",
	CardType.MANTIS   : "res://GameBoard/Cards/mantis.png",
	CardType.BOAR     : "res://GameBoard/Cards/boar.png",
	CardType.FROG     : "res://GameBoard/Cards/frog.png",
	CardType.GOOSE    : "res://GameBoard/Cards/goose.png",
	CardType.HORSE    : "res://GameBoard/Cards/horse.png",
	CardType.EEL      : "res://GameBoard/Cards/eel.png",
	CardType.RABBIT   : "res://GameBoard/Cards/rabbit.png",
	CardType.ROOSTER  : "res://GameBoard/Cards/rooster.png",
	CardType.OX       : "res://GameBoard/Cards/ox.png",
	CardType.COBRA    : "res://GameBoard/Cards/cobra.png"
}

static func get_card_texture(card: CardType) -> Texture2D:
	if card_textures.has(card):
		return load(card_textures[card])
	return null # Retorna nulo se a carta não for encontrada
