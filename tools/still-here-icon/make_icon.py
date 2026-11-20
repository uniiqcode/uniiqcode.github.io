"""Still Here のアイコン(docs/still-here/icon.svg)を作る。
使い方: python3 tools/still-here-icon/make_icon.py → node tools/still-here-icon/export.js .
"""
import re
import os
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..')
N=os.path.join(ROOT,'still-here','numerals')+'/'
def digit(ch):
    t=open(f'{N}TN-{ch}-v01.svg').read()
    return float(re.search(r'viewBox="0 0 ([\d.]+)',t).group(1)), re.search(r'<g[\s\S]*</g>',t).group(0)
def twelve(cx,cy,h,color,gap=5):
    sc=h/1600; ws=[digit(c) for c in '12']; tot=sum(w for w,_ in ws)*sc+gap; x=cx-tot/2; out=''
    for w,g in ws:
        out+=f'<g transform="translate({x:.1f},{cy-h/2:.1f}) scale({sc:.5f})" color="{color}" fill="{color}">{g}</g>'; x+=w*sc+gap
    return out
# Gemini 案の形(1024px)を 512px に写し、全体を中央に向けて少し縮める(丸く切られても欠けないように)
def icon(bg,ink,sw=7,k=0.92):
    def T(v,c=256): return c+(v-c)*k
    def R(x,y,w,h,rx,w2=None): return f'<rect x="{T(x):.1f}" y="{T(y):.1f}" width="{w*k:.1f}" height="{h*k:.1f}" rx="{rx*k:.1f}" fill="none" stroke="{ink}" stroke-width="{w2 or sw}"/>'
    def C(cx,cy,r,w): return f'<circle cx="{T(cx):.1f}" cy="{T(cy):.1f}" r="{r*k:.1f}" fill="none" stroke="{ink}" stroke-width="{w}"/>'
    g=''
    for x in (60,358):  # 左右のスピーカー
        g+=R(x,268,94,138,14)+C(x+47,318,33,sw)+C(x+47,378,8,sw*0.8)
    g+=R(176,106,160,282,26)          # スマホの外枠
    g+=R(192,124,128,246,13,sw*0.55)  # 画面(内枠)。外枠より細い線で、すき間を広めに
    g+=R(164,388,184,18,5)            # 平らな台
    g+=twelve(T(256),T(244),104*k,ink)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="{bg}"/>{g}</svg>'
DAY=('#F5F3EE','#2B2D30'); NIGHT=('#12161A','#ECE8DF')
# 採用したのは昼の色・線の太さ 8.5(G2案)
open(os.path.join(ROOT,'docs','still-here','icon.svg'),'w').write(icon(*DAY,sw=8.5))
