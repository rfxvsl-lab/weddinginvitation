import asyncio, sys
from pathlib import Path
from playwright.async_api import async_playwright
from PIL import Image
async def main(prefix, ids, out):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await (await b.new_context(viewport={'width':390,'height':844}, device_scale_factor=1)).new_page()
        ims=[]
        for i in ids:
            await pg.goto('file://'+str(Path(f'.artlab/{prefix}-{i}.html').resolve()))
            await pg.wait_for_timeout(700)
            path=f'.artlab/{prefix}-{i}.png'
            await pg.screenshot(path=path); ims.append(Image.open(path))
        await b.close()
    cols=min(5,len(ims)); rows=(len(ims)+cols-1)//cols
    s=Image.new('RGB',(cols*390,rows*844),'white')
    for k,im in enumerate(ims): s.paste(im,((k%cols)*390,(k//cols)*844))
    s.save(out)
asyncio.run(main(sys.argv[1], sys.argv[2].split(','), sys.argv[3]))
