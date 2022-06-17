<template>
  <div>
    <breadcrumb>
      <li class="breadcrumb-item">
        <nuxt-link to="/">Home</nuxt-link>
      </li>
      <li class="breadcrumb-item active" aria-current="page">Application : {{ $route.params.app_name }}</li>
    </breadcrumb>
    <div class="row">
      <div class="col-xl flex-lg-grow-1 flex-xl-grow-0">
        <AppMenu v-bind:app-name="$route.params.app_name"></AppMenu>
      </div>
      <div class="col-md flex-grow-1">
        <h1>
          {{ $route.params.app_name }} : Service variables
        </h1>
        <h6>Service variables are available to the code in the specified service on any device running in this
          application — unless they are redefined with a per-device service variable of the same name and service.</h6>
        <div v-if="services.length" class="card">
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
              <td>
                <div :class="'badge badge-'+ servicesColorMap[serviceVar.service.__id] + ' text-uppercase'">
                  {{ servicesMap[serviceVar.service.__id] }}
                </div>
              </td>
              <td>{{ serviceVar.name }}</td>
              <td>{{ serviceVar.value }}</td>
              <td>
                <button class="btn btn-sm" @click="editConfigVar(serviceVar.service.__id, serviceVar.name, index)"><i class="oi oi-pencil"></i>
                </button>
                <button class="btn btn-sm" @click="removeServiceVar(serviceVar.service.__id, serviceVar.name, index)"><i class="oi oi-trash"></i>
                </button>
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
      </div>
    </div>
    <b-modal v-model="showModal" @ok="handleEditConfigVar" :title="'Config variable: ' + editVarName">
      <div class="d-block text-center">
        <b-form-input v-model="editVarValue" placeholder="Enter your name"></b-form-input>
      </div>
    </b-modal>
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
      let applicationRes = await $axios.get(`/api/app/${params.app_name}`);
      let servicesRes = await $axios.get(`/api/app/${params.app_name}/services`);

      const services = servicesRes.data.services;

      services.forEach((currentValue, index) => {
        servicesMap[currentValue.id] = currentValue.service_name;
        servicesColorMap[currentValue.id] = colorClasses[index];
      });

      let result = {
        application: applicationRes.data.app,
        services: services,
        servicesMap: servicesMap,
        servicesColorMap: servicesColorMap,
      };

      let appServiceVarsRes = await $axios.get(`/api/app/${params.app_name}/serviceVar/getAll`);
      result.serviceVars = appServiceVarsRes.data.serviceVars;

      return result;

    },
    methods: {
      handleEditConfigVar() {
        let _this = this;
        this.$axios.get(`/api/service/${this.editServiceId}/serviceVar/set`, {
          params: {
            key: this.editVarName,
            value: this.editVarValue
          }
        }).then(function () {
          _this.$notify({
            message: 'Variable was updated!',
            type: 'success'
          });
          _this.serviceVars[_this.editVarIndex].value = _this.editVarValue;
          _this.editServiceId = null;
          _this.editVarIndex = null;
          _this.editVarName = null;
          _this.editVarValue = null;
        });
      },
      editConfigVar(serviceId, varName, index) {
        this.showModal = true;
        this.editVarIndex = index;
        this.editVarName = varName;
        this.editServiceId = serviceId;
        this.editVarValue = this.serviceVars[index].value;
      },
      async removeServiceVar(serviceId, varName, index) {
        let _this = this;
        if (confirm('Are you sure that you want delete ' + varName + ' ?')) {
          await this.$axios.get(`/api/service/${serviceId}/serviceVar/remove`, {params: {key: varName}});
          let appServiceVarsRes = await this.$axios.get(`/api/app/${this.application.app_name}/serviceVar/getAll`);
          this.serviceVars = appServiceVarsRes.data.serviceVars;
        }
      },
      async setServiceVar() {
        let _this = this;
        if (this.newVarName.length === 0) {
          this.$notify({
            message: 'Var name could\'t be empty!',
            type: 'danger'
          });
          return;
        }

        if (this.newVarValue.length === 0) {
          this.$notify({
            message: 'Please enter some value for new config var!',
            type: 'danger'
          });
          return;
        }

        await this.$axios.get(`/api/service/${this.newVarServiceId}/serviceVar/set`, {
          params: {
            key: this.newVarName,
            value: this.newVarValue
          }
        });
        let appServiceVarsRes = await this.$axios.get(`/api/app/${this.application.app_name}/serviceVar/getAll`);
        this.serviceVars = appServiceVarsRes.data.serviceVars;
        _this.newVarName = _this.newVarValue = '';
      }
    },
    mounted() {
      this.newVarServiceId = this.service ? this.service.id : '';
    }
  }
</script>

<style>

</style>
