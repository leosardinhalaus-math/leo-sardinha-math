"""Smoke test visual do Calculus Royale (desktop e celular, sem backend)."""
import os
from pathlib import Path

from playwright.sync_api import sync_playwright, expect

URL = os.environ.get("GAME_URL", "http://127.0.0.1:8765/")
OUT = Path(os.environ.get("SCREENSHOT_DIR", "browser-screenshots"))
OUT.mkdir(parents=True, exist_ok=True)


def smoke(browser, name, *, width, height, mobile=False):
    context = browser.new_context(
        viewport={"width": width, "height": height},
        device_scale_factor=1,
        is_mobile=mobile,
        has_touch=mobile,
        reduced_motion="reduce",
    )
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda err: errors.append(str(err)))
    page.goto(URL, wait_until="domcontentloaded", timeout=60000)
    expect(page.get_by_role("button", name="Jogar sem nome")).to_be_visible(timeout=30000)
    page.screenshot(path=str(OUT / f"{name}-inicio.png"), full_page=True)
    page.get_by_role("button", name="Jogar sem nome").click()
    expect(page.locator("#preparation-title")).to_have_text("Prepare sua estratégia", timeout=15000)
    page.locator("button.prepare-play").click()
    expect(page.locator(".arena-frame")).to_be_visible(timeout=15000)
    expect(page.locator(".tower-scoreboard")).to_have_count(2, timeout=15000)
    page.wait_for_function(
        """() => {
          const el = document.querySelector('.world-arena');
          return el && ['ready', 'fallback'].includes(el.dataset.sceneStatus);
        }""",
        timeout=90000,
    )
    status = page.locator(".world-arena").get_attribute("data-scene-status")
    print(f"{name}: arena status={status}")
    if status != "ready":
        raise AssertionError(f"{name}: arena WebGL caiu para modo ilustrado; verificar screenshot/driver")
    loaded = page.locator(".world-arena canvas").get_attribute("data-models-loaded")
    print(f"{name}: GLB assets loaded={loaded}")
    page.screenshot(path=str(OUT / f"{name}-arena.png"), full_page=True)
    assert page.locator("canvas.world-arena-canvas").count() == 1
    # Testar a abertura e cancelamento de posicionamento, sem consumir elixir.
    cards = page.locator(".card-stack button")
    if cards.count() > 0 and cards.first.is_enabled():
        cards.first.click()
        expect(page.locator(".spawn-heading")).to_be_visible(timeout=10000)
        page.screenshot(path=str(OUT / f"{name}-posicionamento.png"), full_page=True)
        confirm = page.locator(".spawn-confirm")
        expect(confirm).to_be_enabled(timeout=15000)
        confirm.click()
        expect(page.locator(".spawn-heading")).to_have_count(0, timeout=10000)
        page.wait_for_function(
            "() => Number(document.querySelector('.world-arena canvas')?.dataset.units ?? 0) >= 1",
            timeout=20000,
        )
        page.screenshot(path=str(OUT / f"{name}-personagem-invocado.png"), full_page=True)
    overflow = page.evaluate(
        "() => document.documentElement.scrollWidth - document.documentElement.clientWidth"
    )
    print(f"{name}: horizontal overflow={overflow}px")
    if overflow > 8:
        raise AssertionError(f"{name}: conteúdo ultrapassa a largura do viewport em {overflow}px")
    if errors:
        raise AssertionError(f"{name}: erros JavaScript: {errors[:5]}")
    context.close()


def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            channel="chrome",
            headless=True,
            args=[
                "--use-gl=angle",
                "--use-angle=swiftshader",
                "--enable-webgl",
                "--ignore-gpu-blocklist",
            ],
        )
        try:
            smoke(browser, "desktop", width=1440, height=900)
            smoke(browser, "celular", width=390, height=844, mobile=True)
        finally:
            browser.close()


if __name__ == "__main__":
    main()
