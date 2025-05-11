import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './routes/index.js'

const app = createApp(App)

// Usa el router
app.use(router)

app.mount('#app')
