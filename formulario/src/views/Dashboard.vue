<script setup>
import { ref, onMounted, computed } from 'vue';
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
const niveles = ref([]);
const nivelesInsertar = ref({}); // Objeto para almacenar los niveles a insertar

const userEmail = ref('');
const userId = ref(null);
const clavesRespuestas = ref(null); // Lo definimos como null según tu requerimiento

// Obtener todas las alternativas seleccionadas (IDs)
const alternativasSeleccionadas = computed(() => {
  return Object.values(respuestasEnviadas.value).flat();
});

const nivelesPorCategoria = computed(() => {
  const categoriasUnicas = [...new Set(niveles.value.map(n => n.nombre_categoria))];
  const resultado = {};

  categoriasUnicas.forEach(categoria => {
    const nivelesCategoria = niveles.value
      .filter(n => n.nombre_categoria === categoria)
      .sort((a, b) => b.nivel - a.nivel);

    const nivelAlcanzado = nivelesCategoria.find(nivel => {
      const alternativasNivel = nivel.ids_alternativas.split(',').map(Number);
      return alternativasNivel.every(altId => alternativasSeleccionadas.value.includes(altId));
    });

    resultado[categoria] = nivelAlcanzado ? nivelAlcanzado.nivel : 0;

    // Mapeo de categorías a las columnas de la tabla
    switch (categoria) {
      case 'Competencias de Resiliencia Laboral':
        nivelesInsertar.value.crl = nivelAlcanzado ? nivelAlcanzado.nivel : 0;
        break;
      case 'Trabajo en Equipo':
        nivelesInsertar.value.team = nivelAlcanzado ? nivelAlcanzado.nivel : 0;
        break;
      case 'Toma de Decisiones':
        nivelesInsertar.value.trl = nivelAlcanzado ? nivelAlcanzado.nivel : 0;
        break;
      // Agrega los demás casos según corresponda
      default:
        console.warn(`Categoría no mapeada: ${categoria}`);
    }
  });

  return resultado;
});

// Obtener datos de la API
const fetchData = async () => {
  try {
    const [categoriasResponse, preguntasResponse, alternativasResponse, nivelesResponse] = await Promise.all([
      axios.get('https://kth2025backend-production.up.railway.app/categorias'),
      axios.get('https://kth2025backend-production.up.railway.app/preguntas'),
      axios.get('https://kth2025backend-production.up.railway.app/alternativas'),
      axios.get('https://kth2025backend-production.up.railway.app/niveles')
    ]);

    categorias.value = categoriasResponse.data.data;
    preguntas.value = preguntasResponse.data.data;
    alternativas.value = alternativasResponse.data.data;
    niveles.value = nivelesResponse.data.data;

    // Inicializar objeto de respuestas
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

// Manejar selección de alternativas
const toggleAlternativa = (preguntaId, alternativaId) => {
  const index = respuestas.value[preguntaId].indexOf(alternativaId);
  if (index === -1) {
    respuestas.value[preguntaId].push(alternativaId);
  } else {
    respuestas.value[preguntaId].splice(index, 1);
  }
};

const isSelected = (preguntaId, alternativaId) => {
  return respuestas.value[preguntaId].includes(alternativaId);
};

const preguntasPorCategoria = (categoriaId) => {
  return preguntas.value.filter(pregunta => pregunta.categoria === categoriaId);
};

const alternativasPorPregunta = (preguntaId) => {
  return alternativas.value.filter(alt => alt.id_pregunta === preguntaId);
};

const enviarDatos = async () => {
  try {
    // Crear el objeto de datos a enviar
    const datosAEnviar = {
      id_user: Number(userId.value),
      claves_resp: "", // String vacío como indicaste
      crl: Number(nivelesPorCategoria.value.CRL) || 0,
      team: Number(nivelesPorCategoria.value.TEAM) || 0,
      brl: Number(nivelesPorCategoria.value.BRL) || 0,
      iprl: Number(nivelesPorCategoria.value.IPRL) || 0,
      frl: Number(nivelesPorCategoria.value.FRL) || 0,
      trl: Number(nivelesPorCategoria.value.TRL) || 0
    };

    console.log("Datos a enviar:", nivelesPorCategoria.value.CRL);

    const response = await axios.post(
      "https://kth2025backend-production.up.railway.app/respuestas",
      datosAEnviar,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("Respuesta del servidor:", response.data);
    alert("¡Datos guardados correctamente!");
  } catch (err) {
    console.error("Error completo:", {
      request: err.config?.data,
      response: err.response?.data,
      message: err.message
    });
    alert(`Error: ${err.response?.data?.message || err.message}`);
  }
};

const submitForm = async () => {
  try {
    // Filtrar solo preguntas con respuestas
    respuestasEnviadas.value = Object.fromEntries(
      Object.entries(respuestas.value).filter(([_, alternativas]) => alternativas.length > 0)
    );

    // Calcular niveles por categoría (se actualiza automáticamente por el computed)
    console.log('Niveles por categoría:', nivelesPorCategoria.value);

    // Mostrar resumen
    showSummary.value = true;

    // Opcional: enviar datos automáticamente al mostrar el resumen
    // await enviarDatos();

  } catch (err) {
    error.value = 'Error al enviar el formulario';
    console.error(err);
  }
};

onMounted(() => {
  fetchData();

  // Obtener datos del usuario desde localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    userEmail.value = user.email;
    userId.value = user.id;
  }
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
              <button v-for="alternativa in alternativasPorPregunta(pregunta.id)" :key="alternativa.id" type="button"
                class="alternativa-btn" @click="toggleAlternativa(pregunta.id, alternativa.id)"
                :class="{ selected: isSelected(pregunta.id, alternativa.id) }">
                {{ alternativa.texto }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <button type="submit" class="submit-btn">Enviar Respuestas</button>
      </form>

      <div v-else class="resumen-container">
        <h2>Resumen de tu evaluación</h2>

        <!-- Información del usuario -->
        <div class="user-info" v-if="userId">
          <p><strong>ID de usuario:</strong> {{ userId }}</p>
          <p><strong>Nombre:</strong> {{ userName }}</p>
          <p><strong>Email:</strong> {{ userEmail }}</p>
        </div>

        <h3>Progreso por categoría</h3>

        <div v-for="(nivel, categoria) in nivelesPorCategoria" :key="categoria" class="categoria-nivel">
          <h4>{{ categoria }}</h4>
          <p v-if="nivel > 0">✅ Nivel completado: <strong>{{ nivel }}</strong></p>
          <p v-else>❌ No completaste ningún nivel</p>
        </div>

        

        <div class="datos-envio">
          <h4>Datos que se enviarán:</h4>
          <pre>{{
            {
              id_user: userId,
              claves_resp: null,
              nivelesPorCategoria,
            }
          }}</pre>
        </div>

        <button @click="showSummary = false" class="back-btn">Volver al formulario</button>
        <button @click="enviarDatos" class="send-btn">Enviar resultados</button>
      </div>
    </template>
  </div>
</template>




<style scoped>
.user-info {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

user-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #42b983;
}

.user-info p {
  margin: 5px 0;
}

.datos-envio {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.9em;
}

.datos-envio pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>