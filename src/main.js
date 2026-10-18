import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

// Starting point of the app: creates the Vue app, adds the router (pages)
// and the global styles, and puts it into <div id="app"> in index.html.

createApp(App).use(router).mount('#app')
