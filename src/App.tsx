import './App.css'
import Papa from 'papaparse'
import { useState } from 'react'

//typing, assumes csv file is formatted properly
type SalesData = {
  date: string
  product: string
  quantity: number
  revenue: number
}

function App() {
  const [data, setData] = useState<SalesData[]>([])
  
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
          setData(results.data as SalesData[])
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


  return (
    <>
      <h1>Arpari Parse!</h1>
      <div className="card">
        <input type="file" accept=".csv" onChange={handleFileSelect} />
        <p>Please upload your file above!</p>
      </div>
      {/* will only show when data is populated */}
      {data.length > 0 && (
        <div>
          {displayData()}
        </div>
      )}
    </>
  )
}

export default App
