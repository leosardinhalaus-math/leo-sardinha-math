extends Node

var entries: Array = []
var lookup: Dictionary = {}

func _ready() -> void:
	var visual_profiles = JSON.parse_string(FileAccess.get_file_as_string("res://data/native_visuals.json"))
	var parsed = JSON.parse_string(FileAccess.get_file_as_string("res://data/cards.json"))
	if parsed is Array:
		entries = parsed
		for card in entries:
			card["visual"] = visual_profiles.get(str(card.key), {}) if visual_profiles is Dictionary else {}
			lookup[int(card.id)] = card

func card(id: int) -> Dictionary:
	return lookup.get(id, {})

func texture(id: int) -> Texture2D:
	return load(card(id).get("image", "res://assets/cards/card_01.webp")) as Texture2D

func color_for(id: int) -> Color:
	return Color(card(id).get("color", "#56cfc8"))
