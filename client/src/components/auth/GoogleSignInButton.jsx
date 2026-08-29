import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

// Official multi-color Google "G" logo SVG following Google's brand guidelines
const GoogleLogo = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const GoogleSignInButton = ({ onSuccess, onError }) => {
  const { loginWithGoogle } = useAuth();
  const { showToast } = useNotifications();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isConfigured = Boolean(googleClientId && googleClientId !== 'your_google_client_id_here' && googleClientId !== 'google-auth-client-id-placeholder');

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsAuthenticating(true);
      try {
        // Exchange access token for user info or verify credential
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await userInfoRes.json();

        // Create JWT credential representation
        const credentialPayload = {
          credential: null,
          accessToken: tokenResponse.access_token,
          email: googleUser.email,
          name: googleUser.name,
          given_name: googleUser.given_name,
          family_name: googleUser.family_name,
          picture: googleUser.picture,
          sub: googleUser.sub,
        };

        // Create custom token representation for backend verification
        const res = await loginWithGoogle(credentialPayload);
        if (res.success) {
          showToast(`Welcome back, ${res.user.profile?.firstName || 'Member'}!`, 'success');
          if (onSuccess) onSuccess(res.user);
        } else {
          showToast(res.message || 'Unable to sign in with Google.', 'error');
          if (onError) onError(res.message);
        }
      } catch (err) {
        showToast('Google sign-in error. Please try again.', 'error');
        if (onError) onError(err.message);
      } finally {
        setIsAuthenticating(false);
      }
    },
    onError: (error) => {
      setIsAuthenticating(false);
      if (error?.error === 'popup_closed_by_user') {
        showToast('Google sign-in was cancelled.', 'info');
      } else {
        showToast('Unable to sign in with Google. Please try again.', 'error');
      }
      if (onError) onError(error);
    },
  });

  const handleClick = (e) => {
    e.preventDefault();
    if (isAuthenticating) return;

    if (!isConfigured) {
      // Guide user on setting up Google Client ID
      showToast('Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.', 'info');
      return;
    }

    setIsAuthenticating(true);
    try {
      triggerGoogleLogin();
    } catch (err) {
      setIsAuthenticating(false);
      showToast('Google sign-in was cancelled or blocked by browser popup settings.', 'error');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isAuthenticating}
      className="w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs font-bold text-white bg-white/5 hover:bg-white/12 active:bg-white/8 border border-white/15 hover:border-white/30 shadow-md transition-all flex items-center justify-center gap-2.5 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 group"
      title="Continue with Google Account"
    >
      {isAuthenticating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-pro-400" />
          <span>Signing in with Google...</span>
        </>
      ) : (
        <>
          <GoogleLogo />
          <span>Continue with Google</span>
        </>
      )}
    </button>
  );
};

export default GoogleSignInButton;
