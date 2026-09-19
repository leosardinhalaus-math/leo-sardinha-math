from pathlib import Path
p=Path('client/src/components/GameCanvas.tsx')
text=p.read_text(encoding='utf-8')
if 'import RoyaleCard from "./RoyaleCard";' not in text:
    text='import RoyaleCard from "./RoyaleCard";\n'+text

text=text.replace('type View = "map" | "battle" | "deck";', 'type View = "home" | "map" | "battle" | "deck";')
text=text.replace('inventory: "calculus-royale:inventory" };', 'inventory: "calculus-royale:inventory", playerName: "calculus-royale:player-name" };')
text=text.replace('const [view, setView] = useState<View>("battle");', 'const [view, setView] = useState<View>("home");\n  const [playerName, setPlayerName] = useState(() => readStorage(storageKeys.playerName, ""));\n  const [nameDraft, setNameDraft] = useState(() => readStorage(storageKeys.playerName, ""));')

text=text.replace('const timer = window.setInterval(() => {\n      if (battleResolvedRef.current) return;', 'const timer = window.setInterval(() => {\n      if (view !== "battle" || battleResolvedRef.current) return;', 1)
text=text.replace('const aiTimer = window.setInterval(() => {\n      if (battleResolvedRef.current) return;', 'const aiTimer = window.setInterval(() => {\n      if (view !== "battle" || battleResolvedRef.current) return;', 1)
text=text.replace('  }, [worldIndex]);\n\n  useEffect(() => {\n    if (celebrationWorld === null)', '  }, [worldIndex, view]);\n\n  useEffect(() => {\n    if (celebrationWorld === null)', 1)

needle='  const selectWorld = (index: number) => {'
enter='''  const enterGame = (withName: boolean) => {
    const nextName = withName ? nameDraft.trim().slice(0, 24) : "";
    if (withName && !nextName) { setToast("Digite um nome ou escolha Jogar sem nome."); return; }
    setPlayerName(nextName);
    window.localStorage.setItem(storageKeys.playerName, JSON.stringify(nextName));
    setView("map");
  };

'''
if needle not in text: raise SystemExit('selectWorld marker not found')
text=text.replace(needle, enter+needle, 1)

text=text.replace('const resetBattle = () => { setEnemyTower(82); setAllyTower(96); setUnits([]); setEnemyUnits([]); setEnergy(7); setEnemyEnergy(5); setDeckQueue(mainDeckIds); setView("battle");', 'const resetBattle = () => { setEnemyTower(getWorldEnemyHp(worldIndex)); setAllyTower(96); setUnits([]); setEnemyUnits([]); setEnergy(7); setEnemyEnergy(5); setDeckQueue(mainDeckIds); setView("battle");')

text=text.replace('<main className="game-shell" style=', '<main className={`game-shell screen-${view}`} style=', 1)
landing='''      {view === "home" && <section className="landing-page"><div className="landing-copy"><span className="landing-eyebrow">ARENA EDUCACIONAL · CÁLCULO EM BATALHA</span><div className="landing-logo"><span>∂</span><h1>Calculus <em>Royale</em></h1></div><p>Domine derivadas, integrais, limites e séries usando personagens, fórmulas, baús e estratégia.</p><div className="landing-name-box"><label htmlFor="player-name">NOME DO JOGADOR · OPCIONAL</label><input id="player-name" value={nameDraft} maxLength={24} placeholder="Ex.: Léo Sardinha" onChange={(event) => setNameDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && nameDraft.trim()) enterGame(true); }} /><button className="landing-play" disabled={!nameDraft.trim()} onClick={() => enterGame(true)}><Swords size={17} /> JOGUE AGORA</button><button className="landing-anon" onClick={() => enterGame(false)}>Jogar sem nome</button></div><div className="landing-links"><a href="./perfil/">Perfil online</a><a href="./ranking/">Ranking</a><a href="../../educacao.html">Leo Sardinha.Math</a></div></div><div className="landing-visual"><img src={worldArt[0]} alt="Personagens do Calculus Royale" /><div className="landing-badges"><span>5 ilhas</span><span>personagens + fórmulas</span><span>baús por fase</span><span>ranking online</span></div></div></section>}
'''
marker='      <div className="vignette" />\n'
if marker not in text: raise SystemExit('vignette marker not found')
text=text.replace(marker, marker+landing, 1)

old='<button className={`top-nav ${view === "map" ? "active" : ""}`} onClick={() => setView("map")}><MapPinned size={14} /> Mapa</button><button className={`top-nav ${view === "deck" ? "active" : ""}`} onClick={() => setView("deck")}><Layers3 size={14} /> Deck principal</button>'
new='<button className="top-nav" onClick={() => setView("home")}>∂ Início</button><button className={`top-nav ${view === "map" ? "active" : ""}`} onClick={() => setView("map")}><MapPinned size={14} /> Ilhas</button><button className={`top-nav ${view === "battle" ? "active" : ""}`} onClick={() => setView("battle")}><Swords size={14} /> Partida</button><button className={`top-nav ${view === "deck" ? "active" : ""}`} onClick={() => setView("deck")}><Layers3 size={14} /> Deck</button><a className="top-nav nav-link" href="./perfil/">Perfil</a><a className="top-nav nav-link" href="./ranking/">Ranking</a>'
if old not in text: raise SystemExit('top nav marker not found')
text=text.replace(old,new,1)

text=text.replace('<strong>Aprendiz do Limite</strong><small>Nível 07 · 1.240 XP</small>', '<strong>{playerName || "Visitante"}</strong><small>{completedWorlds.filter(Boolean).length}/5 ilhas · {wins} vitórias</small>')

if "<div className=\"card-stack\">{activeCards.map((card) => <button key={card.id} className={`spell-card ${rarityClass[card.rarity]}`} onClick={() => playCard(card)}><div className=\"card-top\"><span className=\"card-cost\">{card.cost}</span><span className=\"card-kind\">{card.kind}</span><span className=\"card-rarity\">{card.rarity}</span></div><div className=\"card-art\" style={{ \"--card-color\": world.color } as React.CSSProperties}><img src={getCardArt(card)} alt={`Personagem 2D ${card.name}, inspirado em ${card.formula}`} /><span className=\"formula-ribbon\">{card.formula}</span></div><div className=\"card-copy\"><strong>{card.name}</strong><small>{card.formula}</small><em>{card.effect}</em></div><div className=\"card-footer\"><span><Zap size={11} /> poder {Math.round(card.power * (1 + (cardLevels[card.id] ?? 0) * .12))} · Nv.{(cardLevels[card.id] ?? 0) + 1}</span><span onClick={(event) => { event.stopPropagation(); evolveCard(card); }} className=\"evolve-action\">✦ evoluir</span></div></button>)}</div>" not in text:
    raise SystemExit("card render marker not found")
text=text.replace("<div className=\"card-stack\">{activeCards.map((card) => <button key={card.id} className={`spell-card ${rarityClass[card.rarity]}`} onClick={() => playCard(card)}><div className=\"card-top\"><span className=\"card-cost\">{card.cost}</span><span className=\"card-kind\">{card.kind}</span><span className=\"card-rarity\">{card.rarity}</span></div><div className=\"card-art\" style={{ \"--card-color\": world.color } as React.CSSProperties}><img src={getCardArt(card)} alt={`Personagem 2D ${card.name}, inspirado em ${card.formula}`} /><span className=\"formula-ribbon\">{card.formula}</span></div><div className=\"card-copy\"><strong>{card.name}</strong><small>{card.formula}</small><em>{card.effect}</em></div><div className=\"card-footer\"><span><Zap size={11} /> poder {Math.round(card.power * (1 + (cardLevels[card.id] ?? 0) * .12))} · Nv.{(cardLevels[card.id] ?? 0) + 1}</span><span onClick={(event) => { event.stopPropagation(); evolveCard(card); }} className=\"evolve-action\">✦ evoluir</span></div></button>)}</div>", "<div className=\"card-stack\">{activeCards.map((card) => <RoyaleCard key={card.id} card={card} level={(cardLevels[card.id] ?? 0) + 1} disabled={energy < card.cost} variant={activeTab === \"deck\" ? \"deck\" : \"hand\"} onPlay={playCard} onEvolve={evolveCard} />)}</div>", 1)
p.write_text(text,encoding='utf-8')
