async function handleRequest() {
  try {
    let res = await fetch('https://api.blockchain.info/mempool/fees')
    const {regular, priority, limits} = await res.json()
    chrome.storage.local.set({fee: {regular, priority, limits}})
    return regular.toString()
  } catch (err) {
    console.log(err)
    chrome.storage.local.set({fee: {err}})
    return "ERR"
  }
}
async function setBadge() {
  chrome.action.setBadgeText({
    text: await handleRequest(),
  });
}
chrome.runtime.onInstalled.addListener(async () => {
  setBadge()
  setInterval(async () => {
    setBadge()
  }, 1000 * 30) //seconds
});
