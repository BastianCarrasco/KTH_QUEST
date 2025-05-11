<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import bcrypt from 'bcryptjs';

const router = useRouter();

// Estados reactivos
const isLogin = ref(true);
const formData = ref({
  nombre: '',
  email: '',
  clave: '',
  claveConfirmacion: ''
});
const error = ref('');
const isLoading = ref(false);

// Cambiar entre login y registro
const switchMode = () => {
  isLogin.value = !isLogin.value;
  error.value = '';
  formData.value = {
    nombre: '',
    email: '',
    clave: '',
    claveConfirmacion: ''
  };
};

// Hashear contraseña
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Validar formulario
const validateForm = () => {
  if (!formData.value.email.includes('@')) {
    error.value = 'Por favor ingresa un email válido';
    return false;
  }

  if (formData.value.clave.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres';
    return false;
  }

  if (!isLogin.value && formData.value.clave !== formData.value.claveConfirmacion) {
    error.value = 'Las contraseñas no coinciden';
    return false;
  }

  return true;
};

// Manejar envío del formulario
const handleSubmit = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  error.value = '';

  try {
    const API_URL = 'https://kth2025backend-production.up.railway.app/usuarios';
    
    if (isLogin.value) {
      // Login
      const { data } = await axios.get(API_URL);
      const user = data.data.find(u => u.email === formData.value.email);

      if (!user) throw new Error('Usuario no encontrado');

      const isMatch = await bcrypt.compare(formData.value.clave, user.clave);
      if (!isMatch) throw new Error('Credenciales incorrectas');

      localStorage.setItem('user', JSON.stringify(user));
      router.push('/dashboard');
    } else {
      // Registro
      const hashedPassword = await hashPassword(formData.value.clave);
      
      const { data } = await axios.post(API_URL, {
        nombre: formData.value.nombre,
        email: formData.value.email,
        clave: hashedPassword
      });

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data));
        router.push('/dashboard');
      } else {
        throw new Error('Error al registrar usuario');
      }
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Error en la conexión';
    console.error('Error:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-container">
    <h1>{{ isLogin ? 'Iniciar Sesión' : 'Registrarse' }}</h1>
    
    <form @submit.prevent="handleSubmit" class="auth-form">
      <div v-if="!isLogin" class="form-group">
        <label for="nombre">Nombre:</label>
        <input 
          id="nombre" 
          type="text" 
          v-model="formData.nombre" 
          required 
          placeholder="Ingresa tu nombre"
        />
      </div>
      
      <div class="form-group">
        <label for="email">Email:</label>
        <input 
          id="email" 
          type="email" 
          v-model="formData.email" 
          required 
          placeholder="ejemplo@dominio.com"
        />
      </div>
      
      <div class="form-group">
        <label for="clave">Contraseña:</label>
        <input 
          id="clave" 
          type="password" 
          v-model="formData.clave" 
          required 
          placeholder="Mínimo 6 caracteres"
          minlength="6"
        />
      </div>
      
      <div v-if="!isLogin" class="form-group">
        <label for="claveConfirmacion">Confirmar Contraseña:</label>
        <input 
          id="claveConfirmacion" 
          type="password" 
          v-model="formData.claveConfirmacion" 
          required 
          placeholder="Repite tu contraseña"
          minlength="6"
        />
      </div>
      
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <button type="submit" class="submit-btn" :disabled="isLoading">
        <span v-if="!isLoading">{{ isLogin ? 'Iniciar Sesión' : 'Registrarse' }}</span>
        <span v-else>Procesando...</span>
      </button>
    </form>
    
    <button @click="switchMode" class="switch-mode-btn">
      {{ isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión' }}
    </button>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 420px;
  margin: 2rem auto;
  padding: 2.5rem;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
}

h1 {
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

label {
  font-size: 0.95rem;
  color: #4a5568;
  font-weight: 500;
  margin-left: 0.2rem;
}

input {
  padding: 0.9rem 1.2rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #f8fafc;
  color: #1e293b;
}

input:hover {
  border-color: #c7d2fe;
}

input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  background-color: #ffffff;
}

input::placeholder {
  color: #94a3b8;
  font-size: 0.9rem;
  opacity: 0.8;
}

.error-message {
  color: #dc2626;
  background-color: #fef2f2;
  padding: 0.9rem;
  border-radius: 10px;
  font-size: 0.9rem;
  text-align: center;
  margin: 0.5rem 0;
  border: 1px solid #fecaca;
  animation: fadeIn 0.3s ease-out;
}

.submit-btn {
  background-color: #6366f1;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.8rem;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 5px rgba(99, 102, 241, 0.2);
}

.submit-btn:hover {
  background-color: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 3px rgba(79, 70, 229, 0.3);
}

.submit-btn:disabled {
  background-color: #c7d2fe;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.switch-mode-btn {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 0.9rem;
  cursor: pointer;
  text-align: center;
  width: 100%;
  margin-top: 1.8rem;
  padding: 0.6rem;
  transition: all 0.2s ease;
  font-weight: 500;
  border-radius: 6px;
}

.switch-mode-btn:hover {
  color: #4f46e5;
  background-color: #f8fafc;
  text-decoration: none;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive design */
@media (max-width: 480px) {
  .auth-container {
    margin: 1rem;
    padding: 1.8rem;
    border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }
  
  h1 {
    font-size: 1.6rem;
    margin-bottom: 1.8rem;
  }
  
  input {
    padding: 0.8rem 1rem;
  }
  
  .submit-btn {
    padding: 0.9rem;
  }
}
</style>