
import os

log_path = r'c:\Users\DIGI BYTES\Desktop\documind\tmp_api_errors.log'
output_path = r'c:\Users\DIGI BYTES\Desktop\documind\scratch/tail_errors.txt'

if os.path.exists(log_path):
    with open(log_path, 'r', encoding='utf-16le', errors='ignore') as f:
        lines = f.readlines()
        with open(output_path, 'w', encoding='utf-8') as out:
            out.writelines(lines[-100:])
    print(f"Successfully tailed 100 lines to {output_path}")
else:
    print("Log file not found")
