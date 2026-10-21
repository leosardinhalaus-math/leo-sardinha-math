extends RefCounted
class_name MathChallenge

static func make(world: int, stage: int, rng: RandomNumberGenerator) -> Dictionary:
	var n = rng.randi_range(2, 5)
	var a = rng.randi_range(1, 4)
	var x = rng.randi_range(1, 3)
	var result: Dictionary
	match world:
		0:
			if stage == 0:
				result = {"question": "Se f(x) = %dx², quanto vale f'(%d)?" % [a, x], "answer": 2 * a * x, "explanation": "A regra da potência dá f'(x) = %dx. Substituindo x = %d, obtemos %d." % [2 * a, x, 2 * a * x]}
			elif stage == 1:
				result = {"question": "lim (x → %d) de (x² − %d)/(x − %d) = ?" % [n, n * n, n], "answer": 2 * n, "explanation": "Fatore x² − %d = (x − %d)(x + %d). Para x diferente de %d, a fração vale x + %d; o limite é %d." % [n * n, n, n, n, n, 2 * n]}
			elif stage == 2:
				result = {"question": "A derivada de x³, calculada em x = %d, vale quanto?" % x, "answer": 3 * x * x, "explanation": "A derivada é 3x². Em x = %d, resulta %d." % [x, 3 * x * x]}
			elif stage == 3:
				result = {"question": "Para a função contínua f(x) = %dx + %d, qual é o limite quando x → 1?" % [a, n], "answer": a + n, "explanation": "Polinômios são contínuos. Basta substituir x = 1: %d + %d = %d." % [a, n, a + n]}
			elif stage == 4:
				result = {"question": "Para x diferente de zero, f(x) = x²/x. Quanto vale f'(2)?", "answer": 1, "explanation": "Para x ≠ 0, x²/x = x. Logo f'(x) = 1, inclusive em x = 2."}
			else:
				result = {"question": "Se f(x) = %d eˣ, quanto vale f'(0)?" % a, "answer": a, "explanation": "A derivada de eˣ é eˣ e e⁰ = 1. Portanto, f'(0) = %d." % a}
		1:
			match stage:
				0:
					result = {"question": "Se y = (%dx + 1)², quanto vale y'(1)?" % a, "answer": 2 * a * (a + 1), "explanation": "Pela regra da cadeia, y' = 2(%dx + 1) · %d. Em x = 1, o resultado é %d." % [a, a, 2 * a * (a + 1)]}
				1:
					result = {"question": "Na composição y = u², com u = %dx + 1, quanto vale du/dx?" % a, "answer": a, "explanation": "A derivada da função interna %dx + 1 é %d. Esse fator não pode ser esquecido na regra da cadeia." % [a, a]}
				2:
					result = {"question": "Se f(x) = x/%d, sua inversa é f⁻¹(x) = %dx. Quanto vale (f⁻¹)'?" % [a, a], "answer": a, "explanation": "A inversa multiplica por %d; sua derivada constante é %d." % [a, a]}
				3:
					result = {"question": "Se x(t) = %dt² e y = 3x, quanto vale dy/dt em t = 1?" % a, "answer": 6 * a, "explanation": "dx/dt = %dt e dy/dx = 3. Logo dy/dt = %dt, que em t = 1 vale %d." % [2 * a, 6 * a, 6 * a]}
				4:
					result = {"question": "Na curva x² + y² = %d, quanto vale y' no ponto (%d, %d)?" % [2 * n * n, n, n], "answer": -1, "explanation": "Derivando implicitamente: 2x + 2y·y' = 0. Assim, y' = −x/y = −1 nesse ponto."}
				_:
					result = {"question": "Se y = (%dx + 1)³, quanto vale y'(0)?" % a, "answer": 3 * a, "explanation": "Pela cadeia, y' = 3(%dx + 1)²·%d. Em x = 0, obtemos %d." % [a, a, 3 * a]}
		2:
			if stage == 0:
				result = {"question": "f(x) = −(x − %d)² + %d tem máximo em qual valor de x?" % [n, a + 5], "answer": n, "explanation": "O termo quadrado é não negativo. Seu oposto é máximo quando x − %d = 0; logo x = %d." % [n, n]}
			elif stage == 1:
				var root_value = 4 * a
				result = {"question": "Newton para f(x) = x² − %d, partindo de x₀ = %d: qual é x₁?" % [root_value * root_value, root_value * 2], "answer": 5 * a, "explanation": "x₁ = x₀ − (x₀² − %d)/(2x₀). Substituindo x₀ = %d, resulta %d." % [root_value * root_value, root_value * 2, 5 * a]}
			elif stage == 2:
				result = {"question": "Se f'(x) é positiva em um intervalo, f é crescente (1) ou decrescente (−1)?", "answer": 1, "explanation": "Uma derivada positiva indica crescimento da função naquele intervalo."}
			elif stage == 3:
				result = {"question": "O Taylor de e²ˣ em torno de zero começa com 1 + 2x + kx². Qual é k?", "answer": 2, "explanation": "f''(0) = 4 e o coeficiente quadrático é f''(0)/2! = 2."}
			elif stage == 4:
				result = {"question": "Qual é o valor máximo de f(x) = −x² + %dx?" % (2 * n), "answer": n * n, "explanation": "Completando o quadrado: f(x) = −(x − %d)² + %d. O máximo é %d." % [n, n * n, n * n]}
			else:
				result = {"question": "f(x) = x³ − 3x tem máximo local em x = 1 ou x = −1?", "answer": -1, "explanation": "f'(x) = 3x² − 3 zera em ±1. Como f''(−1) = −6 < 0, x = −1 é máximo local."}
		3:
			match stage:
				0:
					result = {"question": "Quanto vale a integral de 2x, de 0 até %d?" % n, "answer": n * n, "explanation": "Uma primitiva de 2x é x². Pelo teorema fundamental, a integral vale %d² − 0² = %d." % [n, n * n]}
				1:
					result = {"question": "Qual é o valor médio de f(x) = 2x no intervalo [0, %d]?" % n, "answer": n, "explanation": "A integral é %d² = %d. Dividindo pelo comprimento %d do intervalo, obtemos %d." % [n, n * n, n, n]}
				2:
					result = {"question": "F(x) = ∫ de 0 até x de t² dt. Quanto vale F'(%d)?" % n, "answer": n * n, "explanation": "Pelo teorema fundamental, F'(x) = x². Em x = %d, isso vale %d." % [n, n * n]}
				3:
					result = {"question": "Uma primitiva de 2x é xᵏ + C. Qual é o expoente k?", "answer": 2, "explanation": "A derivada de x² + C é 2x. Por isso, k = 2."}
				4:
					result = {"question": "Um sólido tem seção transversal constante de área %d, entre x = 0 e x = %d. Qual é o volume?" % [a, n], "answer": a * n, "explanation": "O volume é a integral da área: V = ∫ de 0 até %d de %d dx = %d." % [n, a, a * n]}
				_:
					result = {"question": "Quanto vale a integral de 3x², de 0 até %d?" % n, "answer": n * n * n, "explanation": "Uma primitiva é x³. Logo, a integral é %d³ − 0³ = %d." % [n, n * n * n]}
		_:
			match stage:
				0:
					result = {"question": "Na substituição u = x² + 1, du = k·x dx. Qual é k?", "answer": 2, "explanation": "Derivando u em relação a x: du/dx = 2x. Assim, du = 2x dx."}
				1:
					result = {"question": "Quanto vale ∫ de 0 até 1 de x·eˣ dx?", "answer": 1, "explanation": "Por partes, uma primitiva é x eˣ − eˣ. Nos limites, o valor é (e − e) − (0 − 1) = 1."}
				2:
					result = {"question": "Um único trapézio aproxima ∫ de 0 até 2 de x² dx por T = (2−0)·(f(0)+f(2))/2. Quanto vale T?", "answer": 4, "explanation": "f(0) = 0 e f(2) = 4. Então T = 2·(0+4)/2 = 4. É aproximação, não o valor exato da integral."}
				3:
					result = {"question": "A integral de 1/x², de 1 até infinito, converge para qual valor?", "answer": 1, "explanation": "Uma primitiva é −1/x. O limite de −1/b quando b cresce é 0; portanto, 0 − (−1) = 1."}
				4:
					result = {"question": "Quanto vale a série geométrica 1 + 1/2 + 1/4 + 1/8 + …?", "answer": 2, "explanation": "A razão é 1/2, de módulo menor que 1. A soma é 1/(1 − 1/2) = 2."}
				_:
					result = {"question": "Simpson com dois subintervalos para f(x)=3x² em [0,2]: (f(0)+4f(1)+f(2))/3 = ?", "answer": 8, "explanation": "Os valores são 0, 3 e 12. Simpson fornece (0 + 4·3 + 12)/3 = 8, exato para esse polinômio."}
	var answer = int(result.answer)
	var options: Array = [answer]
	while options.size() < 4:
		var candidate = answer + rng.randi_range(-7, 9)
		if not options.has(candidate):
			options.append(candidate)
	for index in range(options.size() - 1, 0, -1):
		var other = rng.randi_range(0, index)
		var temporary = options[index]
		options[index] = options[other]
		options[other] = temporary
	result.options = options
	return result
