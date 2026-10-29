"""Contrôles du registre et de ses preuves, sans accès réseau."""
import copy
import json
import unittest
from pathlib import Path

from scripts.audit_curriculum import audit

ROOT = Path(__file__).resolve().parents[1]


class CurriculumTests(unittest.TestCase):
    def setUp(self):
        self.catalogue = json.loads((ROOT / 'curriculum/catalogue.json').read_text())

    def test_current_registry_remains_explicitly_incomplete(self):
        issues = audit(self.catalogue)
        self.assertTrue(any('programme pédagogique incomplet' in issue for issue in issues))
        self.assertFalse(any('contenu ou version de référence non validés' in issue for issue in issues))
        self.assertFalse(any('Sources :' in issue for issue in issues))
        self.assertFalse(any('calendrier non validé' in issue for issue in issues))
        self.assertFalse(any('Couverture des classes' in issue for issue in issues))

    def test_empty_registry_cannot_be_declared_complete(self):
        self.catalogue['programs'] = []
        self.catalogue['contents'] = []
        for scope in self.catalogue['scopes']:
            scope['subjects'] = []
            scope['subject_inventory_status'] = 'unverified'
        issues = audit(self.catalogue)
        self.assertIn('Aucun corpus pédagogique officiel vérifié intégré.', issues)
        self.assertEqual(sum('matières et variantes non vérifiées' in i for i in issues), 17)

    def test_missing_pathway_is_detected(self):
        self.catalogue['scopes'].pop()
        self.assertIn('Couverture des classes et voies incorrecte.', audit(self.catalogue))

    def make_program(self):
        program = copy.deepcopy(next(p for p in self.catalogue['programs'] if p['id'] == 'CP-mathematiques-commun'))
        program['id'] = 'fixture'
        self.catalogue['programs'] = [program]
        self.catalogue['contents'] = []
        return program

    def test_future_expired_and_invalid_dates_are_rejected(self):
        self.make_program()
        message = 'fixture : références, applicabilité ou structure non validées.'
        self.assertNotIn(message, audit(self.catalogue))
        for field, value in [('effective_from', '2027-09-01'), ('effective_until', '2026-12-31'), ('effective_from', '2026-02-30')]:
            with self.subTest(field=field, value=value):
                changed = copy.deepcopy(self.catalogue)
                changed['programs'][0][field] = value
                self.assertIn(message, audit(changed))

    def test_unofficial_sources_are_rejected(self):
        program = self.make_program()
        program['source']['url'] = 'https://education.gouv.fr.example.org/faux'
        self.assertIn('fixture : références, applicabilité ou structure non validées.', audit(self.catalogue))

    def test_content_from_other_version_is_rejected(self):
        self.catalogue['contents'][0]['program_version'] = 'obsolete'
        identifier = self.catalogue['contents'][0]['id']
        self.assertIn(identifier + ' : contenu ou version de référence non validés.', audit(self.catalogue))

    def test_unlinked_skill_is_rejected(self):
        self.catalogue['contents'][0]['skill_ids'] = ['invention']
        identifier = self.catalogue['contents'][0]['id']
        self.assertIn(identifier + ' : contenu ou version de référence non validés.', audit(self.catalogue))

    def test_rollout_keeps_future_classes_separate(self):
        transition = next(t for t in self.catalogue['transitions'] if t['id'] == 'cycle4-francais-maths')
        self.assertEqual(transition['stages'], [
            {'scopes': ['5e'], 'effective_from': '2026-09-01'},
            {'scopes': ['4e'], 'effective_from': '2027-09-01'},
            {'scopes': ['3e'], 'effective_from': '2028-09-01'},
        ])
