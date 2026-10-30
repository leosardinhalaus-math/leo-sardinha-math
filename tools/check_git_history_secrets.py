#!/usr/bin/env python3
"""Scan reachable Git commit history for high-confidence secrets, without printing values."""
from pathlib import Path
import re
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]
RULES={
 "OpenAI API key":re.compile(rb"\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b"),
 "GitHub token":re.compile(rb"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b"),
 "GitHub fine-grained token":re.compile(rb"\bgithub_pat_[A-Za-z0-9_]{40,}\b"),
 "AWS access key":re.compile(rb"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
 "Private PEM key":re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"),
}
def git(*args):
 return subprocess.run(["git",*args],cwd=ROOT,check=True,capture_output=True).stdout
def main():
 # All refs fetched by checkout are scanned; shallow checkouts only cover fetched history.
 commits=git("rev-list","--all").decode().splitlines()
 checked=set()
 findings=[]
 for commit in commits:
  lines=git("ls-tree","-r","-z",commit).split(b"\0")
  for entry in lines:
   if not entry or b"\t" not in entry:continue
   meta,name=entry.split(b"\t",1)
   bits=meta.split()
   if len(bits)<3 or bits[1]!=b"blob":continue
   oid=bits[2].decode()
   if oid in checked:continue
   checked.add(oid)
   if int(git("cat-file","-s",oid))>1_000_000:continue
   data=git("cat-file","blob",oid)
   if b"\0" in data[:1000]:continue
   labels=[label for label,pattern in RULES.items() if pattern.search(data)]
   for label in labels:findings.append((commit[:12],name.decode("utf-8","replace"),label))
 for commit,name,label in findings:
  print(f"::error::Potential historical secret: commit {commit}, path {name}, type {label}; value withheld.")
 print(f"Scanned {len(commits)} fetched commits and {len(checked)} unique blobs. Findings: {len(findings)}.")
 if findings: print("Revoke/rotate exposed credentials immediately. Rewriting Git history is not a substitute.")
 return 1 if findings else 0
if __name__=="__main__":sys.exit(main())
