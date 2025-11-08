import importlib
import importlib.util
import traceback
import sys
import os

# Make sure backend is on sys.path so tests import correctly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def run(module_name):
    # Try to load module by file path if package import fails
    try:
        mod = importlib.import_module(module_name)
    except Exception:
        # Convert module_name like 'tests.test_analytics' to path
        parts = module_name.split('.')
        path = os.path.join(os.path.dirname(__file__), *parts[1:]) + '.py'
        spec = importlib.util.spec_from_file_location(parts[-1], path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
    failures = 0
    for name in dir(mod):
        if name.startswith('test_') and callable(getattr(mod, name)):
            try:
                print(f'RUN {name}...', end='')
                getattr(mod, name)()
                print(' OK')
            except Exception:
                failures += 1
                print(' FAIL')
                traceback.print_exc()
    if failures:
        print(f"{failures} test(s) failed")
        raise SystemExit(1)
    else:
        print('All tests passed')

if __name__ == '__main__':
    run('tests.test_analytics')
