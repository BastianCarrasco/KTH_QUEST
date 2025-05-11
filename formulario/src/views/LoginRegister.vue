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
/* Estilos igual que en la versión anterior */
</style>