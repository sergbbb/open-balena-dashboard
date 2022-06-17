<template>
  <div>
    <breadcrumb>
      <li class="breadcrumb-item"><nuxt-link to="/">Home</nuxt-link></li>
      <li class="breadcrumb-item active" aria-current="page">Application : {{ $route.params.app_name }}</li>
    </breadcrumb>
    <div class="row">
      <div class="col-xl flex-lg-grow-1 flex-xl-grow-0">
        <AppMenu v-bind:app-name="$route.params.app_name"></AppMenu>
      </div>
      <div class="col-md flex-grow-1">
        <h1>
          {{ $route.params.app_name }} : Fleet Configuration
        </h1>
        <h6>Fleet configuration variables used to configure devices running in this application — unless they are overridden with a per-device configuration variable of the same name.</h6>
        <div class="card">
          <table class="table card-table">
            <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="envVar in envVars">
              <td>{{ envVar.name }}</td>
              <td>{{ envVar.value }}</td>
              <td>
                <button class="btn btn-sm"><i class="oi oi-pencil"></i></button>
                <button class="btn btn-sm" v-bind="removeEnvVar(envVar.name)"><i class="oi oi-trash"></i></button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!--{{ configVars }}-->
  </div>
</template>

<script>
  import AppMenu from '~/components/app/AppMenu.vue';
  import Breadcrumb from '../../../components/Breadcrumb';

  export default {
    components: {
      Breadcrumb,
      AppMenu
    },
    async asyncData ({ params, $axios }) {
      let applicationRes = await $axios.get(`/api/app/${params.app_name}`);
      let envVarsRes = await $axios.get(`/api/app/${params.app_name}/envVar/getAll`);
      return { application : applicationRes.data.app, envVars: envVarsRes.data.envVars };

    },
    methods: {
      removeEnvVar: function (varName) {
        console.log(varName);
      }
    }
  }
</script>

<style>

</style>
