async function handleRequest() {
    try {
      const {fee} = await chrome.storage.local.get('fee')
      const {regular, priority, limits, err} = fee
      if (err) throw new Error('failed to get storage')
      const res = await fetch('https://blockchain.info/ticker')
      const { USD } = await res.json()
      document.querySelector('#regularPrice').textContent = regular
      document.querySelector('#priorityPrice').textContent = priority
      document.querySelector('#transactionPrice').textContent = regular * 150
      document.querySelector('#transactionDolar').textContent = (regular * 150 * USD.last / 100000000).toFixed(2)
      console.log(regular, priority)
    } catch (err) {
      console.log(err)
    }
}
(async () => {
  await handleRequest()
})()
