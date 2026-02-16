import sys

file_path = '/Users/aniketmarwadi/Aniket/nexus-eval/frontend/src/app/agent-eval/test-evaluations/page.tsx'

with open(file_path, 'r') as f:
    lines = f.readlines()

new_stats_code = [
    '    const stats = result ? {\n',
    '        accuracy: result.aggregate?.accuracy || 0,\n',
    '        completeness: result.aggregate?.completeness || 0,\n',
    '        hallucination: result.aggregate?.hallucination || 0,\n',
    '        consistency: result.aggregate?.consistency || 0,\n',
    '        safety: result.aggregate?.safety || 1.0,\n',
    '        rqs: result.aggregate?.rqs || 0,\n',
    '        n_queries: result.aggregate?.n_queries || 0,\n',
    '        status: (result.aggregate?.accuracy || 0) > 0.5 ? "PASS" : "FAIL"\n',
    '    } : null;\n'
]

# Lines 1441 to 1486 (1-indexed) are indices 1440 to 1485
lines[1440:1486] = new_stats_code

with open(file_path, 'w') as f:
    f.writelines(lines)
