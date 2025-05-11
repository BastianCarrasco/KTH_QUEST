<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import '../assets/formulario.css';

const router = useRouter();
const categorias = ref([]);
const preguntas = ref([]);
const alternativas = ref([]);
const respuestas = ref({});
const isLoading = ref(true);
const error = ref(null);
const showSummary = ref(false);
const respuestasEnviadas = ref({});

// Obtener datos de la API
const fetchData = async () => {
  try {
    // Obtener categorías
    const categoriasResponse = await axios.get('https://kth2025backend-production.up.railway.app/categorias');
    categorias.value = categoriasResponse.data.data;
    
    // Obtener preguntas
    const preguntasResponse = await axios.get('https://kth2025backend-production.up.railway.app/preguntas');
    preguntas.value = preguntasResponse.data.data;
    
    // Obtener alternativas
    const alternativasResponse = await axios.get('https://kth2025backend-production.up.railway.app/alternativas');
    alternativas.value = alternativasResponse.data.data;
    
    console.log('Datos cargados:', {
      categorias: categorias.value,
      preguntas: preguntas.value,
      alternativas: alternativas.value
    });
    
    // Inicializar objeto de respuestas con arrays vacíos
    preguntas.value.forEach(pregunta => {
      respuestas.value[pregunta.id] = [];
    });
  } catch (err) {
    error.value = 'Error al cargar los datos del formulario';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

// Manejar selección de alternativas (solo guarda IDs)
const toggleAlternativa = (preguntaId, alternativaId) => {
  const index = respuestas.value[preguntaId].indexOf(alternativaId);
  
  if (index === -1) {
    // Agregar alternativa seleccionada (solo ID)
    respuestas.value[preguntaId].push(alternativaId);
  } else {
    // Remover alternativa seleccionada
    respuestas.value[preguntaId].splice(index, 1);
  }
};

// Verificar si una alternativa está seleccionada
const isSelected = (preguntaId, alternativaId) => {
  return respuestas.value[preguntaId].includes(alternativaId);
};

// Filtrar preguntas por categoría
const preguntasPorCategoria = (categoriaId) => {
  return preguntas.value.filter(pregunta => pregunta.categoria === categoriaId);
};

// Filtrar alternativas por pregunta
const alternativasPorPregunta = (preguntaId) => {
  return alternativas.value.filter(alt => alt.id_pregunta === preguntaId);
};

// Enviar respuestas y mostrar resumen
const submitForm = async () => {
  try {
    // Filtrar solo preguntas con respuestas
    respuestasEnviadas.value = Object.fromEntries(
      Object.entries(respuestas.value).filter(([_, alternativas]) => alternativas.length > 0)
    );
    
    console.log('Respuestas enviadas:', respuestasEnviadas.value);
    
    // Mostrar resumen
    showSummary.value = true;
    
    // Aquí puedes agregar el envío a la API si es necesario
    // await axios.post('tu-endpoint-api', respuestasEnviadas.value);
    
  } catch (err) {
    error.value = 'Error al enviar el formulario';
    console.error(err);
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="form-container">
    <h1>Formulario de Evaluación</h1>
    
    <div v-if="isLoading" class="loading">
      Cargando preguntas...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <template v-else>
      <form v-if="!showSummary" @submit.prevent="submitForm" class="preguntas-form">
        <div v-for="categoria in categorias" :key="categoria.id" class="categoria-section">
          <h2 class="categoria-title">{{ categoria.nombre }} - {{ categoria.descripcion }}</h2>
          
          <div v-for="pregunta in preguntasPorCategoria(categoria.id)" :key="pregunta.id" class="pregunta-card">
            <h3>{{ pregunta.texto }}</h3>
            
            <div class="alternativas-container">
              <button
                v-for="alternativa in alternativasPorPregunta(pregunta.id)" 
                :key="alternativa.id"
                type="button"
                class="alternativa-btn"
                @click="toggleAlternativa(pregunta.id, alternativa.id)"
                :class="{ selected: isSelected(pregunta.id, alternativa.id) }"
              >
                {{ alternativa.texto }}
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="error" class="error-message">{{ error }}</div>
        
        <button type="submit" class="submit-btn">Enviar Respuestas</button>
      </form>
      
      <div v-else class="resumen-container">
        <h2>Resumen de Respuestas</h2>
        <div v-for="(alternativasIds, preguntaId) in respuestasEnviadas" :key="preguntaId" class="resumen-item">
          <h3>Pregunta ID: {{ preguntaId }}</h3>
          <p>Alternativas seleccionadas: {{ alternativasIds.join(', ') }}</p>
          
          <div class="detalle-alternativas">
            <h4>Detalle de alternativas:</h4>
            <ul>
              <li v-for="altId in alternativasIds" :key="altId">
                ID {{ altId }}: {{ alternativas.find(a => a.id === altId)?.texto }}
              </li>
            </ul>
          </div>
        </div>
        
        <button @click="showSummary = false" class="back-btn">Volver al formulario</button>
        <button @click="router.push('/dashboard')" class="dashboard-btn">Ir al Dashboard</button>
      </div>
    </template>
  </div>
</template>




<style scoped>
/* Estilos anteriores se mantienen */

.resumen-container {
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.resumen-item {
  background-color: white;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.detalle-alternativas {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.back-btn, .dashboard-btn {
  padding: 0.75rem 1.5rem;
  margin: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.back-btn {
  background-color: #6c757d;
  color: white;
}

.back-btn:hover {
  background-color: #5a6268;
}

.dashboard-btn {
  background-color: #42b983;
  color: white;
}

.dashboard-btn:hover {
  background-color: #3aa876;
}
</style>