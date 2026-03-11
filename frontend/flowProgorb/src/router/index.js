import {
  createRouter,
  createWebHistory
} from "vue-router"
import LoginView from "../features/auth/views/LoginPage.vue"
import RegisterPage from '../features/auth/views/RegisterPage.vue'
import DashboardPage from '../features/dashboard/views/Dashboard.vue'
import ProjectPage from "../features/projects/views/ProjectPage.vue"
import CreateProject from "../features/projects/views/CreateProject.vue"


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
    path: '/',
    component: DashboardPage,
    name: 'Dashboard',
    meta: {
      requiresAuth: true
    },


  },
  {
    path: '/project',
    component: ProjectPage,
    name: 'Project',
    meta: {
      requiresAuth: true
    },
  },
   {
    path: '/createproject',
    component: CreateProject,
    name: 'createProject',
    meta: {
      requiresAuth: true
    },
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router