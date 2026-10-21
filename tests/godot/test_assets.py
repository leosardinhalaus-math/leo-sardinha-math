from pathlib import Path
import hashlib
import json
import struct
import unittest
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]

class Assets(unittest.TestCase):
    def test_cards_and_grid(self):
        cards=json.loads((ROOT/'data/cards.json').read_text())
        self.assertEqual(len(cards),45)
        self.assertEqual(len({card['key'] for card in cards}),45)
        self.assertEqual([card['id'] for card in cards],list(range(1,46)))
        self.assertEqual(len(list((ROOT/'assets/cards').glob('card_*.webp'))),45)
        hashes=set()
        for number in range(1,46):
            path=ROOT/f'assets/cards/card_{number:02}.webp'
            with Image.open(path) as image:self.assertEqual(image.size,(240,336))
            hashes.add(hashlib.sha256(path.read_bytes()).hexdigest())
        self.assertEqual(len(hashes),45)
        with Image.open(ROOT/'assets/source/cards_grid.webp') as image:self.assertEqual(image.size,(1200,3024))

    def test_maps_models_and_animation_states(self):
        self.assertEqual(len(list((ROOT/'assets/islands').glob('island_*.webp'))),5)
        models=list((ROOT/'assets/models_3d').glob('*.glb'))
        self.assertEqual(len(models),45)
        for model in models:
            data=model.read_bytes()
            self.assertEqual(data[:4],b'glTF')
            length,kind=struct.unpack_from('<II',data,12)
            document=json.loads(data[20:20+length])
            animations={item['name'] for item in document.get('animations',[])}
            self.assertTrue({'idle','walk','attack','power','victory','defeat'}<=animations,model.name)

    def test_provenance_matches_files(self):
        record=json.loads((ROOT/'data/asset-provenance.json').read_text())
        for name,digest in record['sha256'].items():
            self.assertEqual(hashlib.sha256((ROOT/name).read_bytes()).hexdigest(),digest)

if __name__=='__main__':unittest.main()
