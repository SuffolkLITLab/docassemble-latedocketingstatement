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
