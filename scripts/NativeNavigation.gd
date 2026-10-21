extends RefCounted

const CELL = 0.5
const REGION = Rect2i(-12,-18,25,37)
var grid: AStarGrid2D
var arena
var revision = 0

func configure(battle) -> void:
	arena = battle
	rebuild()

func rebuild() -> void:
	grid = AStarGrid2D.new()
	grid.region = REGION
	grid.cell_size = Vector2(CELL,CELL)
	grid.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES
	grid.default_compute_heuristic = AStarGrid2D.HEURISTIC_OCTILE
	grid.default_estimate_heuristic = AStarGrid2D.HEURISTIC_OCTILE
	grid.update()
	var obstacles = arena.native_world.obstacles.duplicate()
	for unit in arena.units():
		if unit.is_tower and not unit.dead:
			obstacles.append({"point":unit.position,"radius":1.0 if unit.is_king else 0.83})
	for x in range(REGION.position.x,REGION.end.x):
		for z in range(REGION.position.y,REGION.end.y):
			var point = Vector3(x*CELL,0,z*CELL)
			var blocked = absf(point.z) < 0.92 and absf(absf(point.x)-3.0) > 0.63
			for obstacle in obstacles:
				if point.distance_to(obstacle.point) < float(obstacle.radius)+0.12:
					blocked = true
					break
			grid.set_point_solid(Vector2i(x,z),blocked)
	revision += 1

func _free_cell(point: Vector3, approach: Vector3) -> Vector2i:
	var center = Vector2i(roundi(point.x/CELL),roundi(point.z/CELL))
	center.x = clampi(center.x,REGION.position.x,REGION.end.x-1)
	center.y = clampi(center.y,REGION.position.y,REGION.end.y-1)
	if not grid.is_point_solid(center): return center
	var best = center
	var best_score = INF
	for dx in range(-4,5):
		for dz in range(-4,5):
			var candidate = center+Vector2i(dx,dz)
			if not grid.is_in_boundsv(candidate) or grid.is_point_solid(candidate): continue
			var world = Vector3(candidate.x*CELL,0,candidate.y*CELL)
			var score = point.distance_to(world)+world.distance_to(approach)*0.06
			if score < best_score:
				best = candidate
				best_score = score
	return best

func path_between(from: Vector3, to: Vector3) -> Array[Vector3]:
	var start = _free_cell(from,to)
	var end = _free_cell(to,from)
	var result: Array[Vector3] = []
	for cell in grid.get_id_path(start,end):
		result.append(Vector3(cell.x*CELL,0,cell.y*CELL))
	return result
