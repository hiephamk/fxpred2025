import {BrowserRouter as Routers, Routes, Route} from "react-router"
import Dashboard from './Pages/Dashboard'
import FxDashboardPage from './Pages/FxDashboardPage'

function App() {
  return (
    <Routers>
      <Routes>
        {/* <Route path="/" element={<LoginPage/>}/> */}
        <Route path='/' element={<Dashboard/>}/>
        <Route path='/home' element={<Dashboard/>}>
          <Route index element={<FxDashboardPage/>}/>
          <Route path="/home/forex" element={<FxDashboardPage/>}/>
        </Route>
      </Routes>
    </Routers>
  )
}

export default App
