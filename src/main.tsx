import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppProviders from "./app/providers";
import AppRouter from "./app/router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>
);

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <AuthProvider>
//       <GoogleOAuthProvider clientId="360050562859-gm0ath3gsero6a9cn4jdvs09hrfv7tiu.apps.googleusercontent.com">
//       <App />
//       </GoogleOAuthProvider>
//     </AuthProvider>
//   </StrictMode>,
// )