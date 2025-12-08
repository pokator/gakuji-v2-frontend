import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

const Signup = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [signedUp, setSignedUp] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signUp(email, password)
      setError('')
      setSignedUp(true)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-4">
      {!signedUp ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold">Sign Up</h2>
          {error && <p className="text-red-500">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Sign Up</button>
          <p>Already have an account? <button type="button" onClick={onSwitchToLogin} className="text-blue-500">Login</button></p>
        </form>
      ) : (
        <div className="p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-bold">Confirm your email</h2>
          <p className="mt-2">We sent a confirmation link to <strong>{email}</strong>. Please check your inbox (and spam) and click the link to verify your email.</p>
          <p className="mt-2">After confirming, click the button below to go to the login page.</p>
          <div className="mt-4 flex gap-2">
            <button onClick={onSwitchToLogin} className="bg-green-600 text-white px-4 py-2 rounded">Go to Login</button>
            <button onClick={() => setSignedUp(false)} className="bg-gray-200 px-4 py-2 rounded">Back</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Signup