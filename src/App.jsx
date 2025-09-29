  import { useState } from 'react'
  import reactLogo from './assets/react.svg'
  import viteLogo from '/vite.svg'
  import ProgressTrackerApp from './ProgressTracker'
  import './App.css'

  function App() {
    const [count, setCount] = useState(0)

    return (
      <>
      <ProgressTrackerApp />
      </>
    )
  }

  export default App
