const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const root = path.resolve(__dirname, '../site');
const prefix = '/quiet-spaces/';
const evidence = path.resolve(__dirname, '../browser-evidence');
fs.mkdirSync(evidence, {recursive:true});
const server = http.createServer((req,res)=>{
  const url = new URL(req.url,'http://localhost');
  const name = url.pathname.slice(prefix.length) + (url.pathname.endsWith('/')?'index.html':'');
  const file = path.resolve(root, name);
  if (!url.pathname.startsWith(prefix) || !file.startsWith(root + path.sep) || !fs.existsSync(file)) {
    res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});
    return res.end(fs.readFileSync(path.join(root,'404.html')));
  }
  res.setHeader('Content-Type', ({'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json'})[path.extname(file)] ?? 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async()=>{
  if(!process.env.SITE_URL) await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base = process.env.SITE_URL ?? 'http://127.0.0.1:' + server.address().port + prefix;
  const browser = await chromium.launch({channel:process.env.BROWSER_CHANNEL || undefined,args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
  try {
    for (const mobile of [false,true]) {
      const context = await browser.newContext(mobile?{viewport:{width:375,height:667},isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:{width:1280,height:800}});
      const page = await context.newPage();
      const errors=[], requests=[];
      context.on('request', r=>requests.push([r.method(), r.url()]));
      page.on('pageerror',e=>errors.push(e.message));
      const suffix=mobile?'mobile':'desktop';
      const click=selector=>mobile?page.locator(selector).tap():page.locator(selector).click();
      const shot=name=>page.screenshot({path:path.join(evidence,name+'-'+suffix+'.png')});
      const width=()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
      const missing=await page.goto(base+'missing/deep'); assert.equal(missing.status(),404); await click('a[href="/quiet-spaces/"]'); await page.waitForURL(base);
      await page.goto(base); assert.equal(await page.locator('main a').count(),3); assert.ok(await width()); await shot('index');
      await Promise.all([page.waitForURL(base+'city-hermitage/'),click('a[href="./city-hermitage/"]')]); assert.ok(await width()); await shot('p1');
      await click('#sit'); for (const id of ['water','leaf','light','sit','plantBtn']) await click('#'+id);
      const share = page.waitForEvent('download'); await click('#share'); assert.match((await share).suggestedFilename(),/\.png$/);
      await page.reload(); await click('[data-page=trees]'); assert.match(await page.locator('#treeList').innerText(),/一棵树/);
      await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller));
      await context.setOffline(true); await page.reload(); await click('#sit');
      assert.equal(await page.locator('#sit').innerText(),'起身'); await context.setOffline(false); await page.reload();
      console.log('PASS '+suffix+' P1 core flow, download, persistence, actual Service Worker reload');
      const denied=await context.newPage();
      await denied.addInitScript(()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Denied','NotAllowedError')}});
      await denied.goto(base+'hearth/'); await denied.locator('#mic').click();
      await denied.getByText('未获麦克风权限，继续使用自评').waitFor();
      await denied.locator('[data-mode="紧"]').click(); assert.equal(await denied.locator('#heading').innerText(),'篝火'); await denied.close();
      for (const [mode,scene] of Object.entries({'紧':'篝火','乱':'远雷','钝':'潮汐','空':'雪夜'})) {
        await page.goto(base+'hearth/?sim=1');
        if(mode==='紧') await page.clock.install();
        await click('[data-mode="'+mode+'"]'); await click('#mute');
        assert.equal(await page.locator('#heading').innerText(),scene);
        await page.clock.fastForward(181000);
        assert.match(await page.locator('#heading').innerText(),/暗下去/);
      }
      await shot('p2'); assert.ok(await width());
      await page.goto(base+'hearth/'); await click('#mic');
      await page.locator('#mic[aria-pressed=true]').waitFor({timeout:5000});
      await click('#mic'); await page.locator('#mic[aria-pressed=false]').waitFor();
      await click('#privacy'); await click('#clear'); assert.match(await page.locator('#panelTitle').innerText(),/已清除/);
      assert.deepEqual(requests.filter(([method,url])=>/^https?:/.test(url) && (method!=='GET'||!url.startsWith(base))),[]);
      console.log('PASS '+suffix+' P2 four states, timer fast-forward, fake mic, privacy and network observation');
      const seasons=JSON.parse(fs.readFileSync(path.join(root,'season-garden/seasons.json'),'utf8'));
      for (const season of seasons) {
        await page.goto(base+'season-garden/?season='+season.id);
        assert.equal(await page.locator('#seasonName').innerText(),season.name);
        assert.ok(await width());
        await click('#act');
        if (season.id==='lidong') {await page.locator('#note').fill('仅在页面里的纸条');await click('#bury');assert.equal(await page.locator('#note').inputValue(),'');assert.ok(!await page.evaluate(()=>localStorage.getItem('season-garden-records').includes('仅在页面里的纸条')));}
        assert.notEqual(await page.locator('#verse').innerText(),'园子还在等今天的这一笔。');
        if (mobile) await shot('p4-'+season.id);
      }
      for (const id of ['export','year']) {
        const pending=page.waitForEvent('download'); await click('#'+id);
        const download=await pending; const data=fs.readFileSync(await download.path());
        assert.equal(data.readUInt32BE(16),1080);assert.equal(data.readUInt32BE(20),1920);
      }
      const popup=page.waitForEvent('popup');
      await click('#pdf');
      const print=await popup;
      await print.locator('section').last().waitFor(); assert.equal(await print.locator('section').count(),24);
      await print.pdf({path:path.join(evidence,'garden-'+suffix+'.pdf'),preferCSSPageSize:true,printBackground:true});
      await print.close();
      await page.reload();
      assert.notEqual(await page.locator('#verse').innerText(),'园子还在等今天的这一笔。');
      assert.deepEqual(errors,[]);
      console.log('PASS '+suffix+' P4 24 seasons, touch/click, note disposal, PNG exports, A4 PDF, persistence');
      await context.close();
    }
  } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
