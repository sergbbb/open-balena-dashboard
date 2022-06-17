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
      <li class="breadcrumb-item active" aria-current="page">Device : {{ device.device_name }}</li>
    </breadcrumb>
    <div class="row">
      <div class="col-lg flex-lg-grow-1 flex-xl-grow-0">
        <DeviceMenu v-bind:uuid="device.uuid"></DeviceMenu>
      </div>
      <div class="col-lg flex-grow-1">
        <h1>
          {{ device.device_name }} : Device Service Variables
        </h1>
        <h6>Device service variables are available to the code running on the specified service on this particular
          device. If both the application and the device have a service variable of the same name and service, the code
          on this device will see the value of the per-device service variables. In other words, per-device service
          variables redefine (or override) application-wide service variables of the same name and service.</h6>
        <div v-if="services.length" class="card">
          <table class="table card-table">
            <thead>
            <tr>
              <th>Service</th>
              <th>Name</th>
              <th>Whole fleet</th>
              <th>{{ device.device_name }}(current device)</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(appServiceVar, index) in appServiceVars">
              <td>
                <div :class="'badge badge-'+ servicesColorMap[appServiceVar.service.__id] + ' text-uppercase'">
                  {{ servicesMap[appServiceVar.service.__id] }}
                </div>
              </td>
              <td>{{ appServiceVar.name }}</td>
              <td>{{ appServiceVar.value }}</td>
              <td>{{ hasDeviceValue(appServiceVar.name) ? 'Yes' : 'No'  }}</td>
              <td>
                <span v-if="hasDeviceValue(appServiceVar.name)">
                  <button class="btn btn-sm" @click="editConfigVar(appServiceVar.service.__id, appServiceVar.name, index)"><i
                    class="oi oi-pencil"></i>
                  </button>
                  <button class="btn btn-sm" @click="removeServiceVar(appServiceVar.service.__id, appServiceVar.name, index)"><i
                    class="oi oi-trash"></i>
                  </button>
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <select v-model="newVarServiceId" class="form-control">
                  <option v-for="(nService, index) in services" :value="nService.id">{{ nService.service_name }}
                  </option>
                </select>
              </td>
              <td><input type="text" class="form-control" v-model="newVarName"/></td>
              <td></td>
              <td><input type="text" class="form-control" v-model="newVarValue"/></td>
              <td>
                <button class="btn btn-sm" @click="setServiceVar()"><i class="oi oi-plus"></i></button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <div v-else="" class="card">
          <div class="card-body">
            There are no any installed services. Please push some code to this app.
          </div>
        </div>

        <div class="card d-none">
          <table class="table card-table">
            <thead>
            <tr>
              <th>Service</th>
              <th>Name</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(serviceVar, index) in serviceVars">
              <td><span class="badge badge-warning">MAIN</span></td>
              <td>{{ serviceVar.name }}</td>
              <td>{{ serviceVar.value }}</td>
              <td>
                <button class="btn btn-sm" @click="editConfigVar(serviceVar.name, index)"><i class="oi oi-pencil"></i>
                </button>
                <button class="btn btn-sm" @click="removeServiceVar(serviceVar.name, index)"><i class="oi oi-trash"></i>
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <select v-model="newVarServiceId" class="form-control" required>
                  <option v-for="(service, sevice_name) in device.current_services"
                          v-bind:value="service[0].service_id">{{ sevice_name }}
                  </option>
                </select>
              </td>
              <td><input type="text" class="form-control" v-model="newVarName" required/></td>
              <td><input type="text" class="form-control" v-model="newVarValue" required/></td>
              <td>
                <button class="btn btn-sm" @click="setServiceVar"><i class="oi oi-plus"></i></button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
    <b-modal v-model="showModal" @ok="handleEditConfigVar" :title="'Config variable: ' + editVarName">
      <div class="d-block text-center">
        <b-form-input v-model="editVarValue" placeholder="Enter your name"></b-form-input>
      </div>
    </b-modal>

    <!--{{ serviceVars }}-->
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
    data: function () {
      return {
        newVarServiceId: '',
        newVarName: '',
        newVarValue: '',
        editServiceId: null,
        editVarIndex: null,
        editVarName: null,
        editVarValue: null,
        showModal: false
      }
    },
    async asyncData({params, $axios}) {
      const colorClasses = ['primary', 'secondary', 'success', 'warning', 'info', 'dark'];
      let servicesMap = {};
      let servicesColorMap = {};
      let serviceVarsMap = {};

      let deviceRes = await $axios.get(`/api/device/${params.uuid}`);

      let serviceVarsRes = await $axios.get(`/api/device/${params.uuid}/serviceVar/getAll`);
      let serviceVars = serviceVarsRes.data.serviceVars;
      serviceVars.forEach((currentValue) => {
        serviceVarsMap[currentValue.name] = currentValue;
      });

      let applicationRes = await $axios.get(`/api/app/${parseInt(deviceRes.data.device.belongs_to__application.__id)}`);

      let servicesRes = await $axios.get(`/api/app/${applicationRes.data.app.app_name}/services`);
      const services = servicesRes.data.services;
      services.forEach((currentValue, index) => {
        servicesMap[currentValue.id] = currentValue.service_name;
        servicesColorMap[currentValue.id] = colorClasses[index];
      });

      let appServiceVarsRes = await $axios.get(`/api/app/${applicationRes.data.app.app_name}/serviceVar/getAll`);

      return {
        device: deviceRes.data.device,
        services: services,
        servicesMap: servicesMap,
        servicesColorMap: servicesColorMap,
        serviceVarsMap: serviceVarsMap,
        appServiceVars: appServiceVarsRes.data.serviceVars,
        serviceVars: serviceVars,
        application: applicationRes.data.app,
      };
    },
    methods: {
      hasDeviceValue(value) {
        return this.serviceVarsMap[value] !== undefined;
      },
      handleEditConfigVar() {
        let _this = this;
        this.$axios.get(`/api/device/${this.device.id}/serviceVar/set`, {
          params: {
            serviceId: this.device.current_services.main[0].service_id,
            key: this.editVarName,
            value: this.editVarValue
          }
        }).then(function () {
          _this.$notify({
            message: 'Variable was updated!',
            type: 'success'
          });
          _this.serviceVars[_this.editVarIndex].value = _this.editVarValue;
          // _this.editServiceId = null;
          _this.editVarIndex = null;
          _this.editVarName = null;
          _this.editVarValue = null;
        });
      },
      editConfigVar: function (varName, index) {
        this.showModal = true;
        this.editVarIndex = index;
        this.editVarName = varName;
        // this.editServiceId = this.serviceVars[index].service.__id;
        this.editVarValue = this.serviceVars[index].value;
      },
      removeServiceVar: function (varName, index) {
        let _this = this;
        if (confirm('Are you sure that you want delete ' + varName + ' ?')) {
          this.$axios.get(`/api/device/${this.device.id}/serviceVar/remove`, {
            params: {
              serviceId: this.device.current_services.main[0].service_id,
              key: varName
            }
          }).then(function () {
            _this.serviceVars.splice(index, 1);
          })
        }
      },
      setServiceVar: function () {
        let _this = this;

        this.$axios.get(`/api/device/${this.device.id}/serviceVar/set`, {
          params: {
            serviceId: this.newVarServiceId,
            key: this.newVarName,
            value: this.newVarValue
          }
        }).then(function () {
          _this.serviceVars.push({name: _this.newVarName, value: _this.newVarValue});
          _this.newVarName = _this.newVarValue = '';
        });
      }
    }
  }
</script>

<style>

</style>
