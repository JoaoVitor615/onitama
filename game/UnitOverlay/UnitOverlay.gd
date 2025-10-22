## Draws a selected unit's walkable tiles.
class_name UnitOverlay
extends TileMapLayer

#
#var cards = { # movement: [[x, y], [x, y]] - piece is [0, 0]
	#"Tiger"     : [[0, -2], [0, 1]]},
	#"Crab"      : [[-2, 0], [2, 0], [0, 1]]},
	#"Monkey"    : [[-1,-1], [1, 1], [1, -1], [-1, 1]]},
	#"Crane"     : [[-1, 1], [1, 1], [0, -1]]},
	#"Dragon"    : [[-2, -1], [-1, 1], [1, 1], [2, -1]]},
	#"Elephant"  : [[-1, 0], [-1, 1], [1, 0], [1, 1]]},
	#"Mantis"    : [[-1, -1], [1, -1], [0, 1]]},
	#"Boar"      : [[-1, 0], [0, -1], [1, 0]]},
	#"Frog"      : [[-2, 0], [-1, 1], [1, -1]]},
	#"Goose"     : [[-1, 0], [-1, 1], [1, 0], [1, -1]]},
	#"Horse"     : [[-1, 0], [0, -1], [0, 1]]},
	#"Eel"       : [[-1, 1], [-1, 0], [1, -1]]},
	#"Rabbit"    : [[1, -1], [2, 0], [-1, 1]]},
	#"Rooster"   : [[-1, 1], [0, -1], [1, 0], [1, -1]]},
	#"Ox"        : [[0, -1], [1, 0], [0, 1]]},
	#"Cobra"     : [[-1, 0], [1, 1], [1, -1]]}
#}
## Fills the tilemap with the cells, giving a visual representation of the cells 
## a unit can walk.
func draw(cells: Array) -> void:
	clear()
	var test_card: Dictionary = { "Tiger" : { "name" : "Tiger", "movements" : [[0, -2], [0, 1]]}}
	for cell in cells:
		for card in test_card.values():
			for mov in card["movements"]:
				set_cell(cell, 0, Vector2i(mov[0], mov[1]))
