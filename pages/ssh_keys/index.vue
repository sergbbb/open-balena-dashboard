<template>
  <div>
    <breadcrumb>
      <li class="breadcrumb-item"><nuxt-link to="/">Home</nuxt-link></li>
      <li class="breadcrumb-item active" aria-current="page">SSH keys</li>
    </breadcrumb>
    <h1>SSH keys</h1>
    <h6>This SSH keys are used to get ssh shell to devices as described at README.md</h6>
    <div class="row">
      <div class="col-md-12 col-xl-3">
        <div class="card mb-4">
          <h6 class="card-header">
            Add SSH key
          </h6>
          <div class="card-body">
            <form>
              <div class="form-group">
                <select v-model="newKeyAppName" class="form-control">
                  <option value="">Select application</option>
                  <option v-for="application in applications" :value="application.app_name">{{ application.app_name }}</option>
                </select>
              </div>
              <div class="form-group">
                <input type="text" v-model="newKeyName" class="form-control" placeholder="Name">
              </div>
              <div class="form-group">
                <textarea class="form-control" rows="4" v-model="newKey" placeholder="SSH Public key"></textarea>
              </div>
              <div class="form-group">
                <button type="button" @click="addKey" class="btn btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="col-md-12 col-xl-9">
        <div class="row">
          <div v-for="ssh_key in ssh_keys" class="col-md-12 col-xl-6 mb-3">
            <div class="card">
              <div class="card-body">
                <div>App: <span class="badge badge-primary">{{ ssh_key.appName }}</span></div>
                <div>Name: {{ ssh_key.name }}</div>
                <div>Key: </div>
                <textarea class="form-control" rows="8">{{ ssh_key.ssh_key }}</textarea>
                <div class="mt-4"><button @click="removeKey(ssh_key._id, ssh_key.name)" type="button" class="btn btn-sm btn-danger">Remove</button></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Logo from '~/components/Logo.vue';
  import Breadcrumb from '../../components/Breadcrumb';

  export default {
    components: {
      Breadcrumb,
      Logo
    },
    data() {
      return {
        newKeyAppName: '',
        newKeyName: '',
        newKey: '',
      }
    },
    async asyncData ({ $axios }) {
      let applications = await $axios.get('/api/apps');
      let ssh_keys = await $axios.get('/api/ssh_keys/list');
      return { applications: applications.data.apps, ssh_keys: ssh_keys.data.ssh_keys };
    },
    methods: {
      removeKey(key_id, KeyName) {
        if(confirm('Are you sure that you want remove ' + KeyName + ' ?')) {
          this.$axios.get(`/api/ssh_keys/remove`, {params: {key_id: key_id}}).then((result) => {
            if(result.data.success) {
              this.$notify({
                message: 'SSH Key Removed successfully !',
                type: 'success'
              });
            } else {
              this.$notify({
                message: 'Error',
                type: 'warning'
              });
            }
            this.updateKeys();
          })
        }
      },
      addKey() {
        if(this.newKeyAppName === '' || this.newKeyName === '' || this.newKey === '') {
          this.$notify({
            message: 'Please select App and fill Name and Key',
            type: 'warning'
          });
          return false;
        }

        this.$axios.get(`/api/ssh_keys/add`, {params: {appName: this.newKeyAppName, name: this.newKeyName, ssh_key: this.newKey}}).then((result) => {
          if(result.data.success) {
            this.$notify({
              message: 'SSH Key Registered successfully !',
              type: 'success'
            });
          } else {
            this.$notify({
              message: 'Error',
              type: 'warning'
            });
          }
          this.newKeyName = this.newKey = '';
          this.updateKeys();
        })
      },
      updateKeys() {
        this.$axios.get(`/api/ssh_keys/list`).then((result) => {
          this.ssh_keys = result.data.ssh_keys;
        })
      }
    }
  }
</script>

<style>
  .app_card {
    text-align: center;
    border: 1px solid grey;
    border-radius: 5px;
    padding: 30px;
  }

  .app_btn:hover {
    text-decoration: none;
  }
</style>
