extends Node
var cards = { # movement: [[x, y], [x, y]] - piece is [0, 0]
	"Tiger"     : {"name": "Tiger",    "movement": [Vector2(0, -2), Vector2(0, 1)], "stamp": "red"},
	"Crab"      : {"name": "Crab",     "movement": [Vector2(-2, 0), Vector2(2, 0), Vector2(0, 1)], "stamp": "blue"},
	"Monkey"    : {"name": "Monkey",   "movement": [Vector2(-1,-1), Vector2(1, 1), Vector2(1, -1), Vector2(-1, 1)], "stamp": "blue"},
	"Crane"     : {"name": "Crane",    "movement": [Vector2(-1, 1), Vector2(1, 1), Vector2(0, -1)], "stamp": "blue"},
	"Dragon"    : {"name": "Dragon",   "movement": [Vector2(-2, -1), Vector2(-1, 1), Vector2(1, 1), Vector2(2, -1)], "stamp": "red"},
	"Elephant"  : {"name": "Elephant", "movement": [Vector2(-1, 0), Vector2(-1, 1), Vector2(1, 0), Vector2(1, 1)], "stamp": "red"},
	"Mantis"    : {"name": "Mantis",   "movement": [Vector2(-1, -1), Vector2(1, -1), Vector2(0, 1)], "stamp": "red"},
	"Boar"      : {"name": "Boar",     "movement": [Vector2(-1, 0), Vector2(0, -1), Vector2(1, 0)], "stamp": "red"},
	"Frog"      : {"name": "Frog",     "movement": [Vector2(-2, 0), Vector2(-1, 1), Vector2(1, -1)], "stamp": "red"},
	"Goose"     : {"name": "Goose",    "movement": [Vector2(-1, 0), Vector2(-1, 1), Vector2(1, 0), Vector2(1, -1)], "stamp": "blue"},
	"Horse"     : {"name": "Horse",    "movement": [Vector2(-1, 0), Vector2(0, -1), Vector2(0, 1)], "stamp": "red"},
	"Eel"       : {"name": "Eel",      "movement": [Vector2(-1, 1), Vector2(-1, 0), Vector2(1, -1)], "stamp": "blue"},
	"Rabbit"    : {"name": "Rabbit",   "movement": [Vector2(1, -1), Vector2(2, 0), Vector2(-1, 1)], "stamp": "blue"},
	"Rooster"   : {"name": "Rooster",  "movement": [Vector2(-1, 1), Vector2(0, -1), Vector2(1, 0), Vector2(1, -1)], "stamp": "red"},
	"Ox"        : {"name": "Ox",       "movement": [Vector2(0, -1), Vector2(1, 0), Vector2(0, 1)], "stamp": "blue"},
	"Cobra"     : {"name": "Cobra",    "movement": [Vector2(-1, 0), Vector2(1, 1), Vector2(1, -1)], "stamp": "red"}
}
