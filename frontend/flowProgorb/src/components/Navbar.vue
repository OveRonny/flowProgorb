<template>
  <nav class="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-6 py-4 flex justify-between items-center relative">
   
    <div class="text-xl font-bold">
      <router-link to="/" class="hover:text-blue-500 dark:hover:text-blue-400">🏗️ ProsjektApp</router-link>
    </div>

   
    <ul class="hidden md:flex space-x-6">
         <li>
        <router-link
          to="/"
          class="hover:text-blue-500 dark:hover:text-blue-400"
          active-class="border-b-2 border-blue-500 dark:border-blue-400"
        >
          Dashboard
        </router-link>
      </li>
      <li>
        <router-link
          to="/project"
          class="hover:text-blue-500 dark:hover:text-blue-400"
          active-class="border-b-2 border-blue-500 dark:border-blue-400"
        >
          Prosjekter
        </router-link>
      </li>
     
      <li>
        <router-link
          to="/settings"
          class="hover:text-blue-500 dark:hover:text-blue-400"
          active-class="border-b-2 border-blue-500 dark:border-blue-400"
        >
          Innstillinger
        </router-link>
      </li>
    </ul>

    
    <div class="md:hidden">
      <button @click="isOpen = !isOpen">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            v-if="!isOpen"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 8h16M4 16h16"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

  
    <div
      v-if="isOpen"
      class="absolute top-full left-0 w-full bg-white dark:bg-gray-900 flex flex-col items-center md:hidden space-y-4 py-4"
    >
     <router-link
        to="/"
        class="hover:text-blue-500 dark:hover:text-blue-400"
        @click="isOpen=false"
      >
        Dashboard
      </router-link>
      <router-link
        to="/project"
        class="hover:text-blue-500 dark:hover:text-blue-400"
        @click="isOpen=false"
      >
        Prosjekter
      </router-link>
     
      <router-link
        to="/settings"
        class="hover:text-blue-500 dark:hover:text-blue-400"
        @click="isOpen=false"
      >
        Innstillinger
      </router-link>
    </div>
  </nav>
</template>

<script>
export default {
  name: "Navbar",
  data() {
    return {
      isOpen: false
    }
  }
}
</script>