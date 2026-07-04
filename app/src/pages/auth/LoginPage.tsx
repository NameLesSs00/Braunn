import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routes } from '../../shared/lib/routes'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { adminLogin, clearAuthError } from '../../features/auth/authSlice'

export function LoginPage() {
  const [email, setEmail] = useState('admin@gear.com')
  const [password, setPassword] = useState('Gear@321')
  const { status, error } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    if (isAuthenticated) {
      navigate(routes.dashboard)
    }
    return () => {
      dispatch(clearAuthError())
    }
  }, [navigate, dispatch])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const result = await dispatch(adminLogin({
      email,
      password
    }))

    if (adminLogin.fulfilled.match(result)) {
      navigate(routes.dashboard)
    }
  }

  const isLoading = status === 'loading'

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[450px] animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-10">
          <img src="/assets/Asset 9 1.svg" alt="Braun" className="h-16 w-auto" />
        </div>

        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 p-10 border border-slate-100">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h1>
            <p className="text-slate-500">Please enter your credentials to sign in</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 focus:border-[#0B4EA2] transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 ml-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 focus:border-[#0B4EA2] transition-all"
              />
            </div>

            <div className="flex items-center gap-2 ml-1">
              <input
                type="checkbox"
                id="remember"
                defaultChecked
                className="w-4 h-4 rounded border-slate-300 text-[#0B4EA2] focus:ring-[#0B4EA2]"
              />
              <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
                Remember this session
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-[#0B4EA2] text-white font-bold rounded-2xl shadow-lg shadow-[#0B4EA2]/20 hover:bg-[#093d81] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Need help?{' '}
              <a href="#" className="font-bold text-[#0B4EA2] hover:underline">
                Contact Admin
              </a>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-400 text-xs uppercase tracking-widest font-medium">
          Powered by Braun Management System
        </p>
      </div>
    </div>
  )
}
