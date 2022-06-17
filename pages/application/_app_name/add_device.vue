<template>
  <div>
    <breadcrumb>
      <li class="breadcrumb-item"><nuxt-link to="/">Home</nuxt-link></li>
      <li class="breadcrumb-item"><nuxt-link :to="{ path: '/application/' + $route.params.app_name}">Application : {{ application.app_name }}</nuxt-link></li>
      <li class="breadcrumb-item active" aria-current="page">Add Device</li>
    </breadcrumb>
    <h1>
      Add Device
    </h1>
    <div class="card">
      <div class="row card-body">
        <div class="col-xl-6">
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
            <label class="custom-control custom-checkbox">
              <input type="checkbox" class="custom-control-input" v-model="configuration_only">
              <span class="custom-control-label">Download configuration file only</span>
            </label>

            <button v-if="configuration_only" class="btn btn-success" @click.prevent="downloadConfig">Download configuration file</button>
            <button v-else type="submit" class="btn btn-success" @click.prevent="downloadOS" id="download-os-btn">Download balenaOS</button>

            <nuxt-link :to="{ path: '/application/' + $route.params.app_name}" class="btn btn-secondary">Back</nuxt-link>

          </form>
        </div>
        <div class="col-xl-6 mt-lg-3">
          <h5>HowTo install BalenaOS on empty SD card:</h5>
          <ol>
            <li>Use the form on the left to configure and download balenaOS for your new device.</li>
            <li>Write the OS file you downloaded to your SD card. We recommend using <a href="http://www.etcher.io/" target="_blank">Etcher</a>.</li>
            <li>Insert the freshly burnt SD card into the Raspberry Pi 3.</li>
            <li>Connect your Raspberry Pi 3 to the internet, then power it up.</li>
            <li>Your device should appear in your application dashboard within a few minutes. Have fun!</li>
          </ol>
          <br/>
          <h5>HowTo upload only config to SD card with burned BalenaOS:</h5>
          <ol>
            <li>Insert SD card with burned BalenaOs into reader</li>
            <li>Open first partition of SD card</li>
            <li>Copy and Replace your JSON config file into ROOT of partition to config.json file name. </li>
          </ol>
          <br/>
          <h5>HowTo change WiFi config in SD card with burned BalenaOS:</h5>
          <ol>
            <li>Insert SD card with burned BalenaOs into reader</li>
            <li>Open first partition of SD card</li>
            <li>Go to folder 'system-connections'</li>
            <li>It should be txt file with name 'resin-wifi' (without .ignore extension !!!)</li>
            <li>Edit 'resin-wifi' file. In [wifi] section 'ssid' is access point name. In [wifi-security] section 'psk' is access point password.</li>
            <li>Save file.</li>
          </ol>

        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import Breadcrumb from '../../../components/Breadcrumb';

  let downloadCheckInterval = null

  export default {
    components: {Breadcrumb},
    data: function() {
      return {
        configuration_only : false,
        with_wifi : false,
        prod_version : true,
        app_name : '',
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
        device_name_ : getDisplayNameRes.data.deviceTypeName,
        supportedDeviceTypes: supportedDeviceTypes.sort((a, b) => a.name.localeCompare(b.name))
      };
    },
    mounted: function () {
      this.device_name = this.device_name_;
    },
    watch: {
      with_wifi: function (value) {
        this.network = (value === true ? 'wifi' : 'ethernet');
      },
      // device_name: function (deviceTypeName) {
      //   this.$axios.get('/api/device/getDeviceSlug', {params: { deviceTypeName: deviceTypeName}})
      //     .then(response => {
      //       this.device_slug = response.data.deviceTypeSlug;
      //     })
      //     .catch(error => {
      //       console.log(error);
      //     });
      // },
      device_slug: function (deviceSlug) {
        this.$axios.get('/api/os/getSupportedVersions', {params: { deviceType: deviceSlug}})
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
     downloadCheck: function () {
        this.$axios({
          url: '/api/os/downloadCheck',
          method: 'GET',
          params: {
            deviceType: this.device_slug,
            version: this.device_os_version,
          },
        }).then(response => {
          if(response.data.success) {
            if (response.data.status === 'downloaded') {
              clearInterval(downloadCheckInterval)
              document.getElementById('download-os-btn').disabled = false;
              this.$notify({
                message: 'New image was downloaded to server! Please click "Download" button again.',
                type: 'success',
                timeout: 10000
              })
            } else {
              this.$notify({
                message: 'Download still in progress.',
                type: 'info',
              })
            }
          }
        }).catch(error => {
          console.log(error);
        });
      },
      downloadConfig: function () {
        this.$axios({
          url: '/api/os/getConfig',
          method: 'GET',
          params: {
            nameOrId: this.application.app_name,
            version: this.device_os_version,
            network: this.network,
            appUpdatePollInterval: this.appUpdatePollInterval,
            wifiKey: this.wifiKey,
            wifiSsid: this.wifiSsid,
          },
          responseType: 'blob'
        }).then(response => {
          if (!window.navigator.msSaveOrOpenBlob){
            // BLOB NAVIGATOR
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'config.json');
            document.body.appendChild(link);
            link.click();
          } else {
            // BLOB FOR EXPLORER 11
            const url = window.navigator.msSaveOrOpenBlob(new Blob([response.data]),"download.json");
          }
        }).catch(error => {
          console.log(error);
        });
      },
      downloadOS: function () {
        this.$axios({
          url: '/api/os/download',
          method: 'GET',
          params: {
            nameOrId: this.application.app_name,
            version: this.device_os_version,
            network: this.network,
            appUpdatePollInterval: this.appUpdatePollInterval,
            wifiKey: this.wifiKey,
            wifiSsid: this.wifiSsid,
            deviceType: this.device_slug,
          },
        }).then(response => {
          if(response.data.success) {
            if (response.data.status === 'downloading') {
              document.getElementById('download-os-btn').disabled = true;
              this.$notify({
                message: 'New image is downloading to server! Please wait for success message.',
                type: 'success',
                timeout: 10000
              })
              downloadCheckInterval = setInterval(() => {
                this.downloadCheck()
              }, 7000)
            } else if (response.data.status === 'configured') {
              window.open('/api/os/download/' + response.data.os_name + '/' + this.application.app_name, '_blank');
            }
          } else {
            this.$notify({
              message: response.data.err,
              type: 'warning'
            })
          }
        }).catch(error => {
          console.log(error);
        });
      }
    }
  }
</script>

<style>
  .switcher {
    margin-right: 0 !important;
  }
</style>
