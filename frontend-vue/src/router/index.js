import {
  createRouter,
  createWebHistory
} from "vue-router"
import MainLayout from "../components/MainLayout.vue"
import LoginView from "../features/auth/views/LoginView.vue"
import RegisterPage from '../features/auth/views/RegisterView.vue'


const routes = [{
    path: "/login",
    component: LoginView
  },
  {
    path: '/register',
    component: RegisterPage,
    name: 'Register'
  },
  {
    path: "/",
    name: "Home",
    component: MainLayout
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router