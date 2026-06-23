import os
for f in os.listdir('workflows'):
    if f.endswith('.json'):
        print(f)
