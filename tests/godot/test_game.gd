extends SceneTree

var checks = 0
var failures: Array[String] = []

func _initialize() -> void:
	call_deferred("run")

func check(condition: bool, message: String) -> void:
	checks += 1
	if not condition:
		failures.append(message)
		push_error(message)

func run() -> void:
	await process_frame
	var game = root.get_node("Game")
	var cards = root.get_node("Cards")
	var islands = root.get_node("Islands")
	check(cards.entries.size() == 45, "45 cards must be loaded")
	check(islands.entries.size() == 5, "Five islands must be loaded")
	for entry in islands.entries:
		check(entry.chapters.size() == 6, "Every island has six missions")
	for card in cards.entries:
		check(ResourceLoader.exists(card.image), "Card texture exists: " + str(card.id))
		check(ResourceLoader.exists(card.model), "Animated model exists: " + str(card.key))
	var rng = RandomNumberGenerator.new()
	rng.seed = 20261021
	for world in range(5):
		for stage in range(6):
			for iteration in range(15):
				var challenge = MathChallenge.make(world, stage, rng)
				check(challenge.options.size() == 4, "Four answer options")
				check(challenge.options.count(challenge.answer) == 1, "The correct answer occurs once")
				var distinct: Dictionary = {}
				for option in challenge.options:
					distinct[option] = true
				check(distinct.size() == 4, "Answer options do not repeat")
	game.completed = []
	game.stars = {}
	game.coins = 0
	game.unlocked = [1,2,3,4,5,6,7,8,9,10]
	game.deck = [1,2,3,4,5,6,7,8]
	game.active_stage = 0
	game.quick_battle = false
	game.result_claimed = false
	check(game.is_unlocked(0), "First mission is available")
	check(not game.is_unlocked(1), "Second mission starts locked")
	check(not game.set_deck([1,1,2,3,4,5,6,7]), "A duplicate card cannot enter the deck")
	check(not game.set_deck([1,2,3,4,5,6,7,45]), "A locked card cannot enter the deck")
	check(game.set_deck([1,2,3,4,5,6,7,8]), "An eight-card legal deck is accepted")
	var menu = load("res://scenes/MainMenu.tscn").instantiate()
	root.add_child(menu)
	await process_frame
	menu.show_deck()
	check(menu.chosen.size() == 8, "Collection screen opens with the saved deck")
	menu.queue_free()
	await process_frame
	var overworld = load("res://scenes/IslandOverworld.tscn").instantiate()
	root.add_child(overworld)
	await process_frame
	for world in range(5):
		overworld.select_world(world)
		check(overworld.cave_layer.get_child_count() == 6, "Six cave buttons on every island")
		await process_frame
		await process_frame
		for cave in overworld.cave_layer.get_children():
			check(cave.get_global_rect().end.y <= root.get_visible_rect().size.y, "Every cave stays within the visible map")
	overworld.queue_free()
	await process_frame
	var battle = load("res://scenes/BattleArena3D.tscn").instantiate()
	root.add_child(battle)
	await process_frame
	check(battle.units().size() == 6, "Battle starts with three towers per side")
	await process_frame
	var king_position = battle.camera.unproject_position(battle.player_king.position + Vector3(0, 1.7, 0))
	check(king_position.y < battle.hand_row.get_global_rect().position.y, "Player king is visible above the card hand")
	battle.elixir = 10.0
	var original_id = battle.hand[0]
	battle._request_card(0)
	check(battle.frozen, "Math question pauses both armies")
	battle._answer(int(battle.quiz.answer))
	battle._answer(int(battle.quiz.answer))
	check(battle.answers == 1, "An answer cannot be submitted twice")
	battle._summon_selected()
	check(not battle.frozen, "Summoning resumes the battle")
	check(battle.hand[0] != original_id and battle.draw_queue.has(original_id), "Used card cycles through the deck")
	check(battle.units().size() == 7, "Correct answer spawns one model")
	var unit = battle.units().back()
	check(unit.animation != null, "Imported model includes an AnimationPlayer")
	var enemy = battle._spawn(cards.card(2), 1, 0, Vector3(-3,0,1))
	unit.attack(enemy)
	check(enemy.hp < enemy.max_hp, "Units deal combat damage")
	for tick in range(10):
		await physics_frame
	battle.enemy_king.take_damage(99999, unit, true)
	check(battle.finished and battle.frozen, "Destroying the enemy king ends the battle")
	check(game.is_unlocked(1) and not game.is_unlocked(6), "Victory unlocks only the next cave")
	var coins = game.coins
	game.complete_battle(true, 3)
	check(game.coins == coins, "One battle cannot award rewards twice")
	check(game.unlocked.size() == 12, "First victory unlocks two distinct cards")
	game.save_progress()
	check(game.save_error.is_empty(), "Progress writes successfully")
	game.coins = 0
	game.load_progress()
	check(game.coins == coins and game.deck.size() == 8, "Progress and deck survive reload")
	battle.queue_free()
	await process_frame
	print("GODOT TESTS: %d checks, %d failures" % [checks, failures.size()])
	quit(0 if failures.is_empty() else 1)
