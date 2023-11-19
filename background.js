async function getFee() {
  try {
    let res = await fetch('https://api.blockchain.info/mempool/fees')
    const {regular, priority, limits} = await res.json()
    chrome.storage.local.set({fee: {regular, priority, limits}})
    return {text: regular.toString(), color: mapValueToColor(regular)}
  } catch (err) {
    console.log(err)
    chrome.storage.local.set({fee: {err}})
    return {text: 'ERR', color: "#000000"}
  }
}
async function setBadge() {
  const {text, color} = await getFee()
  await chrome.action.setBadgeText({
    text
  });
  await chrome.action.setBadgeBackgroundColor({
    color
  })
}

function mapValueToColor(value) {
    const minValue = 0
    const maxValue = 200
    // Ensure the value is within the specified range
    value = Math.min(Math.max(value, minValue), maxValue);

    // Normalize the value to a percentage within the range
    var percentage = (value - minValue) / (maxValue - minValue);

    // Interpolate between green (0, 255, 0) and red (255, 0, 0)
    var green = Math.round((1 - percentage) * 255);
    var red = Math.round(percentage * 255);

    return [red, green, 0, 1];
}


setBadge()
setInterval(async () => {
  setBadge()
}, 1000 * 10) //seconds
