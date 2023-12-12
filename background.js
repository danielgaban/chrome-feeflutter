const LAST_PRICES_MAX_lENGTH = 2880;
let lastFees = Array()

async function getFee() {
  try {
    let res = await fetch('https://api.blockchain.info/mempool/fees')
    const fee = await res.json()
    return fee;
  } catch (err) {
    console.log(err)
    return 'ERR'
  }
}

async function setBadge(fee) {
  await chrome.action.setBadgeText({
    text: fee['regular'].toString()
  });
  await chrome.action.setBadgeBackgroundColor({
    color: mapValueToColor(fee['regular'])
  })
}

/**
 * @param {(Number | 'ERR')} value 
 */
function mapValueToColor(value) {
    if (value === 'ERR') return [0, 0, 0, 1]
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

async function handler() {
  let fee = await getFee();
  fee['timestamp'] = new Date().toLocaleTimeString()
  await setBadge(fee)
  if (lastFees.length > LAST_PRICES_MAX_lENGTH) lastFees.pop()
  lastFees.push({...fee})
  await chrome.storage.local.set({lastFees})
  await chrome.runtime.sendMessage("updated");
}

// async function main() {
//   await handler()
//   setInterval(async () => {
//     await handler()
//   }, 1000 * 29) //seconds
// }


// chrome.runtime.onInstalled.addListener(main)

// chrome.runtime.onStartup.addListener(main)

const ALARM_NAME = 'fee';
// Check if alarm exists to avoid resetting the timer.
// The alarm might be removed when the browser session restarts.
async function createAlarm() {
  const alarm = await chrome.alarms.get(ALARM_NAME);
  if (typeof alarm === 'undefined') {
    chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: 1
    });
    handler();
  }
}
createAlarm();

chrome.alarms.onAlarm.addListener(handler)
