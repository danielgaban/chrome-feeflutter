function handlerChangeText(newText, element) {
  element.textContent = newText;
}

function createTableRows(regularPrice, usdPrice) {
  const customBytes = [125, 200, 500] 
  const attributes = ['bytes', 'sat', 'dolar']
  const table = document.querySelector('table')
  const body = table?.querySelector('tbody')
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

async function handleRequest() {
    try {
      const {fee} = await chrome.storage.local.get('fee')
      const {regular, priority, limits, err} = fee
      if (err) throw new Error('failed to get storage')
      const res = await fetch('https://blockchain.info/ticker')
      const { USD } = await res.json()
      handlerChangeText(regular, document.querySelector('#regularPrice'))
      handlerChangeText(priority, document.querySelector('#priorityPrice'))
      createTableRows(regular, USD.last)
      console.log(regular, priority)
    } catch (err) {
      console.log(err)
    }
}
(async () => {
  await handleRequest()
})()
