import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.scss'
import { UserContextProvider } from './auth/userContext.tsx'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
 // <React.StrictMode>
 <UserContextProvider>
 <BrowserRouter>
   <App />
 </BrowserRouter>
</UserContextProvider>
// </React.StrictMode>,
)
