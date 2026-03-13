import os

def read_file(path):
    print(f"--- {path} ---")
    if not os.path.exists(path):
        print("File not found")
        return
    try:
        # Try different encodings
        for enc in ['utf-8', 'utf-16', 'utf-16le', 'latin1']:
            try:
                with open(path, 'r', encoding=enc) as f:
                    content = f.read()
                    print(content)
                    return
            except UnicodeDecodeError:
                continue
        print("Could not decode file with any common encoding")
    except Exception as e:
        print(f"Error reading file: {e}")

read_file('test_debug.txt')
read_file('test_results.txt')
read_file('test_output.txt')
