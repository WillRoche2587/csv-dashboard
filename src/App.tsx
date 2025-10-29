import './App.css'
import Papa from 'papaparse'
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis} from 'recharts';


//typing, assumes csv file is formatted properly
type SalesData = {
  date: string
  product: string
  quantity: number
  revenue: number
}

function App() {
  const [data, setData] = useState<SalesData[]>([])
  const [invalid, setInvalid] = useState(false) // just a boolean flag
  
  //csv file parsing, using papaparse

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    //add check for formatting validity
    if (file) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data as any[]
          let isValid = true
          // Basic format check
          isValid=parsedData.every(row => 
            'date' in row && 'product' in row && 'quantity' in row && 'revenue' in row
          )
          //type checking for each entry (specifics later?)
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

            if (!Number.isInteger(row.quantity) || !(row.quantity >= 0)) {
              isValid=false
              break
            }

            if (typeof row.revenue !== 'number') {
              isValid=false
              break
            }
          }

          if (!isValid) {
          setInvalid(true)
          setData([]) // clear any previously loaded data
          return
        }

        setInvalid(false)
        setData(parsedData as SalesData[])
        }
      })
    }
  }

  //display data using table for readability

  function displayData() {
    return (
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{row.date}</td>
              <td>{row.product}</td>
              <td>{row.quantity}</td>
              <td>{row.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  
  function displayInfo() {
    const totalRevenue = data.reduce((sum, cur) => sum + cur.revenue, 0);
    const totalQuantity = data.reduce((sum, cur) => sum + cur.quantity, 0);
    const numTransactions = data.length;

    return (
      <div className="card">
        <p>Total Revenue: ${totalRevenue}</p>
        <p>Total Quantity Sold: {totalQuantity}</p>
        <p>Number of Transactions: {numTransactions}</p>
      </div>
    )
  }

  function displayRevenues() {
    const revenueByProduct: { [product: string]: number } = {}

    for (const row of data) {
      if (!revenueByProduct[row.product]) {
        revenueByProduct[row.product] = 0
      }
      revenueByProduct[row.product] += row.revenue
    }
    const elements = []
    for (const product in revenueByProduct) {
      elements.push({ product: product, revenue: revenueByProduct[product] })
    }

    return (
      <div className="card">
        <RevenueChart data={elements} />
      </div>
    )
  }
  function RevenueChart({ data }: { data: { product: string; revenue: number }[] }) {
  return (
    <BarChart width={500} height={300} data={data}>
      <XAxis dataKey="product" />
      <YAxis tickFormatter={v => `$${v}`}/>
      <Bar dataKey="revenue" fill="green" />
    </BarChart>
  )
}

  return (
    <>
      <h1>Arpari Parse!</h1>
      <div className="card">
        
        {invalid && (
          <div className="error">
            File format is invalid. Make sure it has columns: date, product, quantity, revenue.
          </div>
        )}
      </div>
      {/* will only show when data is populated */}
      {data.length > 0 && (
        <div>
          {displayData()}
          <p>Additional Information:</p>
          {displayInfo()}
          <p>Revenue by Product:</p>
          {displayRevenues()}
        </div>
      )}
      <input type="file" accept=".csv" onChange={handleFileSelect} />
      {!invalid && (
          <div>
            Please upload a CSV file for new data!
          </div>
        )}
    </>
  )
}

export default App
