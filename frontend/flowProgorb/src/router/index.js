import {
  createRouter,
  createWebHistory
} from "vue-router"
import LoginView from "../features/auth/views/LoginPage.vue"
import RegisterPage from '../features/auth/views/RegisterPage.vue'
import DashboardPage from '../features/dashboard/views/Dashboard.vue'
import ProjectPage from "../features/projects/views/ProjectPage.vue"
import TechnologiesPage from "../features/technologies/views/TechnologiesPage.vue"
import ProjectDetailsPage from "../features/projects/views/ProjectDetailsPage.vue"
import FeatureTasks from "../features/tasks/views/FeatureTasks.vue"


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
      path: '/project/:id',
      component: ProjectDetailsPage,
      name: 'ProjectDetails',
      meta: {
        requiresAuth: true
      },
    },
    {
      path: '/technology',
      component: TechnologiesPage,
      name: 'Technology',
      meta: {
        requiresAuth: true
      },
    },
    
      {
        path: '/projects/:projectId/features/:featureId/tasks',
        name: 'FeatureTasks',
        component: FeatureTasks,
        meta: {
          requiresAuth: true
        },
        props: true
      }


    ]

    const router = createRouter({
      history: createWebHistory(),
      routes
    })

    export default router