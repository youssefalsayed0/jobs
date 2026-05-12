import { Outlet, useNavigate } from "react-router-dom"

import { Navbar } from "@/components/layout/Navbar"
import { useAuth } from "@/contexts/auth-context"

export function RootLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    void navigate("/login")
  }

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar
        isLoggedIn={!!user}
        userName={user?.name as string | undefined}
        userEmail={user?.email as string | undefined}
        onLogout={handleLogout}
      />
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
