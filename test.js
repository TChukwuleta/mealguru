const https = require('https')
const params = JSON.stringify({
  "type":"nuban",
  "name" : "John Doe",
  "account_number": "0001234567",
  "bank_code": "058",
  "currency": "NGN"
})
const options = {
  hostname: 'api.paystack.co',
  port: 443,
  path: '/transferrecipient',
  method: 'POST',
  headers: {
    authorization: 'Bearer sk_test_2b8231a27437c795eb57e6c148162c343765d51c',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}
const req = https.request(options, res => {
  let data = ''
  res.on('data', (chunk) => {
    data += chunk
  });
  res.on('end', () => { 
    console.log(JSON.parse(data)) 
  })
}).on('error', error => { 
  console.error(error)
})
req.write(params)
req.end()

// const axios = require('axios')
// const url = require('url')
// const createCustomer = async () => {
//   const params = JSON.stringify({
//     "type":"nuban",
//     "name" : "John Doe",
//     "account_number": "0001234567",
//     "bank_code": "058", 
//     "currency": "NGN"
//   })
//   console.log("First stop")
//   console.log(process.env.PAYSTACK_SK)
//   const { data } = await axios.post(`${process.env.PAYSTACK_URL}/transferrecipient`,params, {
//       headers: {
//           'content-type': 'application/x-www-form-urlencoded',
//           'authorization': `Bearer ${process.env.PAYSTACK_SK}`
//       }
//   });
//   console.log(data.data) 
// }

// createCustomer()