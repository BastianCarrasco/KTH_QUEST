import { ref, computed, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export function useResumen(respuestasEnviadas, niveles, alternativas, showSummary, router) {
  const radarChartRef = ref(null);
  let radarChart = null;

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
    });
    return resultado;
  });

  const setupRadarChart = () => {
    if (!radarChartRef.value) return;
    if (radarChart) radarChart.destroy();

    const categorias = Object.keys(nivelesPorCategoria.value);
    const nivelesData = Object.values(nivelesPorCategoria.value);

    radarChart = new Chart(radarChartRef.value, {
      type: 'radar',
      data: {
        labels: categorias,
        datasets: [{
          label: 'Nivel alcanzado',
          data: nivelesData,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          r: {
            suggestedMin: 0,
            suggestedMax: Math.max(...nivelesData) + 1
          }
        }
      }
    });
  };

  onMounted(setupRadarChart);
  watch(nivelesPorCategoria, setupRadarChart, { deep: true });

  return {
    radarChartRef,
    nivelesPorCategoria,
    alternativasSeleccionadas
  };
}