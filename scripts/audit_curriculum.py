"""Audit du référentiel 2026-2027 et de ses preuves locales.

python3 scripts/audit_curriculum.py [--require-complete] [--details] [--json]
Un audit structurel ne remplace pas la revue des sources et des contenus.
"""
import argparse
import hashlib
import json
from collections import Counter
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
KINDS = {'course', 'revision_sheet', 'quiz', 'exercise', 'assessment', 'audio', 'assistant_explanation'}
YEAR_START, YEAR_END = date(2026, 9, 1), date(2027, 8, 31)


def require(condition):
    if not condition:
        raise ValueError('Condition de validation non remplie')


def official(url):
    parsed = urlparse(url)
    host = parsed.hostname or ''
    return parsed.scheme == 'https' and (host == 'education.gouv.fr' or host.endswith('.education.gouv.fr'))


def local_path(path):
    resolved = (ROOT / path).resolve()
    require(resolved.is_relative_to(ROOT) and resolved.is_file())
    return resolved


def source_records(data):
    records = {}
    for index_path in data.get('sources_index', []):
        for record in json.loads(local_path(index_path).read_text()):
            if 'snapshot' in record:
                records[record['id']] = record
    return records


def valid_reference(program, records):
    require(program['reference_status'] == 'verified' and program['version'])
    source = program['source']
    record = records[source['source_id']]
    require(official(source['url']) and source['url'] == record['url'])
    require(source['title'] and source['text_reference'])
    require(source['sha256'] == record['sha256'])
    require(date.fromisoformat(source['published_on']) <= date.fromisoformat(source['checked_on']))
    start = date.fromisoformat(program['effective_from'])
    end = date.fromisoformat(program['effective_until']) if program.get('effective_until') else date.max
    require(start <= YEAR_START and end >= YEAR_END)
    legal = program['legal_source']
    require(legal['locator'] and legal['text_reference'])
    require(records[legal['source_id']]['url'] == legal['url'] and official(legal['url']))


def validate_lesson(content, program):
    require(content['review_status'] == 'verified')
    require(content['program_version'] == program['version'])
    require(content['kind'] in KINDS and content['learning_objectives'] and content['source_locators'])
    chapters = {c['id']: c for d in program['domains'] for c in d['chapters']}
    require(content['chapter_ids'] and set(content['chapter_ids']) <= chapters.keys())
    skills = {skill['id'] for c in chapters.values() for skill in c['skills']}
    require(content['skill_ids'] and set(content['skill_ids']) <= skills)
    lesson = json.loads(local_path(content['asset_path']).read_text())
    require(lesson['program_id'] == program['id'] and lesson['program_version'] == program['version'])
    require(lesson['chapter_id'] in content['chapter_ids'])
    require(lesson['learning_objectives'] and lesson['source_locators'])
    require(set(lesson['skill_ids']) == set(content['skill_ids']))
    kind = content['kind']
    if kind == 'course':
        require(lesson['course'])
        for part in lesson['course']:
            require(part['title'] and part['text'])
    elif kind == 'revision_sheet':
        require(lesson['revision_sheet'] and all(isinstance(s, str) and s.strip() for s in lesson['revision_sheet']))
    elif kind == 'quiz':
        require(lesson['quiz'])
        for question in lesson['quiz']:
            require(question['prompt'] and question['explanation'] and len(question['choices']) >= 2)
            require(type(question['correct_index']) is int and 0 <= question['correct_index'] < len(question['choices']))
    elif kind in {'exercise', 'assessment'}:
        items = lesson['exercises' if kind == 'exercise' else 'assessment']
        require(items)
        for item in items:
            require(item['prompt'] and item['solution'] and item['success_criterion'])
    elif kind == 'audio':
        require(isinstance(lesson['audio_transcript'], str) and lesson['audio_transcript'].strip())
    elif kind == 'assistant_explanation':
        require(isinstance(lesson['guided_explanation'], str) and lesson['guided_explanation'].strip())


def audit(data):
    issues = []
    try:
        records = source_records(data)
        for record in records.values():
            require(official(record['url']))
            digest = hashlib.sha256(local_path(record['snapshot']).read_bytes()).hexdigest()
            require(digest == record['sha256'])
    except (KeyError, ValueError, TypeError, OSError):
        records = {}
        issues.append('Sources : preuve locale absente, altérée ou non officielle.')
    scopes = data['scopes']
    programs = {p['id']: p for p in data['programs']}
    if data['school_year'] != '2026-2027':
        issues.append('Année scolaire incorrecte.')
    if len(programs) != len(data['programs']):
        issues.append('Identifiants de programmes dupliqués.')
    expected = {(g, 'commun') for g in ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e']}
    expected |= {('2nde', p) for p in ['generale-technologique', 'professionnelle']}
    expected |= {(g, p) for g in ['1re', 'Terminale'] for p in ['generale', 'technologique', 'professionnelle']}
    actual = {(s['grade'], s['pathway']) for s in scopes}
    if actual != expected or len(scopes) != len(expected) or len({s['id'] for s in scopes}) != len(scopes):
        issues.append('Couverture des classes et voies incorrecte.')
    for scope in scopes:
        label = scope['id']
        if scope['subject_inventory_status'] != 'verified' or not scope['subjects']:
            issues.append(f'{label} : matières et variantes non vérifiées.')
        if scope.get('missing_coverage'):
            issues.append(f'{label} : couverture déclarée incomplète.')
        for subject in scope['subjects']:
            matches = [p for p in programs.values() if p.get('scope_id') == label and p.get('subject_id') == subject['id']]
            if not matches:
                issues.append(f"{label}/{subject['id']} : programme absent.")
    for program in programs.values():
        label = program['id']
        try:
            valid_reference(program, records)
            scope = next(s for s in scopes if s['id'] == program['scope_id'])
            require(program['subject_id'] in [s['id'] for s in scope['subjects']])
            require(program['teaching_type'] in {'commun', 'specialite', 'option', 'professionnel'})
            if scope['pathway'] == 'technologique' and program['teaching_type'] == 'specialite':
                require(program['variant'])
        except (KeyError, ValueError, StopIteration, TypeError):
            issues.append(f'{label} : références, applicabilité ou structure non validées.')
        if program.get('coverage_status') != 'complete' or program['review_status'] != 'verified' or not program['domains']:
            issues.append(f'{label} : programme pédagogique incomplet.')
        for domain in program['domains']:
            try:
                require(domain['id'] and domain['title'] and domain['source_locator'] and domain['chapters'])
                for chapter in domain['chapters']:
                    require(chapter['id'] and chapter['title'] and chapter['notions'] and chapter['knowledge'] and chapter['skills'] and chapter['source_locator'])
                    for skill in chapter['skills']:
                        require(skill['id'] and skill['text'] and skill['source_locator'])
                    for kind in sorted(KINDS):
                        require(any(c.get('program_id') == label and c.get('program_version') == program['version'] and c.get('kind') == kind and chapter['id'] in c.get('chapter_ids', []) and c.get('review_status') == 'verified' for c in data['contents']))
            except (KeyError, TypeError, ValueError):
                issues.append(f'{label} : domaine, compétences ou formats pédagogiques incomplets.')
    content_ids = [c['id'] for c in data['contents']]
    if len(content_ids) != len(set(content_ids)):
        issues.append('Identifiants de contenus dupliqués.')
    for content in data['contents']:
        try:
            program = programs[content['program_id']]
            valid_reference(program, records)
            validate_lesson(content, program)
        except (KeyError, TypeError, ValueError, OSError):
            issues.append(f"{content.get('id', '?')} : contenu ou version de référence non validés.")
    if not programs or not data['contents']:
        issues.append('Aucun corpus pédagogique officiel vérifié intégré.')
    for transition in data.get('transitions', []):
        try:
            require(transition['review_status'] == 'verified')
            require(records[transition['source_id']]['url'] == transition['source_url'] and transition['source_locator'])
            for stage in transition['stages']:
                date.fromisoformat(stage['effective_from'])
                require(set(stage['scopes']) <= {s['id'] for s in scopes})
        except (KeyError, ValueError, TypeError):
            issues.append(f"{transition.get('id', '?')} : calendrier non validé.")
    return issues


def report(data, issues):
    return dict(school_year=data['school_year'],status='incomplete' if issues else 'structural_checks_passed',scopes=len(data['scopes']),references=len(data['programs']),references_with_checked_dates=sum(p.get('reference_status') == 'verified' for p in data['programs']),complete_programs=sum(p.get('coverage_status') == 'complete' for p in data['programs']),lessons=len({c['asset_path'] for c in data['contents']}),content_formats=len(data['contents']),issue_count=len(issues),issues_by_type=dict(Counter(i.split(' : ',1)[-1] for i in issues)),issues=issues)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--require-complete', action='store_true')
    parser.add_argument('--details', action='store_true')
    parser.add_argument('--json', action='store_true')
    args = parser.parse_args()
    data = json.loads((ROOT / 'curriculum/catalogue.json').read_text())
    issues = audit(data)
    result = report(data, issues)
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"Année {data['school_year']} — {result['scopes']} périmètres, {result['references']} références, {result['lessons']} chapitres avec activités")
        print(f"{result['references_with_checked_dates']} références avec dates vérifiées ; {result['complete_programs']} programmes entièrement intégrés.")
        for kind, count in result['issues_by_type'].items():
            print(f'- {count} : {kind}')
        if args.details:
            for issue in issues:
                print('- ' + issue)
        print('INTÉGRATION INCOMPLÈTE' if issues else 'Contrôles structurels réussis ; revue pédagogique complète toujours nécessaire.')
    raise SystemExit(1 if issues and args.require_complete else 0)
