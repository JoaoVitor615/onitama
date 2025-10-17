extends Node2D


func _on_start_game_pressed() -> void:
	get_tree().change_scene_to_file("res://scenes/Game.tscn")


func _on_options_pressed() -> void:
	get_tree().change_scene_to_file("res://scenes/Options.tscn")


func _on_quit_pressed() -> void:
	get_tree().quit()
