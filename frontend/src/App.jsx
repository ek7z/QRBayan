import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ToastProvider } from "./components/ToastProvider";
import NotificationWatcher from "./components/NotificationWatcher";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <NotificationWatcher />
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
