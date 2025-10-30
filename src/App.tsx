import './App.css'
import Papa from 'papaparse'
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis} from 'recharts';

//formatting of each data entry
type SalesData = {
  date: string
  product: string
  quantity: number
  revenue: number
}

function App() {
  const [data, setData] = useState<SalesData[]>([]) //parsed csv data as array of salesdata objects
  const [invalid, setInvalid] = useState(false) // boolean flag for validity
  
  //csv file parsing, using papaparse

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>): void {
    //retrieves first file user selected
    const file = event.target.files?.[0]
    //uses papaparse on the given file
    if (file) {
      Papa.parse(file, {
        //uses first row (date, product, quantity, and revenue) as headers
        header: true,
        //interprets datatype of each cell from file data
        dynamicTyping: true,
        //skips any empty lines
        skipEmptyLines: true,
        //data handling
        complete: (results) => {
          //initially store each row as 'any' to avoid type errors
          const parsedData = results.data as any[]
          //local var to check if results is valid
          let isValid = true
          // header format check
          isValid=parsedData.every(row => 
            'date' in row && 'product' in row && 'quantity' in row && 'revenue' in row
          )
          //type checking for each entry
          for (let i = 0; i < parsedData.length; i++) {
            const row = parsedData[i]
            
            if (typeof row.date !== 'string') {
              isValid=false
              break
            }

            if (typeof row.product !== 'string') {
              isValid=false
              break
            }
            //assumes quantity cant be negative
            if (!Number.isInteger(row.quantity) || !(row.quantity >= 0)) {
              isValid=false
              break
            }

            if (typeof row.revenue !== 'number') {
              isValid=false
              break
            }
          }
          //case where file was incorrect, clears data state variable
          if (!isValid) {
          setInvalid(true)
          setData([])
          return
        }
        //we know parsedData is of form salesdata
        //so we can now have it stored as such
        setInvalid(false)
        setData(parsedData as SalesData[])
        }
      })
    }
  }

  //display data using table for readability
  function displayData() {
    return (
      <div>
        <table className = "table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {/*creates table row for each item in data, and table data for each cell*/}
            {data.map((row, i) => (
              <tr key={i}>
                <td>{row.date}</td>
                <td>{row.product}</td>
                <td>{row.quantity}</td>
                <td>${row.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  //displays required statistics
  function displayInfo() {
    //sums revenue and quantity field of each row
    const totalRevenue = data.reduce((sum, cur) => sum + cur.revenue, 0);
    const totalQuantity = data.reduce((sum, cur) => sum + cur.quantity, 0);
    //number of transactions is simply length of data
    const numTransactions = data.length;

    return (
      <div className="extras">
        <p>Total Revenue: ${totalRevenue}</p>
        <p>Total Quantity Sold: {totalQuantity}</p>
        <p>Number of Transactions: {numTransactions}</p>
      </div>
    )
  }

  function displayRevenues() {
    //dictionary with product as key and revenue as value
    const revenueByProduct: { [product: string]: number } = {}
    //if new product, initializes revenue value to 0
    //adds the revenue of each row to the product for that row
    for (const row of data) {
      if (!revenueByProduct[row.product]) {
        revenueByProduct[row.product] = 0
      }
      revenueByProduct[row.product] += row.revenue
    }
    //create array of product/revenue objects to use for chart
    const elements = []
    for (const product in revenueByProduct) {
      elements.push({ product: product, revenue: revenueByProduct[product] })
    }

    return (
      <div className="revenues">
        <RevenueChart data={elements} />
      </div>
    )
  }
  //takes the revenue/product objects and displays them using recharts
  function RevenueChart({ data }: { data: { product: string; revenue: number }[] }) {
  return (
    <BarChart width={1000} height={500} data={data}>
      <XAxis dataKey="product" stroke="white"/>
      <YAxis tickFormatter={v => `$${v}`} stroke="white"/>
      <Bar dataKey="revenue" fill="gold" />
    </BarChart>
  )
}
  function displayQuantities() {
    //identical logic to the above displayrevenues
    //instead for dictionary with key product and value quantity
    const quantityByProduct: { [product: string]: number } = {}

    //again, remaining code is largely identical, just mapped to quantities
    for (const row of data) {
      if (!quantityByProduct[row.product]) {
        quantityByProduct[row.product] = 0
      }
      quantityByProduct[row.product] += row.quantity
    }

    const elements =[]

    for (const product in quantityByProduct) {
      elements.push({ product: product, quantity: quantityByProduct[product] })
    }

    return (
      <div className="quantities">
        <QuantityChart data={elements} />
      </div>
    )
  }
  //takes the quantities/products and displays them with rechart
  function QuantityChart({ data }: { data: { product: string; quantity: number }[] }) {
    return (
      <BarChart width={1000} height={500} data={data}>
        <XAxis dataKey="product" stroke="white"/>
        <YAxis stroke="white"/>
        <Bar dataKey="quantity" fill="gold" />
      </BarChart>
    )
  }

  return (
    <>
      <h1>Arpari-Parse</h1>
      <p>By William Roche</p>
      <div className="card">

        {/*invalid file inputted case*/}
        {invalid && (
          <div className="error">
            Sorry, this file format is invalid. Make sure it is a CSV file with columns: date, product, quantity, revenue.
          </div>
        )}
      </div>

      {/*valid file given case*/}
      {!invalid && data.length > 0 && (
        <div>
          <h2>Complete Data:</h2>
          {displayData()}
          <h2>Statistics:</h2>
          {displayInfo()}
          <h2>Revenue by Product:</h2>
          {displayRevenues()}
          <h2>Quantity sold by Product:</h2>
          {displayQuantities()}
        </div>
      )}

      {/*input & file handling*/}
      <input type="file" accept=".csv" onChange={handleFileSelect} className="selector" />

      {/*default message when file upload is valid or no file has been uploaded yet*/}
      {!invalid && (
          <div>
            Please upload a CSV file for new data!
          </div>
        )}
    </>
  )
}

export default App
