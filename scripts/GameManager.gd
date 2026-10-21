extends Node

signal progress_changed

const SAVE_PATH = "user://calculus_royale_v1.json"
const MAX_STAGE = 30
var player_name = "Calculante"
var hero_class = "Calculante"
var coins = 0
var wins = 0
var completed: Array = []
var stars: Dictionary = {}
var unlocked: Array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
var deck: Array = [1, 2, 3, 4, 5, 6, 7, 8]
var active_stage = 0
var quick_battle = false
var last_reward: Dictionary = {}
var result_claimed = false
var save_error = ""

func _ready() -> void:
	load_progress()

func is_unlocked(stage: int) -> bool:
	return stage >= 0 and stage < MAX_STAGE and (stage == 0 or completed.has(stage - 1))

func select_stage(stage: int, training: bool = false) -> void:
	if not training and not is_unlocked(stage):
		return
	active_stage = clampi(stage, 0, MAX_STAGE - 1)
	quick_battle = training
	result_claimed = false
	get_tree().change_scene_to_file("res://scenes/BattleArena3D.tscn")

func complete_battle(victory: bool, earned_stars: int = 1) -> Dictionary:
	if result_claimed:
		return last_reward
	result_claimed = true
	last_reward = {"coins": 0, "cards": [], "first_clear": false}
	if victory:
		wins += 1
		if not quick_battle:
			var first_clear = not completed.has(active_stage)
			last_reward.first_clear = first_clear
			last_reward.coins = 75 + active_stage * 8 if first_clear else 10
			if first_clear:
				completed.append(active_stage)
				for card in Cards.entries:
					if not unlocked.has(int(card.id)):
						unlocked.append(int(card.id))
						last_reward.cards.append(int(card.id))
						if last_reward.cards.size() == 2:
							break
			stars[str(active_stage)] = maxi(int(stars.get(str(active_stage), 0)), clampi(earned_stars, 1, 3))
			coins += int(last_reward.coins)
	save_progress()
	progress_changed.emit()
	return last_reward

func set_deck(candidate: Array) -> bool:
	var checked: Array = []
	for id in candidate:
		if unlocked.has(int(id)) and not checked.has(int(id)):
			checked.append(int(id))
	if checked.size() != 8:
		return false
	deck = checked
	save_progress()
	return true

func save_progress() -> void:
	var payload = {"version": 1, "player_name": player_name.left(24), "hero_class": hero_class,
		"coins": coins, "wins": wins, "completed": completed, "stars": stars,
		"unlocked": unlocked, "deck": deck}
	var file = FileAccess.open(SAVE_PATH + ".tmp", FileAccess.WRITE)
	if file == null:
		save_error = "Não foi possível salvar neste aparelho."
		return
	file.store_string(JSON.stringify(payload))
	file.close()
	if FileAccess.file_exists(SAVE_PATH):
		DirAccess.copy_absolute(SAVE_PATH, SAVE_PATH + ".bak")
	var error = DirAccess.rename_absolute(SAVE_PATH + ".tmp", SAVE_PATH)
	save_error = "" if error == OK else "Não foi possível atualizar o salvamento."

func load_progress() -> void:
	var payload = null
	for path in [SAVE_PATH, SAVE_PATH + ".bak"]:
		if FileAccess.file_exists(path):
			var candidate = JSON.parse_string(FileAccess.get_file_as_string(path))
			if candidate is Dictionary and candidate.get("version") == 1:
				payload = candidate
				break
	if not payload is Dictionary:
		return
	player_name = str(payload.get("player_name", "Calculante")).left(24)
	hero_class = str(payload.get("hero_class", "Calculante"))
	coins = clampi(int(payload.get("coins", 0)), 0, 9999999)
	wins = clampi(int(payload.get("wins", 0)), 0, 999999)
	completed.clear()
	if payload.get("completed") is Array:
		for stage in payload.completed:
			if typeof(stage) in [TYPE_INT, TYPE_FLOAT] and int(stage) >= 0 and int(stage) < MAX_STAGE and not completed.has(int(stage)):
				completed.append(int(stage))
	stars = payload.get("stars", {}) if payload.get("stars") is Dictionary else {}
	if payload.get("unlocked") is Array:
		for id in payload.unlocked:
			if typeof(id) in [TYPE_INT, TYPE_FLOAT] and Cards.lookup.has(int(id)) and not unlocked.has(int(id)):
				unlocked.append(int(id))
	if payload.get("deck") is Array:
		var validated: Array = []
		for id in payload.deck:
			if typeof(id) in [TYPE_INT, TYPE_FLOAT] and unlocked.has(int(id)) and not validated.has(int(id)):
				validated.append(int(id))
		if validated.size() == 8:
			deck = validated

func return_to_map() -> void:
	get_tree().paused = false
	get_tree().change_scene_to_file("res://scenes/IslandOverworld.tscn")
