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
          Application : {{ $route.params.app_name }}
        </h1>

        <div class="card">
          <div class="card-body">

            <table class="table card-table">
              <thead>
              <tr>
                <th>ID</th>
                <th>Deployment</th>
                <th>Release</th>
                <th>Completed</th>
                <th>Build Duration</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(release, index) in releases">
                <td>{{ release.id }}</td>
                <td>
                  <span v-if="release.status=='success'" class="badge badge-success">{{ release.status }}</span>
                  <span v-else="" class="badge badge-warning">{{ release.status }}</span>
                </td>
                <td>{{ release.commit.substring(0,7) }}</td>
                <td>{{ new Date(release.created_at).toLocaleString() }}</td>
                <td>{{ ((new Date(release.end_timestamp).getTime()) - (new Date(release.start_timestamp).getTime()))/1000 }} s</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
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
      let releasesRes = await $axios.get(`/api/release/getAllByApplication`, {params:{nameOrId: params.app_name}});
      return { application : applicationRes.data.app, releases: releasesRes.data.releases};

    },
  }
</script>
