import re, glob, sys

files = glob.glob('api/**/*.ts', recursive=True) + ['vite.config.ts']
pattern = re.compile(r'(from\s+["\'])(\.\.?/[^"\']+?)(["\'])')

changed_files = []
for f in files:
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    def repl(m):
        prefix, path, suffix = m.groups()
        if re.search(r'\.(js|json|mjs|cjs|css|ts)$', path):
            return m.group(0)
        return f'{prefix}{path}.js{suffix}'
    new_content = pattern.sub(repl, content)
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(new_content)
        changed_files.append(f)

print(f"Changed {len(changed_files)} files:")
for f in changed_files:
    print(" -", f)
