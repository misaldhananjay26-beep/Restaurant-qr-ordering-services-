import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '../components/ui/Button';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const user = result.user;
      
      // Check if user exists in restaurants collection
      const restDoc = await getDoc(doc(db, 'restaurants', user.uid));
      if (!restDoc.exists()) {
        await setDoc(doc(db, 'restaurants', user.uid), {
          ownerId: user.uid,
          name: user.displayName || 'My Restaurant',
          active: true,
          createdAt: serverTimestamp()
        });
        
        // Give free subscription
        await setDoc(doc(db, 'subscriptions', user.uid), {
          restaurantId: user.uid,
          plan: 'free',
          status: 'active',
          createdAt: serverTimestamp()
        });
      }
      
      navigate('/dashboard/orders');
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to log in: ' + ((error as Error).message || error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-[#111] border border-[#222] p-8 rounded-2xl max-w-md w-full text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          <span className="text-[#D4AF37]">Arjuna</span>Table
        </h1>
        <p className="text-gray-400 mb-8">Sign in to manage your restaurant</p>
        
        <Button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="w-full py-6 text-lg flex items-center justify-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          {loading ? 'Signing in...' : 'Continue with Google'}
        </Button>
        <p className="text-xs text-gray-500 mt-6">
          For demo purposes, just click the button above to create a test restaurant immediately.
        </p>
      </div>
    </div>
  );
}
