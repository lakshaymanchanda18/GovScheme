"""
Phase 3: Validate the cleaned dataset.
Ensures there are no fake/lorem ipsum schemes, no duplicate names, and checks for required fields.
"""
import os
import json
import sys

FINAL_JSON = os.path.join(os.path.dirname(__file__), '..', 'final', 'schemes_final.json')

def run_validation():
    print('=' * 60)
    print('  Dataset Validation')
    print('=' * 60)

    if not os.path.exists(FINAL_JSON):
        print(f'[ERROR] File not found: {FINAL_JSON}')
        sys.exit(1)

    with open(FINAL_JSON, 'r', encoding='utf-8') as f:
        schemes = json.load(f)

    print(f'[INFO] Validating {len(schemes)} schemes...\n')

    errors = []
    warnings = []

    names = set()
    lorem_markers = ['lorem ipsum', 'dolor sit', 'campana clamo', 'cinis vomito']

    for i, s in enumerate(schemes):
        name = s.get('name', '').strip()
        desc = s.get('description', '').strip()

        if not name:
            errors.append(f'Scheme index {i} is missing a name.')
        
        if name.lower() in names:
            errors.append(f'Duplicate scheme name found: "{name}"')
        names.add(name.lower())

        if len(desc) < 20:
            warnings.append(f'Scheme "{name}" has a very short description ({len(desc)} chars).')

        text_to_check = f"{name} {desc}".lower()
        if any(marker in text_to_check for marker in lorem_markers):
            errors.append(f'Fake/placeholder text found in scheme: "{name}"')

        if not s.get('category'):
            errors.append(f'Scheme "{name}" is missing a category.')

    if errors:
        print(f'[FAILED] {len(errors)} errors found:')
        for e in errors[:20]:
            print(f'  - {e}')
        if len(errors) > 20:
            print(f'  ... and {len(errors) - 20} more.')
        sys.exit(1)
    
    print(f'[SUCCESS] Validation passed! 0 errors.')
    if warnings:
        print(f'  ({len(warnings)} warnings about short descriptions)')

if __name__ == '__main__':
    run_validation()
