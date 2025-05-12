<template>
  <div class="resumen-container">
    <h2 style="display:flex;">Resumen de tu evaluación</h2>

    <h3>Progreso por categoría</h3>

    <div v-for="(nivel, categoria) in nivelesPorCategoria" :key="categoria" class="categoria-nivel">
      <h4>{{ categoria }}</h4>
      <p v-if="nivel > 0">✅ Nivel completado: <strong>{{ nivel }}</strong></p>
      <p v-else>❌ No completaste ningún nivel</p>
    </div>

    <button @click="handleVolver" class="back-btn">Volver al formulario</button>
    <button @click="handleEnviar" class="back-btn">Enviar resultados</button>
  </div>
</template>

<script>
export default {
  props: {
    nivelesPorCategoria: {
      type: Object,
      required: true
    },
    onVolver: {
      type: Function,
      required: true
    },
    onEnviar: {
      type: Function,
      required: true
    },
    showSummary: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleVolver() {
      this.onVolver();
    },
    handleEnviar() {
      this.onEnviar();
    }
  }
};
</script>

<style scoped>
.resumen-container {
  /* Tus estilos aquí */
}
.back-btn {
  /* Estilos para los botones */
}
</style>