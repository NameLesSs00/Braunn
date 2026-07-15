import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App'
import { store } from './store/store'
import { AppAlertProvider } from './shared/ui/AppAlert'


createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <AppAlertProvider>
      <App />
    </AppAlertProvider>
  </Provider>,
)
