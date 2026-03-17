import {
  createRouter,
  createWebHistory
} from "vue-router"
import MainLayout from "../components/MainLayout.vue"
import LoginView from "../features/auth/views/LoginView.vue"
import RegisterPage from '../features/auth/views/RegisterView.vue'
import GitHubCallbackView from '../features/auth/views/GitHubCallbackView.vue'
import ProjectView from '../features/projects/views/ProjectView.vue'
import TechnologyView from "@/features/technologies/views/TechnologyView.vue"
import FeatureView from "@/features/features/views/FeatureView.vue"
import ModuleView from "@/features/modules/views/ModuleView.vue"
import TaskView from "@/features/tasks/views/TaskView.vue"


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
    path: '/auth/callback',
    component: GitHubCallbackView,
    name: 'GitHubCallback'
  },
  {
    path: "/",
    name: "Home",
    component: MainLayout
  },
  {
    path: "/project",
    name: "Project",
    component: ProjectView
  },
  {
    path: '/technology',
    component: TechnologyView,
    name: 'Technology',
    meta: {
      requiresAuth: true
    },
  },

  {
    path: '/project/:id',
    component: FeatureView,
    name: 'Features',
    meta: {
      requiresAuth: true
    },
  },
   {
    path: '/module',
    component: ModuleView,
    name: 'Modules',
    meta: {
      requiresAuth: true
    },
  },
   {
    path: '/features/:featureId/tasks',
    component: TaskView,
    name: 'Tasks',
    meta: {
      requiresAuth: true
    },
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router