import { useState, useEffect } from 'react'
import Login from './Login'
import Signup from './Signup'

const AuthModal = ({ isOpen }: { isOpen: boolean }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    setIsClosing(false);
  }, [isOpen]);

  if (!isOpen && !isClosing) return null

  return (
    <div className={`fixed inset-0 bg-black z-50 flex items-center justify-center modal-overlay-container ${isClosing ? 'closing' : ''}`}>
      <div className={`bg-surface p-6 rounded-lg max-w-md w-full text-surface-text modal-content ${isClosing ? 'closing' : ''}`}>
        {isLogin ? (
          <Login onSwitchToSignup={() => setIsLogin(false)} />
        ) : (
          <Signup onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  )
}

export default AuthModal