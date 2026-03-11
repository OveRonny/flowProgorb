<template>
  <div class="create-project p-4 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Opprett nytt prosjekt</h1>

    <form @submit.prevent="submitProject" class="space-y-4">
      <!-- Prosjektinfo -->
      <div>
        <label class="block font-semibold">Navn</label>
        <input v-model="form.name" type="text" class="input" required />
      </div>

      <div>
        <label class="block font-semibold">Beskrivelse</label>
        <textarea v-model="form.description" class="input"></textarea>
      </div>

      <div>
        <label class="block font-semibold">Status</label>
        <select v-model="form.status" class="input">
          <option value="PLANNED">Planlagt</option>
          <option value="ACTIVE">Aktiv</option>
          <option value="COMPLETED">Ferdig</option>
          <option value="ON_HOLD">På vent</option>
        </select>
      </div>

      <div>
        <label class="block font-semibold">Tags</label>
        <input v-model="tagsInput" @keyup.enter.prevent="addTag" placeholder="Trykk enter for å legge til tag" class="input" />
        <div class="flex flex-wrap gap-2 mt-2">
          <span v-for="(tag, index) in form.tags" :key="index" class="bg-blue-200 px-2 py-1 rounded-full flex items-center gap-1">
            {{ tag }}
            <button type="button" @click="removeTag(index)" class="text-red-600 font-bold">x</button>
          </span>
        </div>
      </div>

      <!-- Moduler -->
      <div>
        <label class="block font-semibold">Moduler</label>
        <select v-model="form.moduleIds" multiple class="input h-32">
          <option v-for="module in modules" :key="module.id" :value="module.id">
            {{ module.name }}
          </option>
        </select>
      </div>

      <!-- Programmeringsspråk -->
      <div>
        <label class="block font-semibold">Programmeringsspråk</label>
        <select v-model="form.languageIds" multiple class="input h-32">
          <option v-for="lang in languages" :key="lang.id" :value="lang.id">
            {{ lang.name }}
          </option>
        </select>
      </div>

      <!-- Rammeverk -->
      <div>
        <label class="block font-semibold">Rammeverk</label>
        <select v-model="form.frameworkIds" multiple class="input h-32">
          <option v-for="fw in frameworks" :key="fw.id" :value="fw.id">
            {{ fw.name }}
          </option>
        </select>
      </div>

      <!-- Biblioteker -->
      <div>
        <label class="block font-semibold">Biblioteker</label>
        <select v-model="form.libraryIds" multiple class="input h-32">
          <option v-for="lib in libraries" :key="lib.id" :value="lib.id">
            {{ lib.name }}
          </option>
        </select>
      </div>

      <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        Opprett prosjekt
      </button>
    </form>
  </div>
</template>

<script>
import api from '../../shared/axiosInstance'

export default {
  name: 'CreateProject',
  data() {
    return {
      modules: [],
      languages: [],
      frameworks: [],
      libraries: [],
      tagsInput: '',
      form: {
        name: '',
        description: '',
        status: 'PLANNED',
        tags: [],
        moduleIds: [],
        languageIds: [],
        frameworkIds: [],
        libraryIds: [],
      },
    }
  },
  mounted() {
    this.fetchOptions()
  },
  methods: {
    async fetchOptions() {
      try {
        const [modulesRes, langsRes, fwsRes, libsRes] = await Promise.all([
          api.get('/api/modules'),
          api.get('/api/languages'),
          api.get('/api/frameworks'),
          api.get('/api/libraries'),
        ])
        this.modules = modulesRes.data
        this.languages = langsRes.data
        this.frameworks = fwsRes.data
        this.libraries = libsRes.data
      } catch (error) {
        console.error('Kunne ikke hente alternativer:', error)
      }
    },
    addTag() {
      if (this.tagsInput && !this.form.tags.includes(this.tagsInput)) {
        this.form.tags.push(this.tagsInput)
      }
      this.tagsInput = ''
    },
    removeTag(index) {
      this.form.tags.splice(index, 1)
    },
    async submitProject() {
      try {
        // Her sender vi hele form-data til backend
        const res = await api.post('/projects', {
          ...this.form,
          userId: 1, // Sett riktig brukerId dynamisk
        })
        alert('Prosjekt opprettet ✅')
        console.log(res.data)
        // Reset form
        this.form.name = ''
        this.form.description = ''
        this.form.tags = []
        this.form.moduleIds = []
        this.form.languageIds = []
        this.form.frameworkIds = []
        this.form.libraryIds = []
      } catch (error) {
        console.error('Feil ved opprettelse av prosjekt:', error)
        alert('Kunne ikke opprette prosjekt ❌')
      }
    },
  },
}
</script>

<style scoped>
.input {
  width: 100%;
  border: 1px solid #ccc;
  padding: 0.5rem;
  border-radius: 0.375rem;
}
</style>