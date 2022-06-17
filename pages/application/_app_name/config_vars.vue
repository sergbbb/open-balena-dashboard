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
      <div class="col-xl flex-grow-1">
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
            <tr v-for="(configVar, index) in configVars">
              <td>{{ configVar.name }}</td>
              <td>{{ configVar.value }}</td>
              <td>
                <button class="btn btn-sm" @click="editConfigVar(configVar.name, index)"><i class="oi oi-pencil"></i></button>
                <button class="btn btn-sm" @click="removeConfigVar(configVar.name, index)"><i class="oi oi-trash"></i></button>
              </td>
            </tr>
            <tr>
              <td><input type="text" class="form-control" v-model="newVarName"/></td>
              <td><input type="text" class="form-control" v-model="newVarValue"/></td>
              <td><button class="btn btn-sm" @click="setConfigVar"><i class="oi oi-plus"></i></button></td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-3">
          <h3>Config variables</h3>
          [RESIN_SUPERVISOR_CONNECTIVITY_CHECK] - Enable / Disable VPN connectivity check
          <br/>[RESIN_SUPERVISOR_LOG_CONTROL] - Enable / Disable logs from being sent to balena
          <br/>[RESIN_SUPERVISOR_POLL_INTERVAL] - Define the balena API poll interval in milliseconds
          <br/>[RESIN_SUPERVISOR_VPN_CONTROL] - Enable / Disable VPN
          <br/>[RESIN_SUPERVISOR_PERSISTENT_LOGGING] - Enable persistent logging. Only supported by supervisor versions >= v7.15.0.
          <br/>[RESIN_SUPERVISOR_DELTA] - Enable / Disable delta updates
          <br/>[RESIN_SUPERVISOR_DELTA_REQUEST_TIMEOUT] - Define the timeout when requesting a delta in milliseconds
          <br/>[RESIN_SUPERVISOR_DELTA_RETRY_COUNT] - Define the number of times a delta download should be retried
          <br/>[RESIN_SUPERVISOR_DELTA_RETRY_INTERVAL] - Define the wait time between delta download attempts in milliseconds
          <br/>[RESIN_HOST_CONFIG_disable_splash] - Enable / Disable the balena splash screen
          <br/>[RESIN_HOST_CONFIG_dtparam] - Define DT parameters
          <br/>[RESIN_HOST_CONFIG_enable_uart] - Enable / Disable UART
          <br/>[RESIN_HOST_CONFIG_gpu_mem] - Define device GPU memory in megabytes.
        </div>
      </div>
    </div>
    <b-modal v-model="showModal" @ok="handleEditConfigVar" :title="'Config variable: ' + editVarName">
      <div class="d-block text-center">
        <b-form-input v-model="editVarValue" placeholder="Enter your name"></b-form-input>
      </div>
    </b-modal>
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
    data: function() {
      return {
        newVarName: '',
        newVarValue: '',
        editVarIndex: null,
        editVarName: null,
        editVarValue: null,
        showModal: false
      }
    },
    async asyncData ({ params, $axios }) {
      let applicationRes = await $axios.get(`/api/app/${params.app_name}`);
      let configVarsRes = await $axios.get(`/api/app/${params.app_name}/configVar/getAll`);
      return { application : applicationRes.data.app, configVars: configVarsRes.data.vars };

    },
    methods: {
      handleEditConfigVar: function() {
        let _this = this;
        this.$axios.get(`/api/app/${this.application.app_name}/configVar/set`, {params: {key: this.editVarName, value: this.editVarValue}}).then(function () {
          _this.$notify({
            message: 'Variable was updated!',
            type: 'success'
          });
          _this.configVars[_this.editVarIndex].value = _this.editVarValue;
          _this.editVarIndex = null;
          _this.editVarName = null;
          _this.editVarValue = null;
        });
      },
      editConfigVar: function(varName, index) {
        this.showModal = true;
        this.editVarIndex = index;
        this.editVarName = varName;
        this.editVarValue = this.configVars[index].value;
      },
      removeConfigVar: function (varName, index) {
        let _this = this;
        if(confirm('Are you sure that you want delete ' + varName + ' ?')) {
          this.$axios.get(`/api/app/${this.application.app_name}/configVar/remove`, {params: {key: varName}}).then(function () {
            _this.configVars.splice( index, 1 );
          })
        }
      },
      setConfigVar: function () {
        let _this = this;
        if(this.newVarName.indexOf('BALENA_') !== 0 &&  this.newVarName.indexOf('RESIN_') !== 0) {
          this.$notify({
            message: 'Name should start with BALENA_ or RESIN_ prefix!',
            type: 'danger'
          });
          return;
        }

        if(this.newVarValue.length === 0) {
          this.$notify({
            message: 'Please enter some value for new config var!',
            type: 'danger'
          });
          return;
        }

        this.$axios.get(`/api/app/${this.application.app_name}/configVar/set`, {params: {key: this.newVarName, value: this.newVarValue}}).then(function () {
          _this.configVars.push( { name: _this.newVarName, value: _this.newVarValue} );
          _this.newVarName = _this.newVarValue = '';
        });
      }
    }
  }
</script>

<style>

</style>
