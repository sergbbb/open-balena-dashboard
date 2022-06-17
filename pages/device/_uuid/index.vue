<template>
  <div>
    <breadcrumb>
      <li class="breadcrumb-item">
        <nuxt-link to="/">Home</nuxt-link>
      </li>
      <li class="breadcrumb-item">
        <nuxt-link :to="{ path: '/application/' + application.app_name}">Application : {{ application.app_name }}
        </nuxt-link>
      </li>
      <li class="breadcrumb-item active" aria-current="page">Device : {{ device_name }}</li>
    </breadcrumb>
    <div class="row">
      <div class="col-md flex-lg-grow-1 flex-xl-grow-0">
        <DeviceMenu v-bind:uuid="device.uuid"></DeviceMenu>
      </div>
      <div class="col-md flex-grow-1">
        <div class="row">
          <div class="col-lg-12 col-xl-6" :class="logsExpanded ? 'd-none' : ''">
            <div class="card">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label font-weight-bold">Device name: </label>
                      <input class="form-control" v-model.trim="device_name"/>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group text-right">
                      <label class="form-label font-weight-bold">Actions: </label>
                      <br/>
                      <button type="button" class="btn btn-secondary" @click="rebootDevice()"><i
                        class="oi oi-reload"></i> REBOOT
                      </button>
                      <button type="button" class="btn btn-secondary" @click="restartAllServices()"><i
                        class="oi oi-loop-circular"></i> RESTART
                      </button>
                      <button type="button" class="btn btn-default" @click="identifyDevice()"><i class="oi oi-sun"></i>
                      </button>
                    </div>
                  </div>
                  <div class="col-md-4"
                       :title="`Created at: ${new Date(device.created_at).toLocaleString('ru-RU')}\nModified at: ${new Date(device.modified_at).toLocaleString('ru-RU')}`">
                    <label class="form-label font-weight-bold">Status: </label>
                    <div v-if="device.is_online">
                      <div class="badge badge-warning" v-if="device.overall_status==='updating'">Updating: {{ device.overall_progress }}%</div>
                      <div class="badge badge-warning" v-else-if="device.download_progress">Upgrading: {{ device.download_progress }}%</div>
                      <div class="badge badge-success" v-else="">Online</div>
                    </div>
                    <div v-else>
                      <div class="badge badge-danger">Offline</div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label font-weight-bold">UUID: </label>
                    <div>{{ device.uuid.substring(0,7) }}</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label font-weight-bold">Type: </label>
                    <div>{{ getDeviceTypeById(device.is_of__device_type.__id) }}</div>
                  </div>

                </div>
                <hr/>
                <div class="row">
                  <div class="col-md-4 mb-2">
                    <label class="form-label small font-weight-bold">LAST ONLINE: </label>
                    <div>{{ new Date(device.last_vpn_event ).toLocaleString('ru-RU') }}</div>
                  </div>
                  <div class="col-md-4 mb-2">
                    <label class="form-label small font-weight-bold">HOST OS VERSION: </label>
                    <div>
                      <div>{{ device.os_version }}</div>
                      <div>{{ device.os_variant }}</div>
                    </div>
                  </div>
                  <div class="col-md-4 mb-2">
                    <label class="form-label small font-weight-bold">SUPERVISOR VERSION: </label>
                    <div>{{ device.supervisor_version }}</div>
                  </div>
                  <div class="col-md-4 mb-2">
                    <label class="form-label small font-weight-bold">RELEASE: </label>
                    <div>{{ getDeviceRelease() }}</div>
                  </div>
                  <div class="col-md-4 mb-2">
                    <label class="form-label small font-weight-bold">IP ADDRESS: </label>
                    <div>{{ device.ip_address }}</div>
                  </div>
                  <div class="col-md-4 mb-2">
                    <label class="form-label small font-weight-bold">MAC ADDRESSES: </label>
                    <div>{{ device.mac_address }}</div>
                  </div>
                  <div class="col-md-4 mb-2">
                    <label class="form-label small font-weight-bold">CPU: </label>
                    <div>Usage: {{ device.cpu_usage }}%</div>
                    <div>Temp: {{ device.cpu_temp }}℃</div>
                  </div>
                  <div class="col-md-4 mb-2">
                    <label class="form-label small font-weight-bold">MEMORY: </label>
                    <div>Usage: {{ device.memory_usage }}Mb</div>
                    <div>Total: {{ device.memory_total }}Mb</div>
                  </div>
                  <div class="col-md-4 mb-2">
                    <label class="form-label small font-weight-bold">STORAGE: </label>
                    <div>Usage: {{ device.storage_usage }}Mb</div>
                    <div>Total: {{ device.storage_total }}Mb</div>
                  </div>
                  <div class="col-md-12">
                    <div class="form-group">
                      <label class="form-label small font-weight-bold">NOTE: </label>
                      <input class="form-control" v-model.trim="device_note"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="row mt-3">
              <div class="col-md-12">
                <div class="card">
                  <div class="card-body">
                    <h5>Services</h5>
                    <table class="table">
                      <thead class="table-dark">
                      <tr>
                        <th>Service</th>
                        <th>Status</th>
                        <th>Release</th>
                        <th></th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="(service, sevice_name) in device.current_services">
                        <td><h2 class="badge badge-warning text-uppercase">{{ sevice_name }}</h2></td>
                        <td>
                          <span v-if="service[0].status=='exited'"
                                class="badge badge-danger">{{ service[0].status }}</span>
                          <span v-else-if="service[0].status=='Downloading'" class="badge badge-primary">{{ service[0].status }} : {{ service[0].download_progress }}%</span>
                          <span v-else-if="service[0].status=='Stopping'" class="badge badge-warning">{{ service[0].status }}</span>
                          <span v-else="" class="badge badge-success">{{ service[0].status }}</span>

                        </td>
                        <td>{{ service[0].commit.substring(0,7) }}</td>
                        <td>
                          <button v-if="service[0].status!='Running'" title="Start service" type="button" class="btn"><i
                            class="oi oi-media-play" @click="startService(service[0].image_id)"></i></button>
                          <button v-if="service[0].status=='Running'" title="Stop service" type="button" class="btn"><i
                            class="oi oi-media-stop" @click="stopService(service[0].image_id)"></i></button>
                          <button type="button" class="btn" title="Restart service"><i class="oi oi-loop-circular"
                                                               @click="restartService(service[0].image_id)"></i>
                          </button>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div class="col-lg-12" :class="logsExpanded ? 'col-lg-12' : ' col-xl-6'">
            <div>
              <div class="form-group row">
                <div class="col-md-1 expandLogsButton">
                  <button type="button" @click="logsExpanded=!logsExpanded" class="btn btn-primary"
                          title="Expand/Minimize">
                    <i class="oi" :class="logsExpanded ? 'oi-fullscreen-exit' : 'oi-fullscreen-enter'"></i>
                  </button>
                </div>
                <label class="col-form-label col-md-3 text-sm-right">Log lines qty:</label>
                <div class="col-md-2">
                  <input type="number" v-model.lazy="logsQty" class="form-control" placeholder="">
                </div>

                <label class="col-form-label col-md-4 text-sm-right">Update interval:</label>
                <div class="col-md-2">
                  <input type="number" v-model.lazy="logsInterval" class="form-control" placeholder="">
                </div>
              </div>
            </div>
            <div :class="`logs ${logsExpanded ? ' expanded ' : ''}`" ref="LogDiv">
              <div v-for="log in logs" :class="(log.isSystem ? 'isSystem' : '') + (log.isStdErr ? ' isStdErr' : '')">
                {{ log.message }}
              </div>
            </div>
            <div :class="`mt-5 ${logsExpanded ? ' d-none ' : ''}`">
              <b-nav tabs>
                <b-nav-item v-for="(connection, index) in shhConnections" @click="showSSHIndex=index" :active="showSSHIndex===index">{{ index }}</b-nav-item>
                <b-nav-item @click="startSSH()"><i class="oi oi-plus"></i> SSH</b-nav-item>
              </b-nav>
              <div class="ssh">
                <div v-if="showSSHIndex !== null" v-for="msg in shhConnections[showSSHIndex]">
                  {{ msg }}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>

  import Breadcrumb from '../../../components/Breadcrumb';
  const _ = require('lodash');

  import DeviceMenu from '~/components/device/DeviceMenu.vue';

  export default {
    components: {
      Breadcrumb,
      DeviceMenu
    },
    watch: {
      device_name: _.debounce(function () {
        this.updateDeviceName();
      }, 3000),
      device_note: _.debounce(function () {
        this.updateDeviceNote();
      }, 3000),
      logsQty() {
        this.updateLogs();
      },
      logsInterval(newValue) {
        clearInterval(this.updateLogsInterval);
        this.updateLogsInterval = setInterval(() => {
          this.updateLogs();
        }, newValue * 1000);
      }
    },
    data: function () {
      return {
        socket: null,
        shhConnections: [],
        showSSHIndex: null,
        msg: 'wwJd',
        resps: '',
        device: {},
        logs: {},
        msgs: [],
        logsQty: 50,
        logsInterval: 10,
        logsExpanded: false,
        device_name: '',
        device_note: '',
      }
    },
    async asyncData({params, $axios}) {
      let deviceRes = await $axios.get(`/api/device/${params.uuid}`);
      let applicationRes = await $axios.get(`/api/app/${parseInt(deviceRes.data.device.belongs_to__application.__id)}`);
      let supportedDeviceTypesRes = await $axios.get('/api/deviceType/getAll');
      let releasesRes = await $axios.get(`/api/release/getAllByApplication`, {params:{nameOrId: parseInt(deviceRes.data.device.belongs_to__application.__id)}});
      const releases = {}
      releasesRes.data.releases.forEach(release => {
        releases[release.id] = release.commit.substring(0,7)
      })

      return {
        releases,
        device: deviceRes.data.device,
        device_name: deviceRes.data.device.device_name,
        device_note: deviceRes.data.device.note,
        application: applicationRes.data.app,
        supportedDeviceTypes: supportedDeviceTypesRes.data.deviceTypes
      };
    },


    methods: {
      getDeviceTypeById(id) {
        const found = this.supportedDeviceTypes.find(d => d.id === id)
        return found ? found.name : '-'
      },
      getDeviceRelease() {
        const releaseId = this.device.is_running__release ? this.device.is_running__release.__id : 'none'
        return this.releases.hasOwnProperty(releaseId)
          ? this.releases[releaseId] : '-'
      },

      identifyDevice() {
        let _this = this;
        this.$axios.get(`/api/device/${this.device.uuid}/identify`).then(function () {
          _this.$notify({
            message: 'Identify started successfully!',
            type: 'success'
          })
        });
      },
      startSSH() {
        if (this.socket) {
          const cid = this.shhConnections.length
          this.socket.emit('startSSH', {uuid: this.device.uuid, cid: cid})
          this.$set(this.shhConnections, cid, [])
          this.showSSHIndex = cid
        }
      },
      stopSSH() {
        if (this.socket) {
          this.socket.emit('stopSSH', {uuid: this.device.uuid})
        }
      },
      rebootDevice() {
        let _this = this;
        this.$axios.get(`/api/device/${this.device.uuid}/reboot`).then(function () {
          _this.$notify({
            message: 'Device is rebooting!',
            type: 'success'
          })
        });
      },
      startService(imageId) {
        let _this = this;
        this.$axios.get(`/api/device/${this.device.uuid}/startService`, {params: {imageId: imageId}}).then(function () {
          _this.$notify({
            message: 'Service started successfully!',
            type: 'success'
          })
        });
      },
      stopService(imageId) {
        let _this = this;
        this.$axios.get(`/api/device/${this.device.uuid}/stopService`, {params: {imageId: imageId}}).then(function () {
          _this.$notify({
            message: 'Service stopped successfully!',
            type: 'success'
          })
        });
      },
      restartService(imageId) {
        let _this = this;
        this.$axios.get(`/api/device/${this.device.uuid}/restartService`, {params: {imageId: imageId}}).then(function () {
          _this.$notify({
            message: 'Service restarted successfully!',
            type: 'success'
          })
        });
      },
      restartAllServices() {
        let services = {...this.device.current_services}
        for (const [service_name, service] of Object.entries(services)) {
          this.restartService(service[0].image_id)
        }
      },
      updateLogs() {
        let _this = this;
        this.$axios.get(`/api/logs/history/${this.device.uuid}`, {params: {count: this.logsQty}}).then(function (result) {
          _this.logs = result.data.lines;
        });
      },
      updateDevice() {
        let _this = this;
        this.$axios.get(`/api/device/${this.device.uuid}`).then(function (result) {
          _this.device = result.data.device;
        });
      },
      updateDeviceName() {
        let _this = this;
        this.$axios.get(`/api/device/${this.device.uuid}/rename`, {params: {NewName: this.device_name}}).then(function () {
          _this.$notify({
            message: 'Renamed successfully!',
            type: 'success'
          })
        });
      },
      updateDeviceNote() {
        let _this = this;
        this.$axios.get(`/api/device/${this.device.uuid}/note`, {params: {note: this.device_note}}).then(function () {
          _this.$notify({
            message: 'Note added successfully!',
            type: 'success'
          })
        });
      }
    },

    updateLogsInterval: null,
    updateDeviceInterval: null,

    mounted() {
      this.$axios.$get('/ws/init')
        .then(resp => {
          this.socket = io()
          this.socket.on('msg', (msg, data) => {
            const cid = data.cid
            this.shhConnections[cid]
            this.$set(this.shhConnections, cid, [...this.shhConnections[cid], msg])
          })
        })

      this.updateLogs();
      this.updateLogsInterval = setInterval(() => {
        this.updateLogs();
      }, this.logsInterval * 1000);

      this.updateDeviceInterval = setInterval(() => {
        this.updateDevice();
      }, 30000);

      setTimeout(() => {
        this.$refs.LogDiv.scrollTop = this.$refs.LogDiv.scrollHeight;
      }, 500)
    },

    destroyed() {
      if (this.socket) {
        this.socket.emit('stopSSH', {uuid: this.device.uuid})
      }
      clearInterval(this.updateLogsInterval);
      clearInterval(this.updateDeviceInterval);
    }
  }
</script>

<style>

  .ssh {
    background-color: black;
    font-size: 16px;
    color: green;
    border-radius: 5px;
    padding: 10px;
    height: 36vh;
    min-height: 354px;
    overflow-y: scroll;
  }

  .logs {
    /*display: flex;*/
    /*flex-direction: column-reverse;*/
    background-color: black;
    font-size: 16px;
    color: green;
    border-radius: 5px;
    padding: 10px;
    height: 36vh;
    min-height: 354px;
    overflow-y: scroll;
  }

  .logs.expanded {
    height: 80vh;
    min-height: 80vh;
  }

  .logs .isSystem {
    color: #0c85d0;
  }

  .logs .isStdErr {
    color: red;
  }

  @media (max-width: 1024px) {
    .expandLogsButton {
      display: none;
    }
  }

</style>
