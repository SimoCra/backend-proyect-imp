import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createUser, loginUser, findUserById, updateUserPasswordService, findUserByEmailService } from '../service/userService.js';
import { verifyCaptcha } from '../service/captchaService.js';
import {sendEmail} from '../utils/sendCode.js';

dotenv.config();

// POST /register
export const registerController = async (req, res) => {
  const { name, email, password,  phone } = req.body;

  const role = (email === process.env.ADMIN_EMAIL) ? 'admin' : 'user';
  const image = { filename: 'default.jpg' };

  try {
    await createUser(name, email, phone, password, role, image);
    res.status(201).json({ message: '✅ Usuario registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: error || 'Error al registrar usuario' });
    console.log('consola gay',error)
  }
};

// POST /login
export const loginController = async (req, res) => {
  const { email, password ,captchaToken} = req.body;
  const fingerprint = req.headers['x-client-fingerprint']; // 🔐 Fingerprint desde el frontend

  if (captchaToken) {
      return res.status(400).json({ message: 'Falta el captcha' });
    }

  if (!fingerprint) {
    return res.status(400).json({ message: 'Fingerprint ausente en el header' });
  }


  try {
    await verifyCaptcha(captchaToken); 
    const user = await loginUser(email);


    if (!user) {
      return res.status(400).json({ message: 'Email inexistente' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // 🔐 JWT con fingerprint incluido
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        cart_id : user.cartId,
        fp: fingerprint
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: '1h'
      }
    );

    // 🧁 Cookie segura con el JWT
    res.cookie('__secure', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // ⚠️ true en producción
      sameSite: 'Strict', // o 'Lax' si necesitas compatibilidad
      maxAge: 60 * 60 * 1000 // 1 hora
    });

    res.status(200).json({ message: 'Inicio de sesión exitoso' });
  } catch (error) {
    return res.status(500).json({ message: error?.message || '❌ Error al iniciar sesión' });
  }
};

// POST /forgot-password
export const forgotPasswordController = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'El correo es obligatorio' });
  }

  try {
    await sendEmail(email); // esta función ya debe enviar un link con JWT
    return res.status(200).json({ message: '📧 Revisa tu correo para cambiar tu contraseña' });
  } catch (error) {
    const msg = typeof error === 'string' ? error : error.message || 'Error del servidor';
    return res.status(400).json({ message: msg });
  }
};

// GET /me
export const getMeController = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: ' Usuario no encontrado' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
};

// /logout

export const logout = async (req,res) =>{
  try {
    res.clearCookie('__secure', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict'
    });
    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    res.status(500).json({message: 'Error al cerrar Sesion'})
  }
}


// Cambiar Contraseña

// Verificar password change token

export const verifyResetTokenController = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.RESET_SECRET);
    // Opcionalmente puedes enviar de vuelta el email
    return res.status(200).json({ message: 'Token válido', email: decoded.email });
  } catch (error) {

    return res.status(400).json({ message: 'El enlace para restablecer tu contraseña ya no es válido. Por favor, solicita uno nuevo.' });

  }
};


export const resetPasswordController = async (req, res) => {
  const { token, newPassword, newPasswordValidate } = req.body;

  if (!token) return res.status(400).json({ message: 'Token no proporcionado' });
  if (!newPassword || !newPasswordValidate) {
    return res.status(400).json({ message: 'Debes enviar la nueva contraseña y su confirmación' });
  }
  if (newPassword !== newPasswordValidate) {
    return res.status(400).json({ message: 'Las contraseñas no coinciden' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.RESET_SECRET);
    const email = decoded.email;

    // Buscar usuario por email
    const user = await findUserByEmailService(email);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Actualizar contraseña
    await updateUserPasswordService(user.id, newPassword);

    return res.status(200).json({ message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    console.error('Error al resetear la contraseña:', error);
    return res.status(400).json({
      message: error.name === 'TokenExpiredError'
        ? 'El enlace ha expirado, solicita uno nuevo'
        : error.message || 'Error al restablecer la contraseña',
    });
  }
};