from PIL import Image
import os

path = os.path.join(os.getcwd(), '..', 'public', 'farmeze-icon.png')
path = os.path.abspath(path)
img = Image.open(path).convert('RGBA')
pixels = [p for p in img.getdata() if p[3] > 0]
from collections import Counter
cnt = Counter(pixels)
print('most common:', cnt.most_common(10))
valid = [p for p in pixels if p[0] < 240 or p[1] < 240 or p[2] < 240]
if not valid:
    valid = pixels
avg = tuple(sum(c)//len(valid) for c in zip(*valid))
print('avg', avg)
