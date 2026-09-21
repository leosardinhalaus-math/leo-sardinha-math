# Calculus Royale portrait atlases

Six generated 3 × 2 portrait atlases replace the 35 procedural placeholders. The ten existing original portraits remain unchanged. Each cell is selected in row-major order by `manifest.json`. The sixth cell of atlas 6 is the illustrated fallback. Build preparation validates source hashes, extracts cells and writes provenance fingerprints for all replacements.

Generation: built-in image generation, using the existing original character sprite as the style reference for atlas 1, then atlas 1 as the style reference for atlases 2–6. Prompt direction: richly painted semi-realistic fantasy card illustration; detailed expressive faces; cinematic lighting; ornate metal and cloth; independent square portraits in a precise 3 × 2 atlas; no gutters, frames or text. Subjects follow the card descriptions in `client/src/data/character-art-backlog.json`, in the exact manifest order. These are 2D portraits, not articulated 3D models.

Do not restore the former procedural drawing generator. New art must be supplied as reviewed image assets and added to the manifest. Portrait URLs include an art-version query to refresh previously cached placeholders.
