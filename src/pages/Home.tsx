import { useState } from 'react'

export default function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="home">
      <h1>Welcome to Knowledge Hub</h1>
      <p>A React + Vite application with TypeScript and Router</p>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/pages/Home.tsx</code> and save to test hot module replacement.
        </p>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}
