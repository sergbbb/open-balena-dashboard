<template>
  <div>
    <breadcrumb>
      <li class="breadcrumb-item"><nuxt-link to="/">Home</nuxt-link></li>
      <li class="breadcrumb-item"><nuxt-link :to="{ path: '/application/' + application.app_name}">Application : {{ application.app_name }}</nuxt-link></li>
      <li class="breadcrumb-item active" aria-current="page">Device : {{ device.device_name }}</li>
    </breadcrumb>
    <div class="row">
      <div class="col-xl flex-lg-grow-1 flex-xl-grow-0">
        <DeviceMenu v-bind:uuid="device.uuid"></DeviceMenu>
      </div>
      <div class="col-xl flex-grow-1">
        <div class="card">
          <div class="card-body">
            <div class="row">
              <div class="col-md-8">
                <h3 class="title">
                  Restart Application
                </h3>
                <p class="blurb">This will restart the application container on device.</p>
              </div>
              <div class="col-md-4">
                <button v-on:click="restartApplication"  class="btn btn-primary float-right" title="Delete application">RESTART APPLICATION</button>
              </div>
            </div>
            <hr/>
            <div class="row">
              <div class="col-md-8">
                <h3 class="title">
                  Move Device
                  <a class="" href="https://www.balena.io/docs/learn/manage/actions/#move-to-another-application"  target="_blank">View docs</a>
                </h3>
                <p class="blurb">Transfer the current device to a different application.</p>
              </div>
              <div class="col-md-4">
                <button v-on:click="showChangeApplicationModal"  class="btn btn-primary float-right" title="Delete application">MOVE TO ANOTHER APPLICATION</button>
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
                <p class="blurb">This will delete all data in /data directory on this device.</p>
              </div>
              <div class="col-md-4">
                <button v-on:click="purgeData"  class="btn btn-warning float-right" title="Delete application">Purge Data ON DEVICE</button>
              </div>
            </div>
            <hr/>
            <div class="row">
              <div class="col-md-8">
                <h3 class="title">
                  Reboot
                  <a class="" href="https://www.balena.io/docs/learn/manage/actions/#reboot"  target="_blank">View docs</a>
                </h3>
                <p class="blurb">This will reboot the device.</p>
              </div>
              <div class="col-md-4">
                <button v-on:click="rebootDevice"  class="btn btn-warning float-right" title="Delete application">Reboot DEVICE</button>
              </div>
            </div>
            <hr/>
            <div class="row">
              <div class="col-md-8">
                <h3 class="title">
                  Shutdown
                  <a class="" href="https://www.balena.io/docs/learn/manage/actions/#shutdown"  target="_blank">View docs</a>
                </h3>
                <p class="blurb">This will shutdown the device.</p>
              </div>
              <div class="col-md-4">
                <button v-on:click="shutdownDevice"  class="btn btn-warning float-right" title="Delete application">Shutdown DEVICE</button>
              </div>
            </div>
            <hr/>

            <div class="row">
              <div class="col-md-8">
                <h3 class="title">
                  Delete Device
                  <a class="" href="https://www.balena.io/docs/learn/manage/actions/#delete-device"  target="_blank">View docs</a>
                </h3>
                <p class="blurb">This will remove this device from the application. Once a device is deleted, you cannot undo it. Please play it safe!</p>
              </div>
              <div class="col-md-4">
                <button v-on:click="deleteDevice"  class="btn btn-danger float-right" title="Delete application">DELETE Device</button>
              </div>
            </div>
            <hr/>
          </div>
        </div>
      </div>
    </div>

    <b-modal v-model="showModal" @ok="handleChangeApplication" title="Move device to application">
      <div class="d-block text-center">
        <b-form-select v-model="newApplicationName" :options="applicationOptions"></b-form-select>
      </div>
    </b-modal>
  </div>
</template>

<script>
  import DeviceMenu from '~/components/device/DeviceMenu.vue';
  import Breadcrumb from '../../../components/Breadcrumb';

  export default {
    components: {
      Breadcrumb,
      DeviceMenu
    },
    data () {
      return {
        showModal: false,
        newApplicationName: null,
        applicationOptions: []
      }
    },
    async asyncData ({ params, $axios }) {
      let deviceRes = await $axios.get(`/api/device/${params.uuid}`);
      let applicationRes = await $axios.get(`/api/app/${parseInt(deviceRes.data.device.belongs_to__application.__id)}`);
      let applications = await $axios.get('/api/apps');
      return {
        device: deviceRes.data.device,
        application: applicationRes.data.app,
        applications: applications.data.apps
      };
    },
    mounted: function() {
      let _this = this;
      this.applications.forEach(function (application) {
        _this.applicationOptions.push({
          value: application.app_name, text: application.app_name
        });
      })
    },
    methods: {
      showChangeApplicationModal: function() {
        this.showModal = true;
      },
      handleChangeApplication: function () {
        let _this = this;
        this.$axios.get(`/api/device/${this.device.uuid}/move`, {params: {applicationNameOrId: this.newApplicationName}}).then(function (result) {
          if(result.data.success) {
            _this.$notify({
              message: 'Application moved successfully !',
              type: 'success'
            });
          } else {
            _this.$notify({
              message: result.data.error.message,
              type: 'warning'
            });
          }
        })
      },
      restartApplication: function () {
        let _this = this;
        if(confirm('Are you sure that you want to restart application at ' + this.device.device_name + ' ?')) {
          this.$axios.get(`/api/device/${this.device.uuid}/restartApplication`).then(function (result) {
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
      purgeData: function () {
        let _this = this;
        if(confirm('Are you sure that you want to restart application at ' + this.device.device_name + ' ?')) {
          this.$axios.get(`/api/device/${this.device.uuid}/purge`).then(function (result) {
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
      rebootDevice: function () {
        let _this = this;
        if(confirm('Are you sure that you want to reboot device ' + this.device.device_name + ' ?')) {
          this.$axios.get(`/api/device/${this.device.uuid}/reboot`).then(function (result) {
            if(result.data.success) {
              _this.$notify({
                message: 'Device rebooted successfully !',
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
      shutdownDevice: function () {
        let _this = this;
        if(confirm('Are you sure that you want to shutdown device ' + this.device.device_name + ' ?')) {
          this.$axios.get(`/api/device/${this.device.uuid}/shutdown`).then(function (result) {
            if(result.data.success) {
              _this.$notify({
                message: 'Device shutdown successfully !',
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
      deleteDevice: function () {
        let _this = this;
        if(confirm('Are you sure that you want to DELETE device ' + this.device.device_name + ' ?')) {
          this.$axios.get(`/api/device/${this.device.uuid}/remove`).then(function (result) {
            if(result.data.success) {
              _this.$notify({
                message: 'Device deleted successfully !',
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
      }
    }
  }
</script>

<style>
  h3 a {
    font-size: small;
  }
</style>
