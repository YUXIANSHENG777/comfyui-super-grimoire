with open('static/index.html', 'r', encoding='utf-8') as f:
    c = f.read()
idx = c.find('modal-comfyui-help')
# find the closing </div></div>
end = c.find('<!--', idx + 100)
while end > 0 and c[end:end+4] == '<!--':
    nxt = c.find('<!--', end + 4)
    if nxt < 0:
        break
    # Check if between </div> and next comment
    section = c[end:nxt] if nxt > 0 else c[end:end+500]
    if '使用说明' in section[:200]:
        end = nxt
    else:
        break
print(repr(c[idx:idx+3000]))
