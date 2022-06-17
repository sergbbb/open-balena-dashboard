<template>
  <div>
    <breadcrumb>
      <li class="breadcrumb-item"><nuxt-link to="/">Home</nuxt-link></li>
      <li class="breadcrumb-item active" aria-current="page">Device : {{ device.device_name }}</li>
    </breadcrumb>
    <div class="row">
      <div class="col-md flex-lg-grow-1 flex-xl-grow-0">
        <DeviceMenu v-bind:uuid="device.uuid"></DeviceMenu>
      </div>
      <div class="col-md flex-grow-1">
        <h1>
          {{ device.device_name }} : Fleet Configuration
        </h1>
        <h6>Device configuration variables are available to the code running on this particular device. If both the application and the device have a configuration variable of the same name, the code on this device will see the value of the per-device configuration variables. In other words, per-device configuration variables redefine (or override) application-wide configuration variables of the same name.</h6>
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
            <tr v-for="(envVar, index) in envVars">
              <td>{{ envVar.name }}</td>
              <td>{{ envVar.value }}</td>
              <td>
                <button class="btn btn-sm"><i class="oi oi-pencil"></i></button>
                <button class="btn btn-sm" @click="removeEnvVar(envVar.name, index)"><i class="oi oi-trash"></i></button>
              </td>
            </tr>
            <tr>
              <td><input type="text" class="form-control" v-model="newVarName"/></td>
              <td><input type="text" class="form-control" v-model="newVarValue"/></td>
              <td><button class="btn btn-sm" @click="setEnvVar"><i class="oi oi-plus"></i></button></td>
            </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

    <!--{{ configVars }}-->
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
    data: function() {
      return {
        newVarName: '',
        newVarValue: '',
      }
    },
    async asyncData ({ params, $axios }) {
      let deviceRes = await $axios.get(`/api/device/${params.uuid}`);
      let envVarsRes = await $axios.get(`/api/device/${params.uuid}/envVar/getAll`);
      return { device : deviceRes.data.device, envVars: envVarsRes.data.envVars };

    },
    methods: {
      removeEnvVar: function (varName, index) {
        let _this = this;
        if(confirm('Are you sure that you want delete ' + varName + ' ?')) {
          this.$axios.get(`/api/device/${this.device.uuid}/envVar/remove`, {params: {key: varName}}).then(function () {
            _this.envVars.splice( index, 1 );
          })
        }
      },
      setEnvVar: function () {
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

        this.$axios.get(`/api/device/${this.device.uuid}/envVar/set`, {params: {key: this.newVarName, value: this.newVarValue}}).then(function () {
          _this.envVars.push( { name: _this.newVarName, value: _this.newVarValue} );
          _this.newVarName = _this.newVarValue = '';
        });
      }
    }
  }
</script>

<style>

</style>
