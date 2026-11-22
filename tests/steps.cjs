const path = require('path');
const fs = require('fs');
const assert = require('assert');
const { execFileSync } = require('child_process');
const kiln = process.env.ALKILN_PATH || path.join(process.env.HOME, 'ALKiln');
const { When, Then } = require(path.join(kiln, 'node_modules/@cucumber/cucumber'));
const scope = require(path.join(kiln, 'lib/scope'));

When('I open the review action {string}', { timeout: -1 }, async (action) => {
  const found = await scope.page.evaluate((wanted) => {
    const link = [...document.querySelectorAll('a[href]')].find((a) => {
      try {
        const encoded = a.getAttribute('data-action') || new URL(a.href).searchParams.get('action');
        return encoded && atob(encoded).includes('"' + wanted + '"');
      } catch { return false; }
    });
    if (!link) return false;
    link.id = 'late-motion-review-action';
    return true;
  }, action);
  assert(found, `No review action for ${action}`);
  await scope.tapSelectorToNavigate(scope, '#late-motion-review-action', 1000);
});

Then('there is no download named {string}', async (filename) => {
  const found = await scope.page.evaluate((name) => [...document.querySelectorAll('a[href]')].some(a =>
    (a.getAttribute('download') || '').includes(name) || decodeURIComponent(a.href).includes(name)
  ), filename);
  assert(!found, `Removed file remains available: ${filename}`);
});

When('I preserve downloaded file {string} as {string}', async (filename, archived) => {
  fs.renameSync(path.join(scope.paths.scenario, filename), path.join(scope.paths.scenario, archived));
});

Then('the downloaded package has one fewer page than {string}', async (baseline) => {
  function pages(name) {
    const info = execFileSync('pdfinfo', [path.join(scope.paths.scenario, name)], {encoding:'utf8'});
    return Number(info.match(/^Pages:\s+(\d+)/m)[1]);
  }
  assert.equal(pages('late_appeal_package.pdf'), pages(baseline) - 1);
});

When('I resume the answer review', { timeout: 120000 }, async () => {
  await scope.page.evaluate(() => document.querySelector('#da-continue-button').click());
  await scope.page.waitForFunction(() => document.body.innerText.includes('Your motion is ready to download'), {timeout: 110000});
});

// Docassemble review/Resume can change the screen without changing its URL.
// Preserve ALKiln's error handlers and also recognize a changed question ID.
scope.wait_until_continued=async (state,{url='',id='',post_nav_handlers=null})=>{
 const handlers=post_nav_handlers ?? [state.throw_on_system_error,state.throw_on_invalid_answers,state.throw_on_non_navigation_timeout,state.throw_on_non_navigation_catchall];
 state.throw_if_missing_required_post_nav_handlers(state,{handlers});
 const deadline=Date.now()+state.timeout;
 let error_data,navigated=false,timed_out=false;
 while(true){
  let current;
  try {
   error_data=await state.checkForErrors(state);
   current=await state.get_page_id(state);
  } catch(error) {
   if (!/Execution context was destroyed|Cannot find context/.test(error.message)) throw error;
   if(Date.now()>=deadline) throw error;
   await new Promise(resolve=>setTimeout(resolve,100));
   continue;
  }
  navigated=state.page.url()!==url || (current && id && current!==id);
  if(navigated || !error_data.ok)break;
  if(Date.now()>=deadline){timed_out=true;break;}
  await new Promise(resolve=>setTimeout(resolve,50));
 }
 state.navigated=navigated;
 await new Promise(resolve=>setTimeout(resolve,350));
 await state.page.waitForSelector("#daquestion");
 await state.log_and_update_if_new_page_id(state);
 if(!error_data.ok || timed_out){
  for(const handler of handlers)await handler(state,{id,error_data,timed_out});
 }
 return {error_data,navigated};
};
require(path.join(kiln,'node_modules/@cucumber/cucumber')).setDefaultTimeout(90000);

// A full-page POST can destroy a context while ALKiln reads validation/visibility.
// Retry only these read-only probes; never retry a click or field mutation.
for (const name of ['checkForErrors','get_page_id','examinePageID','waitForShowIf','log_and_update_if_new_page_id']) {
 const original=scope[name];
 if(!original)continue;
 scope[name]=async(...args)=>{
  for(let attempt=0;;attempt++){
   try{return await original(...args);}
   catch(error){
    if(attempt>=20 || !/Execution context was destroyed|Cannot find context|detached Frame|Node with given id does not belong/.test(error.message))throw error;
    await new Promise(resolve=>setTimeout(resolve,100));
   }
  }
 };
}

// Await the POST's new document before inspecting the next screen. Existing
// validation markers can otherwise win ALKiln's navigation race prematurely.
scope.tapElementAndNavigate=async(state,{elem,post_nav_handlers=null})=>{
 await state.guard_against_missing_tap_element(state,{elem});
 const id=await state.get_page_id(state);
 const url=state.page.url();
 const navigation=state.page.waitForNavigation({waitUntil:'networkidle0',timeout:15000}).catch(error=>{
  if(error.name==='TimeoutError')return null;
  throw error;
 });
 await elem.evaluate(el=>el.click());
 await navigation;
 const result=await state.wait_until_continued(state,{url,id,post_nav_handlers});
 await state.afterStep(state,{navigated:result.navigated,waitForTimeout:200});
 return result.error_data;
};
