extends Node

signal progress_changed

const SAVE_PATH = "user://calculus_royale_v1.json"
const MAX_STAGE = 30
const STARTER_CARDS = [1,2,3,4,5,6,7,8,9,10]
const DEFAULT_DECK = [1,2,3,4,5,6,7,8]
var player_name = "Calculante"
var hero_class = "Calculante"
var coins = 0
var wins = 0
var completed: Array = []
var stars: Dictionary = {}
var unlocked: Array = STARTER_CARDS.duplicate()
var deck: Array = DEFAULT_DECK.duplicate()
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
	file.flush()
	var write_error = file.get_error()
	file.close()
	if write_error != OK:
		save_error = "Não foi possível gravar o progresso neste aparelho."
		return
	# A recovered save must never replace its healthy backup with corrupt input.
	if _read_progress(SAVE_PATH) is Dictionary:
		if DirAccess.copy_absolute(SAVE_PATH, SAVE_PATH + ".bak") != OK:
			save_error = "Não foi possível guardar a cópia de segurança do progresso."
			return
	var error = DirAccess.rename_absolute(SAVE_PATH + ".tmp", SAVE_PATH)
	save_error = "" if error == OK else "Não foi possível atualizar o salvamento."

func _read_progress(path: String) -> Variant:
	if not FileAccess.file_exists(path): return null
	var parsed = JSON.new()
	if parsed.parse(FileAccess.get_file_as_string(path)) != OK: return null
	var data = parsed.data
	if not data is Dictionary or data.get("version") != 1: return null
	for field in ["coins","wins"]:
		if data.has(field) and typeof(data[field]) not in [TYPE_INT,TYPE_FLOAT]: return null
	for field in ["completed","unlocked","deck"]:
		if data.has(field) and not data[field] is Array: return null
	if data.has("stars") and not data.stars is Dictionary: return null
	return data

func load_progress() -> void:
	var payload = null
	for path in [SAVE_PATH, SAVE_PATH + ".bak"]:
		var candidate = _read_progress(path)
		if candidate is Dictionary:
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
	stars = {}
	for stage in payload.get("stars", {}):
		var count = payload.stars[stage]
		if str(stage).is_valid_int() and int(stage) >= 0 and int(stage) < MAX_STAGE and typeof(count) in [TYPE_INT,TYPE_FLOAT]:
			stars[str(int(stage))] = clampi(int(count),1,3)
	unlocked = STARTER_CARDS.duplicate()
	deck = DEFAULT_DECK.duplicate()
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
