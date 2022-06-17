<template>
  <div>
    <breadcrumb>
      <li class="breadcrumb-item">
        <nuxt-link to="/">Home</nuxt-link>
      </li>
      <li class="breadcrumb-item active" aria-current="page">Application : {{ $route.params.app_name }}</li>
    </breadcrumb>
    <div class="row">
      <div class="col-md-12 col-lg flex-lg-grow-1 flex-xl-grow-0">
        <AppMenu v-bind:app-name="$route.params.app_name"></AppMenu>
      </div>
      <div class="col-md-12 col-lg flex-grow-1">
        <h1 class="appName">
          Application : {{ $route.params.app_name }}
        </h1>
        <div class="mt-3 mb-3 d-flex align-items-center flex-wrap">
          <div>
            <nuxt-link :to="{ path: '/application/' + $route.params.app_name + '/add_device'}"
                       class="btn btn-md btn-success"><i class="oi oi-plus"></i>&nbsp;&nbsp;Add Device
            </nuxt-link>
          </div>
          <input v-model="deviceSearch" type="text" class="form-control d-inline-block w-auto ml-3" placeholder="Search by name"/>
          <div class="registerDevice">
            <nuxt-link :to="{ path: '/application/' + $route.params.app_name + '/register_device'}"
                       class="btn btn-md btn-primary">Register Device
            </nuxt-link>
          </div>
        </div>

        <b-card>
          <div class="table-responsive">
            <table class="table card-table">
              <thead>
              <tr>
                <th></th>
                <th>Status <i class="oi text-info cursor-pointer" :class="getOrderByIconClass('status')" @click="changeOrderBy('status')"></i></th>
                <th>Name <i class="oi text-info cursor-pointer" :class="getOrderByIconClass('device_name')" @click="changeOrderBy('device_name')"></i></th>
                <th>Last Seen <i class="oi text-info cursor-pointer" :class="getOrderByIconClass('last_vpn_event')" @click="changeOrderBy('last_vpn_event')"></i></th>
                <th>UUID</th>
                <th>OS Version <i class="oi text-info cursor-pointer" :class="getOrderByIconClass('os_version')" @click="changeOrderBy('os_version')"></i></th>
                <th>OS Variant <i class="oi text-info cursor-pointer" :class="getOrderByIconClass('os_variant')" @click="changeOrderBy('os_variant')"></i></th>
                <th>Super Visor <i class="oi text-info cursor-pointer" :class="getOrderByIconClass('supervisor_version')" @click="changeOrderBy('supervisor_version')"></i></th>
                <th>IP Address</th>
                <th>Release</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(device, index) in sortedDevices">
                <td>{{ index + 1 }}</td>
                <td>
                  <div v-if="device.is_online">
                    <div class="badge badge-warning" v-if="device.overall_status==='updating'">Updating: {{ device.overall_progress }}%</div>
                    <div class="badge badge-warning" v-else-if="device.download_progress">Upgrading: {{ device.download_progress }}%</div>
                    <div class="badge badge-success" v-else="">Online</div>
                  </div>
                  <div v-else>
                    <div class="badge badge-danger">Offline</div>
                  </div>
                </td>
                <td>
                  <nuxt-link :to="{ path: '/device/' + device.uuid}" class="app_btn">{{ device.device_name }}</nuxt-link>
                </td>
                <td>{{ new Date(device.last_vpn_event ).toLocaleString('ru-RU') }}</td>
                <td><nuxt-link :to="{ path: '/device/' + device.uuid}" class="app_btn">{{ device.uuid.substring(0,7) }}</nuxt-link></td>
                <td>{{ device.os_version }}</td>
                <td>{{ device.os_variant }}</td>
                <td>{{ device.supervisor_version }}</td>
                <td>{{ device.ip_address }}</td>
                <td>{{ getDeviceRelease(device) }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </b-card>
      </div>
    </div>

    {{ deviceSearch }}

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
    data() {
      return {
        deviceSearch: '',
        devices: [],
        releases: {},
        orderBy: 'device_name',
        orderWay: 'asc',

        updateDevicesInterval: null,
      }
    },
    async asyncData({params, $axios}) {
      let applicationRes = await $axios.get(`/api/app/${params.app_name}`)
      return {application: applicationRes.data.app}
    },

    computed: {
      sortedDevices() {
        let devices = [...this.devices]

        if (this.deviceSearch !== '') {
          devices = devices.filter((device) => {
            return device.device_name.toLowerCase().indexOf(this.deviceSearch.toLowerCase()) !== -1
          })
        }

        devices.sort((a, b) => {
          if (a[this.orderBy] > b[this.orderBy]) { return 1 }
          if (a[this.orderBy] < b[this.orderBy]) { return -1 }
          return 0
        });

        if(this.orderWay === 'dsc') {
          devices.reverse()
        }

        return devices
      }
    },

    methods: {
      getDeviceRelease(device) {
        const releaseId = device.is_running__release ? device.is_running__release.__id : 'none'
        return this.releases.hasOwnProperty(releaseId)
          ? this.releases[releaseId] : '-'
      },

      getOrderByIconClass(orderBy) {
        return orderBy === this.orderBy && this.orderWay === 'dsc' ? 'oi-sort-descending' : 'oi-sort-ascending'
      },

      async updateReleases() {
        let releasesRes = await this.$axios.get(`/api/release/getAllByApplication`, {params:{nameOrId: this.application.app_name}});
        const releases = {}
        releasesRes.data.releases.forEach(release => {
          releases[release.id] = release.commit.substring(0,7)
        })
        this.releases = releases
      },

      async updateDevices() {
        let releasesRes = await this.$axios.get(`/api/app/${this.application.app_name}/devices`)
        this.devices = releasesRes.data.devices
      },

      changeOrderBy(orderBy) {
        if(orderBy === this.orderBy) {
          this.orderWay = this.orderWay === 'asc' ? 'dsc' : 'asc'
          return true
        }

        [this.orderWay, this.orderBy] = ['asc', orderBy]
      }
    },



    mounted() {
      this.updateReleases()
      this.updateDevices()

      this.updateDevicesInterval = setInterval(async () => {
        await this.updateReleases()
        await this.updateDevices()
      }, 15000)
    },
    destroyed: function () {
      clearInterval(this.updateDevicesInterval)
    }
  }
</script>

<style>

  .registerDevice {
    margin-left: auto;
  }

  @media (max-width: 420px) {
    .appName {
      font-size: 22px !important;
    }

    .registerDevice {
      margin-left: unset;
    }
  }

</style>
