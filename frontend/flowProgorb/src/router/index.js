import { createRouter, createWebHistory } from "vue-router"
import LoginView from "../features/auth/views/LoginPage.vue"
import RegisterPage from '../features/auth/views/RegisterPage.vue'


const routes = [
  {
    path: "/login",
    component: LoginView
  },  
   {
    path: '/register',
    component: RegisterPage,
    name: 'Register'
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router