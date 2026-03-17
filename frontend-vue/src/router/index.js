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

function getStoredToken() {
  let token = localStorage.getItem('token')

  try {
    token = JSON.parse(token)
  } catch {
    // Keep raw token value when it is not JSON encoded.
  }

  if (typeof token === 'string') {
    return token.replace(/^"|"$/g, '').trim()
  }

  return null
}

const routes = [{
    path: "/login",
    component: LoginView,
    meta: {
      guestOnly: true
    },
  },
  {
    path: '/register',
    component: RegisterPage,
    name: 'Register'
    ,meta: {
      guestOnly: true
    }
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
    component: ProjectView,
    meta: {
      requiresAuth: true
    },
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

router.beforeEach((to) => {
  const hasToken = Boolean(getStoredToken())
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)
  const guestOnly = to.matched.some((record) => record.meta?.guestOnly)

  if (requiresAuth && !hasToken) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (guestOnly && hasToken) {
    return { path: '/project' }
  }

  return true
})

export default router