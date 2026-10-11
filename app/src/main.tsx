import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import './index.css'
import './i18n'
import App from './App'
import { store } from './store/store'
import { AppAlertProvider } from './shared/ui/AppAlert'
import { NotificationProvider } from './context/NotificationContext'

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <NotificationProvider>
      <AppAlertProvider>
        <App />
        <Toaster richColors closeButton position="top-right" />
      </AppAlertProvider>
    </NotificationProvider>
  </Provider>,
)

