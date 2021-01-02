// TranslatorMode.run()
// Make sure to setTimeout when running at initialization

const TranslatorMode = (() => {

const [container, chatbox] = document.querySelectorAll('#input');
const defaultt = false; // FIXME Change to false before pr
let observer = null;
const postMessage = window.parent.postMessage;

async function init() {
  setupDefaultTranslatorMode();
  if (!is_ytc()) {
    ltl_run();
  }
}

async function run() {
  if (is_ytc()) {
    await ytc_run();
  }
}

async function ytc_run() {
  if (observer) {
    observer.disconnect();
  }
  observer = createObserver();
  observeYTC(observer);
}

function is_ytc() {
  return window.location.href.startsWith('https://www.youtube.com/live_chat')
}

async function enabled() {
  return await getStorage('translatorMode');
}

function disable() {
  console.log("Clearing text from ytc");
  clearTextFromYTC();
  if (observer) {
    observer.disconnect();
  }
}

function reload() {
  clearTextFromYTC();
  run();
}

function ltl_run() {
  TranslatorMode.disable = () => {
    console.log("POSTING MESSAGE");
    postMessage({ type: 'translatorMode', fn: 'disable' });
  };
  TranslatorMode.reload = () => {
    postMessage({ type: 'translatorMode', fn: 'reload' });
  };
}

function clearTextFromYTC() {
  if (chatbox.textContent) {
    chatbox.textContent = '';
    container.removeAttribute('has-text');
  }
}

async function checkAndAddTLTag() {
  if (chatbox.textContent === '' && await enabled()) {
    addTextToYTC('[en] ');
  }
}

function addTextToYTC(text) {
  container.setAttribute('has-text', '');
  chatbox.textContent = text;
}

function createObserver() {
  let observer = new MutationObserver((mutations, _observer) => {
    mutations.forEach(observerCallback);
  });
  return observer;
}

function observeYTC(observer) {
  observer.observe(container, { attributes: true });
}

async function observerCallback(mutation) {
  const { attributeName } = mutation;
  const focused = container.getAttribute('focused');
  if (attributeName === 'focused' && focused === '') {
    await checkAndAddTLTag();
  }
}

return { defaultt, disable, enabled, init, reload, run };
})();

TranslatorMode.init();
