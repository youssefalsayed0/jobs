import { Link, Route, Routes } from "react-router-dom"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { HomePage } from "@/pages/HomePage"
import { LoginPage } from "@/pages/LoginPage"
import { SignupPage } from "@/pages/SignupPage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={
          <ProtectedRoute requireAuth={false}>
            <LoginPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <ProtectedRoute requireAuth={false}>
            <SignupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <div className="flex min-h-svh items-center justify-center p-4 text-slate-600">
            <p>
              Page not found.{" "}
              <Link className="text-blue-600 hover:underline" to="/">
                Go home
              </Link>
            </p>
          </div>
        }
      />
    </Routes>
  )
}

export default App
