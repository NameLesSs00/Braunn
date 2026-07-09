import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App'
import { store } from './store/store'
import setupLocatorUI from "@locator/runtime";
 
if (import.meta.env.DEV) {
  setupLocatorUI();
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
