t=open('static/app.js','r',encoding='utf-8').read()
d=0
for c in t:
    if c=='{': d+=1
    elif c=='}': d-=1
exit(0 if d==0 else 1)
