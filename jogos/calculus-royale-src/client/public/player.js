(() => {
"use strict";
const SUPABASE_URL = "https://vmblubjbgwhaplsptymj.supabase.co";
const SUPABASE_KEY = "sb_publishable_FxmodDcyhUhSyqre8fTCCw_DwI4iiE8";
const SESSION_KEY = "calculus-royale:cloud-session";
const PENDING_NAME_KEY = "calculus-royale:pending-username";

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const safe = (value="") => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function api(path, options={}, token="") {
  const headers = {
    apikey: SUPABASE_KEY,
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try { res = await fetch(SUPABASE_URL + path, { ...options, headers }); }
  catch { throw new Error('O serviço online está indisponível. Seu progresso continua salvo neste aparelho.'); }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const message = data?.msg || data?.message || data?.error_description || data?.error || `Erro ${res.status}`;
    const failure = new Error(message);
    failure.status = res.status;
    throw failure;
  }
  return data;
}

function saveSession(data) {
  if (typeof data?.access_token !== "string" || !data.access_token || typeof data?.refresh_token !== "string" || !data.refresh_token || typeof data?.user?.id !== "string" || !data.user.id) return null;
  const session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now()/1000) + (data.expires_in || 3600),
    user: data.user,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

let pendingRefresh = null;
let sessionEpoch = 0;
async function session() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch {}
  if (typeof s?.access_token !== "string" || !s.access_token || typeof s?.refresh_token !== "string" || !s.refresh_token || typeof s?.user?.id !== "string" || !s.user.id || !Number.isFinite(s.expires_at)) {
    if (s !== null) localStorage.removeItem(SESSION_KEY);
    return null;
  }
  if ((s.expires_at || 0) > Math.floor(Date.now()/1000) + 60) return s;
  if (!s.refresh_token) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
  // Refresh tokens rotate: concurrent profile requests must share one refresh.
  if (!pendingRefresh) {
    pendingRefresh = (async () => {
      const epoch = sessionEpoch;
      try {
        const data = await api("/auth/v1/token?grant_type=refresh_token", {
          method: "POST",
          body: JSON.stringify({ refresh_token: s.refresh_token }),
        });
        if (epoch !== sessionEpoch) return null; // logout or a new login invalidated this request
        const renewed = saveSession(data);
        if (!renewed?.user?.id) throw new Error("Invalid session refresh");
        return renewed;
      } catch (error) {
        // Never sign the player out because of temporary network/server trouble.
        // Invalidate only definitely rejected or malformed refresh credentials.
        const rejected = (Number.isInteger(error?.status) && error.status >= 400 && error.status < 500 && error.status !== 429)
          || error?.message === "Invalid session refresh";
        if (epoch === sessionEpoch && rejected) localStorage.removeItem(SESSION_KEY);
        return null;
      } finally {
        pendingRefresh = null;
      }
    })();
  }
  return pendingRefresh;
}

async function signIn(email, password) {
  const data = await api("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  sessionEpoch += 1; // newer login takes precedence over any in-flight refresh
  const signedIn = saveSession(data);
  if (!signedIn) throw new Error("Não foi possível confirmar o login. Tente novamente.");
  return signedIn;
}

async function signUp(email, password, username) {
  const cleanName = String(username || "").trim().slice(0, 24);
  if (cleanName.length < 3) throw new Error("Escolha um nome com pelo menos três caracteres.");
  const redirectTo = location.origin + location.pathname;
  const data = await api("/auth/v1/signup?redirect_to=" + encodeURIComponent(redirectTo), {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  // Keep the name only after successful registration (confirmation may be pending).
  localStorage.setItem(PENDING_NAME_KEY, cleanName);
  if (!data?.access_token) return data;
  sessionEpoch += 1;
  return saveSession(data);
}

function slugify(name, uid) {
  const base = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "jogador";
  return `${base}-${String(uid).slice(0,6)}`;
}

async function getProfile(s) {
  const rows = await api("/rest/v1/player_profiles?user_id=eq." + encodeURIComponent(s.user.id) + "&select=user_id,username,public_slug,avatar_seed,created_at,updated_at", {}, s.access_token);
  return rows?.[0] || null;
}

async function ensureProfile(s, username) {
  const existing = await getProfile(s);
  if (existing) return existing;
  const clean = (username || localStorage.getItem(PENDING_NAME_KEY) || "").trim();
  if (clean.length < 3) throw new Error("Escolha um nome com pelo menos 3 caracteres.");
  const payload = {
    user_id: s.user.id,
    username: clean.slice(0,24),
    public_slug: slugify(clean, s.user.id),
    avatar_seed: clean.slice(0,1).toUpperCase() || "C",
  };
  const rows = await api("/rest/v1/player_profiles", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  }, s.access_token);
  const confirmed = Array.isArray(rows) ? rows[0] : null;
  if (!confirmed || confirmed.user_id !== s.user.id) {
    throw new Error("Não foi possível confirmar o perfil online. Seus dados locais continuam preservados.");
  }
  localStorage.removeItem(PENDING_NAME_KEY);
  return confirmed;
}

function localProgress() {
  const read = (key, fallback) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  };
  // These bounds protect the REST integer columns from corrupted/offline saves.
  // They do NOT make locally generated scores authoritative or anti-cheat.
  const safeInt = value => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(2000000000, Math.max(0, Math.floor(number))) : 0;
  };
  const worlds = read("calculus-royale:completed-worlds", [false,false,false,false,false]);
  const wins = safeInt(read("calculus-royale:wins", 0));
  const coins = safeInt(read("calculus-royale:coins", 0));
  const essence = safeInt(read("calculus-royale:essence", 0));
  const inventory = read("calculus-royale:inventory", []);
  const leaderboard = read("calculus-royale:survival-leaderboard", []);
  const badges = read("calculus-royale:survival-badges", []);
  const completed = Array.isArray(worlds) ? Math.min(5, worlds.filter(Boolean).length) : 0;
  const bestWave = Array.isArray(leaderboard) ? leaderboard.reduce((m,e)=>Math.max(m,safeInt(e?.wave)),0) : 0;
  const chests = Array.isArray(inventory) ? safeInt(inventory.length) : 0;
  const badgeCount = Array.isArray(badges) ? safeInt(badges.length) : 0;
  const xp = safeInt(wins*120 + completed*400 + bestWave*80 + badgeCount*150 + chests*60);
  const trophies = safeInt(wins*25 + completed*250 + bestWave*35 + badgeCount*100 + chests*20);
  return {
    level: 1 + Math.floor(xp/500),
    xp, trophies, wins, losses: 0,
    completed_worlds: completed,
    best_tower_wave: bestWave,
    current_streak: 0, best_streak: 0,
    chests_opened: chests, coins, essence,
  };
}

async function syncProgress(s) {
  const profile = await getProfile(s);
  if (!profile) throw new Error("Crie seu perfil primeiro.");
  const stats = { user_id: s.user.id, ...localProgress(), updated_at: new Date().toISOString() };
  const rows = await api("/rest/v1/game_stats?on_conflict=user_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(stats),
  }, s.access_token);
  const confirmed = Array.isArray(rows) ? rows[0] : null;
  if (!confirmed || confirmed.user_id !== s.user.id) {
    throw new Error("Não foi possível confirmar o salvamento online. Seu progresso continua neste aparelho.");
  }
  return confirmed;
}

async function getMyStats(s) {
  const rows = await api("/rest/v1/game_stats?user_id=eq." + encodeURIComponent(s.user.id) + "&select=user_id,level,xp,trophies,wins,losses,completed_worlds,best_tower_wave,current_streak,best_streak,chests_opened,coins,essence,updated_at", {}, s.access_token);
  return rows?.[0] || null;
}

async function publicProfile(slug) {
  // Only slugs generated by this client are valid; reject filters from untrusted URLs.
  if (typeof slug !== "string" || slug.length > 48 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const profiles = await api("/rest/v1/player_profiles?public_slug=eq." + encodeURIComponent(slug) + "&select=user_id,username,public_slug,avatar_seed&limit=1");
  const profile = profiles?.[0];
  if (!profile) return null;
  const stats = await api("/rest/v1/game_stats?user_id=eq." + encodeURIComponent(profile.user_id) + "&select=level,xp,trophies,wins,losses,completed_worlds,best_tower_wave,current_streak,best_streak,chests_opened,coins,essence&limit=1");
  return { profile, stats: stats?.[0] || null };
}

async function leaderboard(sort="trophies.desc") {
  const allowedSorts = new Set(["trophies.desc", "best_tower_wave.desc", "completed_worlds.desc,xp.desc"]);
  if (!allowedSorts.has(sort)) throw new Error("Ordenação de ranking inválida.");
  const stats = await api("/rest/v1/game_stats?select=user_id,level,xp,trophies,wins,losses,completed_worlds,best_tower_wave,current_streak,best_streak,chests_opened,coins,essence&order=" + encodeURIComponent(sort) + "&limit=100");
  if (!Array.isArray(stats) || stats.length === 0) return [];
  // Read only profiles belonging to the selected ranking entries, rather than
  // taking an unrelated first page of profiles (which can hide ranked players).
  const ids = [...new Set(stats.map(s => s.user_id).filter(id => typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id)))];
  if (!ids.length) return [];
  const profiles = await api("/rest/v1/player_profiles?select=user_id,username,public_slug,avatar_seed&user_id=in.(" + ids.join(",") + ")&limit=100");
  const byId = new Map((profiles || []).map(p => [p.user_id, p]));
  return (stats || []).map(s => ({ ...s, profile: byId.get(s.user_id) })).filter(x => x.profile);
}

async function logout() {
  sessionEpoch += 1; // do not let an in-flight refresh restore this session
  let token = "";
  try {
    const stored = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (typeof stored?.access_token === "string") token = stored.access_token;
  } catch {}
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(PENDING_NAME_KEY);
  try {
    if (token) await api("/auth/v1/logout", { method: "POST" }, token);
  } catch {
    // Offline or expired sessions must still sign out locally.
  } finally {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(PENDING_NAME_KEY);
    location.reload();
  }
}

const legacy = { $, $$, safe, api, session, signIn, signUp, getProfile, ensureProfile, syncProgress, getMyStats, publicProfile, leaderboard, logout, localProgress, provider: 'supabase' };
if (window.CalculusCloudConfig?.provider === 'firebase') {
  const config = window.CalculusCloudConfig.firebase;
  const configured = ['apiKey','projectId','appId','authDomain'].every(key => typeof config?.[key] === 'string' && config[key].trim());
  let service;
  async function firebase() {
    if (!configured) throw new Error('O salvamento online ainda não está disponível. Você pode continuar jogando neste aparelho.');
    if (!service) service = import('./firebase-runtime.js')
      .then(module => module.openFirebase(config, localProgress, localStorage))
      .catch(() => { service = undefined; throw new Error('Não foi possível conectar ao serviço online agora. Seu progresso neste aparelho foi preservado.'); });
    return service;
  }
  const cloud = { $, $$, safe, localProgress, provider: 'firebase', configured };
  for (const method of ['signIn','signUp','getProfile','ensureProfile','syncProgress','getMyStats','publicProfile','leaderboard','restoreProgress','subscribeLeaderboard']) {
    cloud[method] = (...args) => firebase().then(adapter => adapter[method](...args));
  }
  cloud.session = () => configured ? firebase().then(adapter => adapter.session()) : Promise.resolve(null);
  cloud.logout = async () => { await (await firebase()).logout(); location.reload(); };
  window.CalculusCloud = cloud;
} else {
  window.CalculusCloud = legacy;
}
})();
