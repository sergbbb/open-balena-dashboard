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
            <div class="row">
              <div class="col-md-8">
                <h3 class="title">
                  Restart Application
                  <a href="https://www.balena.io/docs/learn/manage/actions/#restart-application"  target="_blank">View docs</a>
                </h3>
                <p class="blurb">This will restart the application container on all devices.</p>
              </div>
              <div class="col-md-4">
                <button v-on:click="restartApplication"  class="btn btn-primary float-right">RESTART APPLICATION</button>
              </div>
            </div>
            <hr/>



            <br/>
            <br/>
            <br/>
            <h2 class="text-danger">DANGEROUS ACTIONS</h2>
            <hr/>
            <div class="row">
              <div class="col-md-8">
                <h3 class="title">
                  Purge Data
                  <a class="" href="https://www.balena.io/docs/learn/manage/actions/#purge-data"  target="_blank">View docs</a>
                </h3>
                <p class="blurb">This will delete all data in /data directory on all devices.</p>
              </div>
              <div class="col-md-4">
                <button v-on:click="purgeDevicesData"  class="btn btn-warning float-right">Purge Data ON ALL DEVICES</button>
              </div>
            </div>
            <hr/>
            <div class="row">
              <div class="col-md-8">
                <h3 class="title">
                  Reboot
                  <a class="" href="https://www.balena.io/docs/learn/manage/actions/#reboot"  target="_blank">View docs</a>
                </h3>
                <p class="blurb">This will reboot all devices.</p>
              </div>
              <div class="col-md-4">
                <button v-on:click="rebootDevices"  class="btn btn-warning float-right">Reboot ALL DEVICES</button>
              </div>
            </div>
            <hr/>
            <div class="row">
              <div class="col-md-8">
                <h3 class="title">
                  Shutdown
                  <a class="" href="https://www.balena.io/docs/learn/manage/actions/#shutdown"  target="_blank">View docs</a>
                </h3>
                <p class="blurb">This will shutdown all devices.</p>
              </div>
              <div class="col-md-4">
                <button v-on:click="shutdownDevices"  class="btn btn-warning float-right">Shutdown ALL DEVICES</button>
              </div>
            </div>
            <hr/>

            <div class="row">
              <div class="col-md-8">
                <h3 class="title">
                  Delete Application
                  <a class="" href="https://www.balena.io/docs/learn/manage/actions/#delete-application"  target="_blank">View docs</a>
                </h3>
                <p class="blurb">Once you delete this application, you cannot undo. Please be safe.</p>
              </div>
              <div class="col-md-4">
                <button v-on:click="deleteApplication"  class="btn btn-danger float-right">REMOVE APPLICATION</button>
              </div>
            </div>
            <hr/>
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
      return { application : applicationRes.data.app };

    },
    methods: {
      removeApplication: function (event) {
        if (confirm('Are you sure, that you want remove application : ' + this.application.app_name + ' ?')) {
          this.$router.push({
            path: '/application/' + this.application.app_name + '/remove'
          })
        }
      },
      restartApplication: function () {
        let _this = this;
        if(confirm('Are you sure that you want to restart application ' + this.application.app_name + ' ?')) {
          this.$axios.get(`/api/app/${this.application.app_name}/restart`).then(function (result) {
            if(result.data.success) {
              _this.$notify({
                message: 'Application restarted successfully !',
                type: 'success'
              });
            } else {
              _this.$notify({
                message: result.data.error.message,
                type: 'warning'
              });
            }
          })
        }
      },
      purgeDevicesData: function () {
        let _this = this;
        if(confirm('Are you sure that you want to purge data on all devices in application ' + this.application.app_name + ' ?')) {
          this.$axios.get(`/api/app/${this.application.id}/purge`).then(function (result) {
            if(result.data.success) {
              _this.$notify({
                message: 'Application restarted successfully !',
                type: 'success'
              });
            } else {
              _this.$notify({
                message: result.data.error.message,
                type: 'warning'
              });
            }
          })
        }
      },
      rebootDevices: function () {
        let _this = this;
        if(confirm('Are you sure that you want to reboot all devices in application ' + this.application.app_name + ' ?')) {
          this.$axios.get(`/api/app/${this.application.id}/reboot`).then(function (result) {
            if(result.data.success) {
              _this.$notify({
                message: 'Devices rebooted successfully !',
                type: 'success'
              });
            } else {
              _this.$notify({
                message: result.data.error.message,
                type: 'warning'
              });
            }
          })
        }
      },
      shutdownDevices: function () {
        let _this = this;
        if(confirm('Are you sure that you want to shutdown all devices in application ' + this.application.app_name + ' ?')) {
          this.$axios.get(`/api/app/${this.application.id}/shutdown`).then(function (result) {
            if(result.data.success) {
              _this.$notify({
                message: 'Devices shutdown successfully !',
                type: 'success'
              });
            } else {
              _this.$notify({
                message: result.data.error.message,
                type: 'warning'
              });
            }
          })
        }
      },
      deleteApplication: function () {
        if(confirm('Are you sure that you want to DELETE application ' + this.application.app_name + ' ?')) {
          if(confirm('Attention!!!\n\n\n\nAre you sure that you want to DELETE application ' + this.application.app_name + ' ?\n\n\n\nThis will destroy all data!')) {
            this.$axios.get(`/api/app/${this.application.app_name}/remove`).then((result) => {
              if(result.data.success) {
                this.$notify({
                  message: 'Application deleted successfully !',
                  type: 'success'
                });
                setTimeout(() => { this.$router.push({path: '/'}) }, 3000);
              } else {
                this.$notify({
                  message: result.data.error.message,
                  type: 'warning'
                });
              }
            })
          }
        }
      }
    }
  }
</script>

<style>
  h3 a {
    font-size: small;
  }
</style>
