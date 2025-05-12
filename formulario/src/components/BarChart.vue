<script setup>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

defineProps(['labels', 'data'])

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Progreso por Categoría' }
  },
  scales: {
    y: { beginAtZero: true, stepSize: 1 }
  }
}
</script>

<template>
  <Bar
    :data="{
      labels,
      datasets: [{
        label: 'Nivel',
        data,
        backgroundColor: '#00d1b2' // turquesa
      }]
    }"
    :options="chartOptions"
  />
</template>
