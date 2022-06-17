<template>
  <div>
    <breadcrumb>
      <li class="breadcrumb-item"><nuxt-link to="/">Home</nuxt-link></li>
      <li class="breadcrumb-item"><nuxt-link :to="{ path: '/application/' + $route.params.app_name}">Application : {{ application.app_name }}</nuxt-link></li>
      <li class="breadcrumb-item active" aria-current="page">Add Device</li>
    </breadcrumb>
    <h1>
      Register Device / Get migration script
    </h1>
    <div class="card">
      <div class="row card-body">
        <div class="col-md-6">
          <form>
            <div class="form-group">
              <label class="form-label">ENTER DEVICE UUID</label>
              <input type="text" class="form-control" v-model.lazy="deviceUUID">
            </div>
            <button v-if="!deviceUUIDRegistered" class="btn btn-success" @click.prevent="registerDevice">Register</button>
          </form>
        </div>
        <div class="col-md-6">
          <div v-if="deviceUUIDRegistered">
            <h4>Generate Migration Script</h4>

            <form>
              <div class="form-group">
                <label class="form-label">Select Device Type</label>
                <select class="form-control" v-model="device_slug">
                  <option v-for="supportedDeviceType in supportedDeviceTypes" v-bind:value="supportedDeviceType.slug">{{ supportedDeviceType.name }}</option>
                </select>
              </div>
              <div class="form-row">
                <div class="form-group col-md-6">
                  <label class="form-label">SELECT EDITION</label>
                  <br/>
                  <span class="small">Development</span>
                  <label class="switcher">
                    <input type="checkbox" class="switcher-input" v-model="prod_version">
                    <span class="switcher-indicator">
                                        <span class="switcher-yes"></span>
                                        <span class="switcher-no"></span>
                                      </span>
                  </label>
                  <span class="small">Production</span>
                  <br/>
                  <br/>
                  <span v-if="prod_version" class="small">Production images are ready for production deployments, but don't offer easy access for local development.</span>
                  <span v-else  class="small">
                            <strong>Development images</strong> should be used when you are developing an application and want to use the fast <a href="https://balena.io/docs/development/local-mode/" target="_blank">local mode</a> workflow.
                                              <br><strong>This variant should never be used in production.</strong>
                          </span>
                </div>
                <div v-if="prod_version" class="form-group col-md-6">
                  <label class="form-label">Select OS Version</label>
                  <select class="form-control" v-model="device_os_version">
                    <option v-for="device_os_version in device_os_versions_prod">{{ device_os_version }}</option>
                  </select>
                </div>
                <div v-else class="form-group col-md-6">
                  <label class="form-label">Select OS Version</label>
                  <select class="form-control" v-model="device_os_version">
                    <option v-for="device_os_version in device_os_versions_dev">{{ device_os_version }}</option>
                  </select>
                </div>
              </div>



              <hr/>
              <div class="text-light small font-weight-semibold mb-3">NETWORK CONNECTION</div>
              <div class="form-group">
                <span class="small">Ethernet Only</span>
                <label class="switcher">
                  <input type="checkbox" class="switcher-input" v-model="with_wifi">
                  <span class="switcher-indicator">
                                    <span class="switcher-yes"></span>
                                    <span class="switcher-no"></span>
                                  </span>
                </label>
                <span class="small">Wifi + Ethernet</span>
              </div>

              <div v-if="with_wifi" class="form-row">
                <div class="form-group col-md-6">
                  <label class="form-label">WIFI SSID</label>
                  <input type="text" class="form-control" v-model="wifiSsid">
                </div>
                <div class="form-group col-md-6">
                  <label class="form-label">WIFI PASSPHRASE</label>
                  <input type="text" class="form-control" v-model="wifiKey">
                </div>
              </div>
              <hr/>
              <div class="text-light small font-weight-semibold mb-3">ADVANCED</div>
              <div class="form-row">
                <div class="form-group col-md-6">
                  <label class="form-label">CHECK FOR UPDATES EVERY X MINUTES</label>
                  <input type="text" class="form-control" v-model="appUpdatePollInterval">
                </div>
                <div class="form-group col-md-6">

                </div>
              </div>

              <button v-if="deviceUUIDRegistered" class="btn btn-success" @click.prevent="getScript">Show Migration Script</button>

            </form>

            <br/>
            <br/>
            <br/>
            <pre v-if="showScript && deviceUUID">
os-config join '{{ JSON.stringify(config_json) }}' \
&& sleep 5 \
&& balena stop $(balena ps -a -q) \
&& sleep 5 \
&& balena rm $(balena ps -a -q) --force \
&& sleep 5 \
&& systemctl start resin-supervisor \
&& sleep 10 \
&& reboot &
</pre>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import Breadcrumb from '../../../components/Breadcrumb';
  export default {
    components: {Breadcrumb},
    data: function() {
      return {
        deviceUUID: '',
        deviceUUIDRegistered: false,
        showScript: false,

        with_wifi : false,
        prod_version : true,
        device_name : '',
        device_name_ : '',
        device_slug : '',
        device_os_versions_dev : '',
        device_os_versions_prod : '',
        device_os_version : '',
        network : 'ethernet',
        wifiSsid : '',
        wifiKey : '',
        appUpdatePollInterval : 10,

        config_json: ''
      }
    },
    async asyncData ({ params, $axios }) {
      let applicationRes = await $axios.get(`/api/app/${params.app_name}`);
      let supportedDeviceTypesRes = await $axios.get('/api/deviceType/getAll');
      let supportedDeviceTypes = supportedDeviceTypesRes.data.deviceTypes.filter(type => {
        return type.name.includes('Balena') || type.name.includes('Intel NUC') || type.name.includes('Raspberry') || type.name.includes('Nvidia Jetson TX2')
      });
      let getDisplayNameRes = await $axios.get('/api/device/getDisplayName', {params: {deviceTypeSlug: applicationRes.data.app.device_type}});

      return {
        application : applicationRes.data.app,
        supportedDeviceTypes: supportedDeviceTypes.sort((a, b) => a.name.localeCompare(b.name)),
        device_name_ : getDisplayNameRes.data.deviceTypeName,
      };
    },
    mounted: function () {
      this.device_name = this.device_name_;
    },
    watch: {
      deviceUUID(uuid) {
        this.$axios.get('/api/device/' + uuid + '/has')
          .then(response => {
            if(response.data.hasDevice) {
              this.deviceUUIDRegistered = true;
            } else {
              this.deviceUUIDRegistered = false;
              this.$notify({
                message: 'This device is not registered yet!',
                type: 'warning'
              });
            }
          }).catch(error => { console.log(error); });
      },
      with_wifi: function (value) {
        this.network = (value === true ? 'wifi' : 'ethernet');
      },
      device_name: function (deviceTypeName) {
        this.$axios.get('/api/device/getDeviceSlug', {params: { deviceTypeName: deviceTypeName}})
          .then(response => {
            this.device_slug = response.data.deviceTypeSlug;
          })
          .catch(error => {
            console.log(error);
          });
      },
      device_slug: function (deviceType) {
        this.$axios.get('/api/os/getSupportedVersions', {params: { deviceType: deviceType}})
          .then(response => {
            this.device_os_versions_dev = response.data.osVersions.versions.filter(function (version) {
              return version.includes('.dev');
            });
            this.device_os_versions_prod = response.data.osVersions.versions.filter(function (version) {
              return version.includes('.prod');
            });
            this.device_os_version = response.data.osVersions.default;
          })
          .catch(error => {
            console.log(error);
          });
      }
    },
    methods: {
      getScript () {
        let _this = this;
        this.$axios({
          url: '/api/os/getConfigForDevice',
          method: 'GET',
          params: {
            nameOrId: this.application.app_name,
            uuid: this.deviceUUID,
            version: this.device_os_version,
            network: this.network,
            appUpdatePollInterval: this.appUpdatePollInterval,
            wifiKey: this.wifiKey,
            wifiSsid: this.wifiSsid,
          },
          // responseType: 'blob'
        }).then(response => {

          _this.config_json = response.data;
          this.showScript = true;
        }).catch(error => {
          console.log(error);
        });


      },
      registerDevice() {
        this.$axios.get(`/api/device/${this.deviceUUID}/register`, {params: {appName: this.application.app_name}}).then((result) => {
          if(result.data.success) {
            this.deviceUUIDRegistered = true;
            this.$notify({
              message: 'Device registered successfully !',
              type: 'success'
            });
          } else {
            this.$notify({
              message: 'Error',
              type: 'warning'
            });
          }
        })
      }
    }
  }
</script>

<style>
  .switcher {
    margin-right: 0 !important;
  }
</style>
