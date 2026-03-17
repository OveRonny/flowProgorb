import { registerUser, loginUser, githubOAuthLoginService } from './authService.js';


export async function register(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const { token, user } = await registerUser({ email, password });
    res.status(201).json({ token, user });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(error.status || 400).json({ message: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUser({ email, password });
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
}

export async function githubCallback(req, res) {
  const { code } = req.query;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=missing_code`);
  }

  try {
    const { token } = await githubOAuthLoginService(code);
    return res.redirect(`${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error('[GitHub OAuth]', err.message);
    return res.redirect(
      `${FRONTEND_URL}/login?error=${encodeURIComponent(err.message || 'oauth_failed')}`
    );
  }
}