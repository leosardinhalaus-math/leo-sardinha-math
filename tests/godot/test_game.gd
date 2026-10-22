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
		check(ResourceLoader.exists("res://scenes/NativeCharacter.tscn"), "Native scene exists for: " + str(card.key))
	var native_scene = load("res://scenes/NativeCharacter.tscn")
	for card in cards.entries:
		check(not card.visual.is_empty(), "Every card has an observed visual profile")
		var native = native_scene.instantiate()
		root.add_child(native)
		native.configure(card)
		check(native.get_meta("card_key") == card.key, "Native avatar retains the correct card identity")
		for state in ["idle","walk","run","jump","summon","attack","power","hurt","victory","defeat"]:
			check(native.animation.has_animation(state), "Native animation exists: " + state)
			native.animation.play(state)
			native.animation.advance(0.2)
		native.queue_free()
		await process_frame
	await test_native_motion(cards,native_scene)
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
		check(overworld.diorama.mission_points.size() == 6, "Every mission has a 3D cave")
		check(overworld.map_image.texture is ViewportTexture, "Island map renders native 3D terrain")
		var mesh_arrays = overworld.diorama.terrain.mesh.surface_get_arrays(0)
		var positions = mesh_arrays[Mesh.ARRAY_VERTEX]
		var normals = mesh_arrays[Mesh.ARRAY_NORMAL]
		var has_cliff = false
		var has_upward_surface = false
		for vertex in range(positions.size()):
			if positions[vertex].y < -1.0: has_cliff = true
			if positions[vertex].y > 0.1 and normals[vertex].y > 0.8: has_upward_surface = true
		check(has_cliff and has_upward_surface, "Island has outward terrain and visible cliff depth")
		await process_frame
		await process_frame
		for angle in [-0.24,0.0,0.24]:
			overworld.yaw = angle
			overworld._process(0)
			for cave in overworld.cave_layer.get_children():
				check(Rect2(Vector2.ZERO,overworld.cave_layer.size).encloses(cave.get_rect()), "Every cave stays visible while rotating the island")
				var stage = world*6+cave.get_index()
				check(cave.disabled == not game.is_unlocked(stage), "Rotating a diorama preserves mission locks")
	overworld.queue_free()
	await process_frame
	var gallery = load("res://scenes/CharacterGallery.tscn").instantiate()
	root.add_child(gallery)
	await process_frame
	for index in range(45):
		gallery.show_card(index)
		check(gallery.character.get_meta("card_key") == cards.entries[index].key, "Gallery shows the matching native model")
		await process_frame
	gallery.queue_free()
	await process_frame
	var terrain_scene = load("res://scripts/NativeArena.gd")
	for world in range(5):
		var terrain = terrain_scene.new()
		root.add_child(terrain)
		terrain.build(world,0)
		check(terrain.get_meta("theme_name") == terrain_scene.THEMES[world].name, "Each island uses its own native arena")
		terrain.queue_free()
		await process_frame
	var battle = load("res://scenes/BattleArena3D.tscn").instantiate()
	root.add_child(battle)
	await process_frame
	check(battle.units().size() == 6, "Battle starts with three towers per side")
	await process_frame
	var king_position = battle.camera.unproject_position(battle.player_king.position + Vector3(0, 1.7, 0))
	check(not battle.hand_row.get_global_rect().has_point(king_position), "Player king is visible outside the card HUD")
	battle.elixir = 10.0
	var original_id = battle.hand[0]
	battle._request_card(0)
	check(battle.frozen and battle.placing, "Choosing a point pauses both armies")
	check(battle.quiz.is_empty(), "No question opens before choosing a point")
	var before_cost = battle.elixir
	battle._summon_selected()
	check(battle.units().size() == 6 and battle.elixir == before_cost, "Cannot summon before choosing a point and answering")
	var requested = Vector3(-4.0,0,8.8)
	check(battle.spawn_error(requested).is_empty(), "Can deploy behind the king tower")
	check(battle.spawn_error(Vector3(5.5,0,5.0)).is_empty(), "Can deploy beside towers and away from lanes")
	check(not battle.spawn_error(Vector3(0,0,-5)).is_empty(), "Cannot deploy in enemy territory")
	check(not battle.spawn_error(Vector3(0,0,0)).is_empty(), "Cannot deploy into the river")
	check(not battle.spawn_error(Vector3(3,0,0)).is_empty(), "Cannot deploy onto a bridge")
	check(not battle.spawn_error(Vector3(7,0,5)).is_empty(), "Cannot deploy outside the arena")
	check(not battle.spawn_error(Vector3(5.6,0,7.5)).is_empty(), "Cannot deploy onto scenery")
	check(not battle.spawn_error(battle.player_king.position).is_empty(), "Cannot deploy inside a tower")
	var click = InputEventMouseButton.new()
	click.button_index = MOUSE_BUTTON_LEFT
	click.pressed = true
	click.position = battle.camera.unproject_position(requested)
	root.push_input(click,true)
	await process_frame
	check(not battle.placing and not battle.quiz.is_empty(), "A real viewport click selects the world point and opens the question")
	check(battle.selected_spawn.distance_to(requested) < 0.001, "Screen picking preserves the selected 3D point")
	battle._answer(int(battle.quiz.answer))
	battle._answer(int(battle.quiz.answer))
	check(battle.answers == 1, "An answer cannot be submitted twice")
	battle._summon_selected()
	check(not battle.frozen, "Summoning resumes the battle")
	check(battle.hand[0] != original_id and battle.draw_queue.has(original_id), "Used card cycles through the deck")
	check(battle.units().size() == 7, "Correct answer spawns one model")
	var unit = battle.units().back()
	check(unit.animation != null, "Native character includes an AnimationPlayer")
	check(unit.position.distance_to(requested) < 0.001, "The character is born at the touched point")
	check(unit.visual.get_child(0).get_meta("native_godot_model",false), "Unit uses the native Godot character")
	var after_cost = battle.elixir
	battle._summon_selected()
	check(battle.units().size() == 7 and battle.elixir == after_cost, "Repeated summon cannot spend or create a second unit")
	battle._request_card(1)
	var touch = InputEventScreenTouch.new()
	touch.index = 1
	touch.pressed = true
	touch.position = battle.camera.unproject_position(Vector3(5,0,8.5))
	battle._unhandled_input(touch)
	check(battle.placing, "A second finger cannot confirm a deployment")
	touch.index = 0
	battle._unhandled_input(touch)
	var drag = InputEventScreenDrag.new()
	drag.index = 0
	drag.position = battle.camera.unproject_position(Vector3(4.5,0,8.5))
	battle._unhandled_input(drag)
	touch.position = drag.position
	touch.pressed = false
	battle._unhandled_input(touch)
	check(not battle.placing and battle.selected_spawn.distance_to(Vector3(4.5,0,8.5)) < 0.001, "Native touch drag confirms only when released")
	battle._cancel_placement()
	check(not battle.frozen and battle.selected_card == -1 and battle.elixir == after_cost, "Cancel resumes without spending elixir")
	var previous_position = unit.position
	for side in [-1.0,1.0]:
		unit.position = Vector3(side*5.5,0,8.5)
		unit.lane = 0 if side<0 else 1
		unit.path_clock = 0
		for tick in range(700):
			var waypoint = battle.walk_target(unit,battle.enemy_king)
			var direction = waypoint-unit.position
			unit.position = battle.constrain_walk(unit.position + direction.normalized()*minf(direction.length(),0.05),unit.position)
			if absf(unit.position.z) < 0.9:
				check(absf(absf(unit.position.x)-3.0) < 0.64, "Free deployment crosses only through a bridge")
		check(unit.position.z < -3.0, "Both free deployment routes reach enemy territory")
	unit.position = previous_position
	var enemy = battle._spawn(cards.card(2), 1, 0, Vector3(-3,0,1))
	unit.position = enemy.position+Vector3(0,0,1)
	contact(unit,enemy)
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
	await test_conquered_territory(cards,game)
	await test_combat_regressions(cards,game)
	await test_quiz_layout(game)
	test_progress_recovery(game)
	print("GODOT TESTS: %d checks, %d failures" % [checks, failures.size()])
	quit(0 if failures.is_empty() else 1)

func tower_at(battle, team: int, lane: int) -> RoyaleUnit:
	for unit in battle.units():
		if unit.is_tower and not unit.is_king and unit.team == team and unit.lane == lane:
			return unit
	return null

func test_conquered_territory(cards, game) -> void:
	game.quick_battle = true
	game.active_stage = 0
	var battle = load("res://scenes/BattleArena3D.tscn").instantiate()
	root.add_child(battle)
	await process_frame
	battle.frozen = true
	var left = Vector3(-4,0,-6.8)
	var right = Vector3(4,0,-6.8)
	check(not battle.spawn_error(left).is_empty() and not battle.spawn_error(right).is_empty(), "Both enemy halves start locked")
	check(not battle.spawn_error(Vector3(-4,0,-0.92)).is_empty(), "Enemy riverbank cannot bypass the locked territory")
	check(battle.spawn_error(left,1).is_empty(), "Enemy home territory remains available to its team")
	var soldier = battle._spawn(cards.card(1),1,0,Vector3(-4,0,-2))
	soldier.take_damage(99999,null,true)
	check(not battle.spawn_error(left).is_empty(), "Defeating a soldier does not conquer territory")
	tower_at(battle,0,0).take_damage(99999,null,true)
	check(not battle.spawn_error(left).is_empty(), "A friendly tower falling does not unlock enemy territory")
	var left_tower = tower_at(battle,1,0)
	var previous_revision = battle.navigation.revision
	left_tower.take_damage(99999,null,true)
	check(battle.conquered_lanes == [true,false], "Only the destroyed enemy tower's half is conquered")
	check(battle.navigation.revision > previous_revision, "Destroyed tower also releases its navigation obstacle")
	check(battle.spawn_error(left).is_empty(), "Left enemy half unlocks immediately")
	check(battle.spawn_error(Vector3(-3,0,-4.4)).is_empty(), "Fallen tower position becomes deployable")
	check(battle.spawn_error(Vector3(-4,0,-8.8)).is_empty(), "Conquest includes the rear of the matching half")
	check(battle.spawn_error(Vector3(-4,0,-0.92)).is_empty(), "Captured enemy riverbank is usable")
	check(not battle.spawn_error(right).is_empty(), "Standing right tower keeps the right half locked")
	check(battle.spawn_error(Vector3(-0.01,0,-5.8)).is_empty(), "Left conquest reaches its central boundary")
	check(not battle.spawn_error(Vector3(0.01,0,-5.8)).is_empty(), "Left conquest cannot leak across the central boundary")
	check(not battle.spawn_error(Vector3(-3,0,0)).is_empty(), "Conquest never unlocks a bridge")
	check(not battle.spawn_error(Vector3(-1,0,-0.5)).is_empty(), "Conquest never unlocks river water")
	check(not battle.spawn_error(Vector3(-5.6,0,-7.5)).is_empty(), "Scenery remains blocked inside conquered land")
	check(not battle.spawn_error(Vector3(-6.16,0,-5)).is_empty(), "Conquest never expands the arena bounds")
	check(not battle.spawn_error(Vector3(-0.1,0,-7)).is_empty(), "The living king still blocks occupied points inside a conquered half")
	check(battle.spawn_error(Vector3(-4,0,8.8)).is_empty(), "Home field remains available after conquest")
	await create_timer(0.9).timeout
	check(not is_instance_valid(left_tower) and battle.spawn_error(left).is_empty(), "Conquest survives the fallen tower being freed")
	check(not battle.spawn_zone.visible, "Territory overlay stays hidden outside placement")
	battle.frozen = false
	battle.elixir = 10
	battle._request_card(0)
	check(battle.conquered_zones[0].is_visible_in_tree() and not battle.conquered_zones[1].is_visible_in_tree(), "Placement highlights exactly the conquered half")
	var touch = InputEventScreenTouch.new()
	touch.index = 0
	touch.pressed = true
	touch.position = battle.camera.unproject_position(right)
	battle._unhandled_input(touch)
	touch.pressed = false
	battle._unhandled_input(touch)
	check(battle.placing and not battle.candidate_valid, "Touch release in the protected half cannot open the question")
	touch.pressed = true
	touch.position = battle.camera.unproject_position(left)
	battle._unhandled_input(touch)
	touch.pressed = false
	battle._unhandled_input(touch)
	check(not battle.placing and battle.selected_spawn.distance_to(left)<0.001, "Touch can select the conquered enemy half")
	var before_count = battle.units().size()
	var before_elixir = battle.elixir
	var cost = float(cards.card(int(battle.hand[0])).cost)
	battle._summon_selected()
	check(battle.units().size()==before_count and battle.elixir==before_elixir, "Conquered territory still requires the correct math answer")
	battle._answer(int(battle.quiz.answer))
	battle._summon_selected()
	check(battle.units().size()==before_count+1, "Correct answer spawns one unit in conquered territory")
	var advanced = battle.units().back()
	check(advanced.team==0 and advanced.lane==0 and advanced.position.distance_to(left)<0.001, "Forward deployment preserves team, lane and touched point")
	check(is_equal_approx(battle.elixir,before_elixir-cost), "Forward deployment spends the normal card cost once")
	check(not battle.spawn_zone.visible, "Summoning hides all territory highlights")
	check(not battle.spawn_error(left).is_empty(), "Newly deployed unit occupies the selected conquered point")
	var path = battle.navigation.path_between(left,battle.enemy_king.position)
	check(not path.is_empty(), "Forward-deployed unit has a route to the enemy king")
	for point in path: check(point.z<=-0.92, "A unit born beyond the river need not cross a bridge to attack the enemy king")
	battle.frozen = true
	tower_at(battle,1,1).take_damage(99999,null,true)
	check(battle.conquered_lanes == [true,true] and battle.spawn_error(right).is_empty(), "Both tower halves can be conquered independently")
	check(not battle.finished, "Destroying both side towers does not end the battle")
	check(not battle.spawn_error(battle.enemy_king.position).is_empty(), "Even two conquests cannot deploy inside the living king")
	battle.frozen = false
	battle.elixir = 10
	battle._request_card(0)
	check(battle.conquered_zones[0].is_visible_in_tree() and battle.conquered_zones[1].is_visible_in_tree(), "Both captured halves are highlighted on the next placement")
	battle._cancel_placement()
	battle.enemy_king.take_damage(99999,null,true)
	check(battle.finished and battle.frozen, "The central tower still ends the battle with victory")
	var final_count = battle.units().size()
	battle._request_card(0)
	battle._summon_selected()
	check(not battle.placing and battle.units().size()==final_count, "No forward deployment is allowed after victory")
	battle.queue_free()
	await process_frame
	var replay = load("res://scenes/BattleArena3D.tscn").instantiate()
	root.add_child(replay)
	await process_frame
	replay.frozen = true
	check(replay.conquered_lanes == [false,false], "Conquests reset for every new battle")
	check(not replay.spawn_error(left).is_empty() and not replay.spawn_error(right).is_empty(), "Replay starts with both enemy halves protected")
	tower_at(replay,1,1).take_damage(99999,null,true)
	check(replay.spawn_error(right).is_empty() and not replay.spawn_error(left).is_empty(), "Destroying the right tower first unlocks only the right half")
	replay.queue_free()
	await process_frame

func test_combat_regressions(cards,game) -> void:
	game.quick_battle = true
	game.result_claimed = false
	var battle = load("res://scenes/BattleArena3D.tscn").instantiate()
	root.add_child(battle)
	await process_frame
	battle.frozen = true
	var guard = tower_at(battle,0,0)
	var intruder = battle._spawn(cards.card(1),1,1,guard.position+Vector3(0,0,-2.4))
	check(battle.find_target(guard)==intruder, "A guard detects a nearby intruder arriving from the other lane")
	var previous_hp = intruder.hp
	battle.frozen = false
	guard._physics_process(1.0/30)
	battle.frozen = true
	check(intruder.hp<previous_hp, "A guard defends against the other lane within its weapon range")
	var stationary = battle._spawn(cards.card(1),0,1,Vector3(4,0,6))
	var behind = battle._spawn(cards.card(2),1,1,Vector3(4,0,7))
	stationary.attack_clock = 10
	battle.frozen = false
	stationary._physics_process(0)
	battle.frozen = true
	check((-stationary.global_basis.z).dot((behind.position-stationary.position).normalized())>0.99, "A stationary attacker faces its target even without walking first")
	var attacker = battle._spawn(cards.card(3),0,0,Vector3(-2,0,3))
	var reflector = battle._spawn(cards.card(2),1,0,Vector3(-2,0,2))
	attacker.hp = 1
	attacker.damage = 30
	attacker.special_hits = 2
	attacker.stats.ability_kind = "double"
	reflector.hp = 500
	reflector.max_hp = 500
	reflector.reflect_timer = 5
	contact(attacker,reflector)
	check(attacker.dead, "Lethal reflected damage defeats the attacker")
	check(is_equal_approx(reflector.hp,470), "An attacker killed by reflection cannot cast its third-hit special")
	contact(attacker,reflector)
	battle.special(attacker,reflector)
	check(is_equal_approx(reflector.hp,470), "Dead attackers cannot deal another hit or cast a special")
	var supporter = battle._spawn(cards.card(2),0,0,Vector3(-4,0,7.5))
	var weak = battle._spawn(cards.card(1),1,0,Vector3(-4,0,6.8))
	supporter.special_hits = 2
	weak.hp = 1
	contact(supporter,weak)
	check(weak.dead and supporter.shield==28, "Third-hit self buffs still activate when the normal strike defeats its target")
	var healer = battle._spawn(cards.card(3),0,0,Vector3(-2,0,5))
	var weak2 = battle._spawn(cards.card(1),1,0,Vector3(-2,0,4.5))
	healer.stats.ability_kind = "heal"
	healer.special_hits = 2
	healer.hp = healer.max_hp-30
	weak2.hp = 1
	contact(healer,weak2)
	check(weak2.dead and is_equal_approx(healer.hp,healer.max_hp-10), "Third-hit healing survives a lethal normal strike")
	await test_attack_timing(battle,cards)
	battle.frozen = false
	battle.elixir = 10
	battle._request_card(0)
	battle.enemy_king.take_damage(99999,null,true)
	check(battle.outcome=="victory" and battle.finished and battle.frozen, "Central tower defeat records a frozen victory")
	check(not battle.placing and not battle.touch_placing and not battle.summon_authorized, "Victory clears all placement and authorization state")
	check(not battle.spawn_zone.visible and not battle.spawn_marker.visible and not battle.cancel_button.visible, "Victory hides deployment overlays and the cancel control")
	check("RIVAL 0" in battle.top_status.text, "The result updates the defeated king's displayed health")
	var result_panel = battle.popup
	battle._close_popup()
	battle._answer(0)
	check(battle.frozen and battle.popup==result_panel, "A delayed cancel or answer cannot dismiss the result or resume battle")
	var final_hp = intruder.hp
	battle.frozen = false
	guard.attack_clock = 0
	guard._physics_process(1.0/30)
	guard.attack(intruder)
	check(intruder.hp==final_hp, "Finished battles reject combat even if the pause flag changes")
	battle.queue_free()
	await process_frame
	for fixture in [{"own":1.0,"enemy":1.0,"expected":"draw"},{"own":0.5,"enemy":0.25,"expected":"victory"},{"own":0.5,"enemy":0.75,"expected":"defeat"}]:
		game.result_claimed = false
		var timed = load("res://scenes/BattleArena3D.tscn").instantiate()
		root.add_child(timed)
		await process_frame
		timed.player_king.hp = timed.player_king.max_hp*fixture.own
		timed.enemy_king.hp = timed.enemy_king.max_hp*fixture.enemy
		var previous_wins = game.wins
		timed.remaining = 0.01
		timed._process(0.02)
		check(timed.outcome==fixture.expected, "Timeout compares health proportions and distinguishes a draw: "+fixture.expected)
		check(timed.finished and timed.frozen, "All timeout outcomes freeze the battle")
		check(game.wins==previous_wins+(1 if fixture.expected=="victory" else 0), "A timeout draw or defeat never awards a win")
		if fixture.expected=="draw": check(timed.popup.get_child(0).get_child(0).text=="EMPATE", "The timeout draw is explained on screen")
		timed.queue_free()
		await process_frame

func test_quiz_layout(game) -> void:
	game.quick_battle = true
	game.result_claimed = false
	var battle = load("res://scenes/BattleArena3D.tscn").instantiate()
	root.add_child(battle)
	await process_frame
	for world in range(5):
		for stage in range(6):
			battle.world_index = world
			battle.stage_index = stage
			battle.elixir = 10
			battle._request_card(0)
			check(battle._pick_screen(battle.camera.unproject_position(Vector3(-4,0,8.8))), "Each mission opens its math question from a valid point")
			await process_frame
			await process_frame
			check(root.get_visible_rect().encloses(battle.popup.get_global_rect()), "Question and buttons stay inside the viewport for mission %d" % (world*6+stage+1))
			battle._answer(int(battle.quiz.answer))
			await process_frame
			await process_frame
			check(root.get_visible_rect().encloses(battle.popup.get_global_rect()), "Explanation and summon button stay inside the viewport for mission %d" % (world*6+stage+1))
			battle._cancel_placement()
	battle.queue_free()
	await process_frame

func write_test_save(path: String, text: String) -> void:
	var file = FileAccess.open(path,FileAccess.WRITE)
	check(file!=null, "Isolated save fixture can be written")
	if file:
		file.store_string(text)
		file.close()

func test_progress_recovery(game) -> void:
	var original = FileAccess.get_file_as_string(game.SAVE_PATH)
	var original_backup = FileAccess.get_file_as_string(game.SAVE_PATH+".bak")
	var payload = {"version":1,"player_name":"Teste","hero_class":"Calculante","coins":137,"wins":4,"completed":[0],"stars":{"0":2},"unlocked":[1,2,3,4,5,6,7,8,9,10,11],"deck":[1,2,3,4,5,6,7,11]}
	write_test_save(game.SAVE_PATH,JSON.stringify(payload))
	write_test_save(game.SAVE_PATH+".bak",JSON.stringify(payload))
	game.unlocked.append(45)
	game.load_progress()
	check(not game.unlocked.has(45) and game.unlocked.has(11), "Reload restores exactly the saved collection without unsaved card unlocks")
	check(game.deck==payload.deck and game.coins==137 and game.stars=={"0":2}, "A valid save restores deck, coins and stars")
	write_test_save(game.SAVE_PATH,"{broken JSON")
	game.load_progress()
	check(game.coins==137 and game.deck==payload.deck, "A corrupt primary save falls back to the healthy backup")
	game.coins = 138
	game.save_progress()
	check(game.save_error.is_empty(), "A recovered save can be repaired successfully")
	var backup = JSON.parse_string(FileAccess.get_file_as_string(game.SAVE_PATH+".bak"))
	check(backup is Dictionary and backup.coins==137, "Repairing corrupt primary data preserves the healthy backup")
	var repaired = JSON.parse_string(FileAccess.get_file_as_string(game.SAVE_PATH))
	check(repaired is Dictionary and repaired.coins==138, "The repaired primary contains the updated progress")
	write_test_save(game.SAVE_PATH,"{corrupt again")
	game.load_progress()
	check(game.coins==137, "The backup still works after recovery and a second primary corruption")
	var invalid_deck = payload.duplicate(true)
	invalid_deck.unlocked = [1,2,3,4,5,6,7,8,9,10]
	invalid_deck.deck = [1,1,2,3,45]
	invalid_deck.stars = {"0":{},"1":99,"-1":3,"bad":2}
	write_test_save(game.SAVE_PATH,JSON.stringify(invalid_deck))
	game.load_progress()
	check(game.deck==[1,2,3,4,5,6,7,8], "Invalid saved decks fall back to eight distinct unlocked starter cards")
	check(game.stars=={"1":3}, "Invalid star records cannot corrupt later rewards")
	var invalid_type = payload.duplicate(true)
	invalid_type.coins = {"bad":1}
	write_test_save(game.SAVE_PATH,JSON.stringify(invalid_type))
	game.load_progress()
	check(game.coins==137 and game.deck==payload.deck, "A save with invalid field types also falls back to the backup")
	write_test_save(game.SAVE_PATH,original)
	write_test_save(game.SAVE_PATH+".bak",original_backup)
	game.load_progress()

# Advance actual animation markers rather than bypassing the combat resolver.
func contact(unit, target) -> void:
	var was_frozen = unit.arena.frozen
	unit.arena.frozen = false
	unit.attack(target)
	if unit.pending_target and unit.animation:
		unit.animation.advance(0)
		for step in range(12):
			unit.animation.advance((unit.animation.current_animation_length*0.44+0.002)/12.0)
	unit.arena.frozen = was_frozen

func test_native_motion(cards,native_scene) -> void:
	var personalities: Dictionary = {}
	for card in cards.entries:
		var avatar = native_scene.instantiate()
		root.add_child(avatar)
		avatar.configure(card)
		personalities[str(avatar.motion_profile)] = true
		for state in ["idle","walk","run"]:
			var clip = avatar.animation.get_animation(state)
			for track in range(clip.get_track_count()):
				if clip.track_get_type(track)==Animation.TYPE_VALUE:
					check(clip.track_get_key_value(track,0).is_equal_approx(clip.track_get_key_value(track,clip.track_get_key_count(track)-1)), "Locomotion and breathing loops have a seamless return")
		check(avatar.animation.get_animation("run").length<avatar.animation.get_animation("walk").length, "Running has a faster cadence than walking")
		for state in ["attack","power"]:
			var clip = avatar.animation.get_animation(state)
			var markers = 0
			for track in range(clip.get_track_count()):
				if clip.track_get_type(track)==Animation.TYPE_METHOD:
					markers += clip.track_get_key_count(track)
					check(clip.track_get_key_time(track,0)>clip.length*0.30 and clip.track_get_key_time(track,0)<clip.length*0.60, "Contact follows anticipation and precedes recovery")
			check(markers==1, "An attack emits exactly one contact marker")
		if avatar.body:
			avatar.animation.play("idle")
			avatar.animation.advance(0)
			var feet = [avatar.left_foot.get_node("Sole"),avatar.right_foot.get_node("Sole")]
			var planted = [avatar.to_local(feet[0].global_position),avatar.to_local(feet[1].global_position)]
			var hip_min = 10.0
			var hip_max = -10.0
			for sample in range(17):
				avatar.animation.seek(avatar.animation.current_animation_length*sample/16.0,true)
				hip_min = minf(hip_min,avatar.body.position.x)
				hip_max = maxf(hip_max,avatar.body.position.x)
				for side in range(2):
					check(avatar.to_local(feet[side].global_position).distance_to(planted[side])<0.008, "Idle weight transfer keeps the feet planted")
			check(hip_max-hip_min>0.025, "Idle shifts weight between both sides")
			avatar.animation.play("walk")
			avatar.animation.advance(0)
			var max_lift = 0.0
			for sample in range(25):
				var phase = sample/24.0
				avatar.animation.seek(avatar.animation.current_animation_length*phase,true)
				for side in range(2):
					var foot = avatar.to_local(feet[side].global_position)
					max_lift = maxf(max_lift,foot.y-planted[side].y)
					check(foot.y>=planted[side].y-0.006, "Walking never pushes the sole through the floor")
			check(max_lift>0.055, "A walking foot lifts during its swing")
			if not avatar.follow_parts.is_empty():
				avatar.animation.play("attack")
				avatar.animation.seek(avatar.animation.current_animation_length*0.52,true)
				var follows = false
				for follow in avatar.follow_parts:
					if follow.node.rotation.length()>0.001: follows = true
					check(follow.node.rotation.length()<0.29, "Secondary motion remains bounded around its attachment")
				check(follows,"Hair, cloth or accessories retain movement after contact")
		if not avatar.bow_links.is_empty():
			avatar.animation.play("attack")
			for phase in [0.0,0.18,0.30,0.44,0.75]:
				avatar.animation.seek(avatar.animation.current_animation_length*phase,true)
				avatar._process(0)
				var links = avatar.bow_links
				var nock = links.hand.global_position
				check((links.top.global_position+links.top.global_basis.y*0.5).distance_to(nock)<0.0001,"The upper bowstring follows the drawing hand")
				check((links.bottom.global_position-links.bottom.global_basis.y*0.5).distance_to(nock)<0.0001,"The lower bowstring follows the drawing hand")
				check((links.arrow.global_position-links.arrow.global_basis.y*0.5).distance_to(nock)<0.0001,"The arrow nock remains in the drawing hand")
		avatar.queue_free()
		await process_frame
	check(personalities.size()==45,"Every card receives its own motion personality")

func test_attack_timing(battle,cards) -> void:
	var striker = battle._spawn(cards.card(2),0,1,Vector3(5.5,0,6))
	var target = battle._spawn(cards.card(1),1,1,Vector3(5.5,0,5.3))
	var hp_before = target.hp
	battle.frozen = false
	striker.attack(target)
	striker.animation.advance(0)
	striker.animation.advance(striker.animation.current_animation_length*0.30)
	check(target.hp==hp_before,"Anticipation does not apply damage")
	var planted = striker.position
	striker._physics_process(0)
	check(striker.position==planted,"A committed attack cannot turn into walking before contact")
	battle.frozen = true
	striker.animation.advance(striker.animation.current_animation_length*0.18)
	striker._physics_process(0.2)
	check(target.hp==hp_before and striker.pending_target!=null,"A contact marker during pause cannot damage or lose the queued attack")
	battle.frozen = false
	striker._physics_process(0)
	check(is_equal_approx(target.hp,hp_before-striker.damage),"Unpausing resolves the contact once")
	striker._resolve_attack()
	check(is_equal_approx(target.hp,hp_before-striker.damage),"Duplicate contact callbacks cannot repeat damage")
	check(striker.animation.is_playing(),"Recovery continues after the damage frame")
	var doomed = battle._spawn(cards.card(3),0,1,Vector3(4.7,0,6))
	var survivor = battle._spawn(cards.card(2),1,1,Vector3(4.7,0,5.3))
	doomed.attack(survivor)
	var safe_hp = survivor.hp
	doomed.take_damage(99999,null,true)
	doomed._resolve_attack()
	check(survivor.hp==safe_hp,"An attacker defeated during anticipation cannot hit later")
	var miss = battle._spawn(cards.card(2),0,0,Vector3(-5.5,0,6))
	var runner = battle._spawn(cards.card(1),1,0,Vector3(-5.5,0,5.3))
	miss.attack(runner)
	var runner_hp = runner.hp
	runner.position.z = 1
	miss.animation.advance(0)
	miss.animation.advance(miss.animation.current_animation_length*0.45)
	check(runner.hp==runner_hp and miss.special_hits==0,"A target that leaves reach before contact does not receive a ghost hit")
	var walker = battle._spawn(cards.card(2),0,0,Vector3(-5.4,0,8.5))
	for rate in ["normal","slow","haste"]:
		walker.slow_timer = 1.0 if rate=="slow" else 0.0
		walker.haste_timer = 1.0 if rate=="haste" else 0.0
		var previous = walker.position
		walker._physics_process(1.0/30)
		var actual_speed = walker.position.distance_to(previous)*30.0
		check(actual_speed>0.01,"The gait fixture can move through a free area")
		var actor = walker.animation.get_parent()
		var foot_speed = load("res://scripts/NativeMotion.gd").locomotion_speed(walker.animation_state,actor.motion_profile)*actor.scale.y*walker.animation.speed_scale
		check(absf(actual_speed-foot_speed)<0.001,"Foot cadence matches movement during normal, slowed and hasted travel")
	battle.frozen = true
