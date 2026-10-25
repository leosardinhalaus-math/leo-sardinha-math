#!/usr/bin/env python3
"""Detect high-confidence credentials in tracked files. Never print secret values."""
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
PATTERNS = {
    "OpenAI project/API key": re.compile(rb"\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b"),
    "GitHub token": re.compile(rb"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b"),
    "GitHub fine-grained token": re.compile(rb"\bgithub_pat_[A-Za-z0-9_]{40,}\b"),
    "AWS access key": re.compile(rb"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
    "Private key PEM": re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"),
}
EXCLUDED_EXT = {".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp", ".woff", ".woff2", ".glb", ".pdf", ".zip", ".mp3", ".wasm"}
MAX_SIZE = 2_000_000

def main():
    result = subprocess.run(["git", "ls-files", "-z"], cwd=ROOT, capture_output=True, check=True)
    files = [p for p in result.stdout.split(b"\0") if p]
    failures = []
    for item in files:
        name = item.decode("utf-8", "surrogateescape")
        path = ROOT / name
        if not path.is_file() or path.suffix.lower() in EXCLUDED_EXT or path.stat().st_size > MAX_SIZE:
            continue
        if path.name.startswith(".env") and path.name not in {".env.example", ".env.sample"}:
            failures.append((name, "tracked private environment file"))
            continue
        data = path.read_bytes()
        if b"\0" in data[:1000]:
            continue
        for label, regex in PATTERNS.items():
            if regex.search(data):
                failures.append((name, label))
    for filename, label in failures:
        print(f"::error file={filename}::Potential secret detected ({label}); value withheld.")
    print(f"Checked {len(files)} tracked paths; {len(failures)} potential issues.")
    if failures:
        print("If exposed, immediately revoke/rotate the credential; history rewriting alone is insufficient.")
    return 1 if failures else 0

if __name__ == "__main__":
    sys.exit(main())
