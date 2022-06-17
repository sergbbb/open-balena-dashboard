<template>
  <div>
    <breadcrumb>
      <li class="breadcrumb-item"><nuxt-link to="/">Home</nuxt-link></li>
      <li class="breadcrumb-item active" aria-current="page">Dashboard</li>
    </breadcrumb>
    <nuxt-link to="/application/create" class="btn btn-success">Create Application</nuxt-link>
    <h1>
      Applications list
    </h1>
    <div class="row">
      <div v-for="application in applications" class="col-md-4 col-lg-3 col-xl-2 mb-3">
        <nuxt-link :to="{ path: '/application/' + application.app_name}" class="app_btn">
          <div class="app_card btn-secondary">
            <h4>{{ application.app_name }}</h4>
            <img src="/raspberrypi3.svg"/>
            <h3>{{ application.device_type }}</h3>
          </div>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
  import Logo from '~/components/Logo.vue';
  import Breadcrumb from '../../components/Breadcrumb';

  export default {
    components: {
      Breadcrumb,
      Logo
    },
    async asyncData ({ $axios }) {
      let applications = await $axios.get('/api/apps');
      return { applications: applications.data.apps };
    }
  }
</script>

<style>
  .app_card {
    text-align: center;
    border: 1px solid grey;
    border-radius: 5px;
    padding: 30px;
  }

  .app_btn:hover {
    text-decoration: none;
  }
</style>
