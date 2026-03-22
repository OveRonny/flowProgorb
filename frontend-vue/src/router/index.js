import {
  createRouter,
  createWebHistory
} from "vue-router"
import MainLayout from "../components/MainLayout.vue"
import DashboardView from "../views/DashboardView.vue"
import LoginView from "../features/auth/views/LoginView.vue"
import RegisterPage from '../features/auth/views/RegisterView.vue'
import GitHubCallbackView from '../features/auth/views/GitHubCallbackView.vue'
import ProjectView from '../features/projects/views/ProjectView.vue'
import PlanningView from '../features/projects/views/PlanningView.vue'
import RequirementDetailView from '../features/projects/views/RequirementDetailView.vue'
import MilestoneDetailView from '../features/projects/views/MilestoneDetailView.vue'
import MeetingDetailView from '../features/projects/views/MeetingDetailView.vue'
import DevelopmentView from '../features/development/views/DevelopmentView.vue'
import PlanningOverviewView from '../features/development/views/PlanningOverviewView.vue'
import PlanningStarterView from '../features/development/views/PlanningStarterView.vue'
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
    redirect: '/dashboard'
  },
  {
    path: '/planning/start',
    name: 'PlanningStarter',
    component: PlanningStarterView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/dashboard",
    name: "Home",
    component: DashboardView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/development",
    name: "Development",
    component: DevelopmentView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/planning-overview",
    name: "PlanningOverview",
    component: PlanningOverviewView,
    meta: {
      requiresAuth: true
    }
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
    path: '/project/:id/planning',
    component: PlanningView,
    name: 'ProjectPlanning',
    meta: {
      requiresAuth: true
    },
  },
  {
    path: '/project/:projectId/requirement/:id',
    component: RequirementDetailView,
    name: 'RequirementDetail',
    meta: {
      requiresAuth: true
    },
  },
  {
    path: '/project/:projectId/milestone/:id',
    component: MilestoneDetailView,
    name: 'MilestoneDetail',
    meta: {
      requiresAuth: true
    },
  },
  {
    path: '/project/:projectId/meeting/:id',
    component: MeetingDetailView,
    name: 'MeetingDetail',
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
    return { path: '/dashboard' }
  }

  return true
})

export default router