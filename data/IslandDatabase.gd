extends Node

var entries: Array = []

func _ready() -> void:
	var parsed = JSON.parse_string(FileAccess.get_file_as_string("res://data/islands.json"))
	if parsed is Array:
		entries = parsed

func island(index: int) -> Dictionary:
	return entries[clampi(index, 0, entries.size() - 1)]

func title_for(stage: int) -> String:
	var world = island(stage / 6)
	return str(world.chapters[stage % 6])
