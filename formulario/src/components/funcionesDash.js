import { computed, ref } from 'vue';

export const alternativasSeleccionadas = computed(() => {
  return Object.values(respuestasEnviadas.value).flat();
});