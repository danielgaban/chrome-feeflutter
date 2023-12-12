function handlerChangeText(newText, element) {
  element.textContent = newText;
}

function createTableRows(regularPrice, usdPrice) {
  const customBytes = [125, 200, 500] 
  const attributes = ['bytes', 'sat', 'dolar']
  const table = document.querySelector('table')
  const body = table?.querySelector('tbody')
  if (body) body.innerHTML = ""
  customBytes.forEach((bytes) => {
    const row = document.createElement('tr')
    attributes.forEach((attribute, i) => {
      const element = document.createElement('td')
      switch (attribute) {
        case 'bytes':
          element.textContent = bytes.toString();
          break
        case 'sat':
          element.textContent = (regularPrice * bytes).toString();
          break
        case 'dolar':
          element.textContent = "$ "+(regularPrice * bytes * usdPrice / 100000000).toFixed(2)
          break
      }
      row.appendChild(element)
    })
    body?.appendChild(row)
  });
}

async function createChartCandles() {
  const {lastFees} = await chrome.storage.local.get('lastFees')
  console.log(lastFees)
  const lastPrices = lastFees.map(fee => fee.regular)
  let minPriceFromData = Math.min(...lastPrices);
  const min = document.querySelector('#min')
  min.textContent = minPriceFromData.toString() + " sat"
  let maxPriceFromData = Math.max(...lastPrices);
  const max = document.querySelector('#max')
  max.textContent = maxPriceFromData.toString() + " sat"
  const timeframe = document.querySelector('#timeframe')
  timeframe.textContent = "last updated at " + lastFees[lastFees.length - 1].timestamp
  const container = document.querySelector('.priceHistory')
  if (container) container.innerHTML = ""
  lastPrices.forEach(fee => {
    const newElement = document.createElement('div');
    const calculateHeightPercent = ((fee - minPriceFromData) * 100) / (maxPriceFromData - minPriceFromData);
    newElement.style.height = (calculateHeightPercent > 1 ? calculateHeightPercent : 1) + "%"
    container?.appendChild(newElement);  
  })
}

async function handleRequest() {
    try {
      const {lastFees} = await chrome.storage.local.get('lastFees')
      const {regular, priority, limits, err} = lastFees[lastFees.length - 1]
      if (err) throw new Error('failed to get storage')
      const res = await fetch('https://blockchain.info/ticker')
      const { USD } = await res.json()
      handlerChangeText(regular, document.querySelector('#regularPrice'))
      handlerChangeText(priority, document.querySelector('#priorityPrice'))
      createTableRows(regular, USD.last)
    } catch (err) {
      console.log(err)
    }
}
(async () => {
  await handleRequest()
  await createChartCandles()
})()
chrome.runtime.onMessage.addListener(async () => {
  await handleRequest()
  await createChartCandles()
})
