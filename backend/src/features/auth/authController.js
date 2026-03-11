import { registerUser, loginUser } from './authService.js';


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