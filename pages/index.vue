<template>
  <div>
    <breadcrumb>
      <li class="breadcrumb-item active" aria-current="page">Home</li>
    </breadcrumb>
    <div class="row">
      <div class="col">
        <nuxt-link to="/application/create" class="btn btn-success">Create Application</nuxt-link>
        <nuxt-link to="/ssh_keys" class="btn btn-primary">SSH keys</nuxt-link>
        <nuxt-link to="/misc" class="btn btn-primary">Misc docs</nuxt-link>
      </div>
    </div>

    <h1>
      Applications list
    </h1>
    <div class="row">
      <div v-for="application in applications" class="col-md-4 col-lg-3 col-xl-2 mb-3">
        <nuxt-link :to="{ path: '/application/' + application.app_name}" class="app_card btn-secondary"
               :style="{backgroundImage: `url(${getLogo(application.is_for__device_type.__id)})`}"
          >
            <h4>{{ application.app_name }}</h4>
<!--            <img :src="getLogo(application.is_for__device_type.__id)"/>-->
            <h5>{{ getName(application.is_for__device_type.__id) }}</h5>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
  import Logo from '~/components/Logo.vue';
  import Breadcrumb from '../components/Breadcrumb';

  export default {
    components: {
      Breadcrumb,
      Logo
    },
    async asyncData({$axios}) {
      let applications = await $axios.get('/api/apps');
      let supportedDeviceTypesRes = await $axios.get('/api/deviceType/getAll');
      let supportedDeviceTypes = supportedDeviceTypesRes.data.deviceTypes.filter(type => {
        return type.name.includes('Balena') || type.name.includes('Intel NUC') || type.name.includes('Raspberry') || type.name.includes('Nvidia Jetson TX2')
      });
      return {applications: applications.data.apps, supportedDeviceTypes};
    },
    methods: {
      getLogo(deviceTypeId) {
        const deviceType = this.supportedDeviceTypes.find(d => d.id === deviceTypeId)
        return deviceType ? deviceType.logo : ''
      },
      getName(deviceTypeId) {
        const deviceType = this.supportedDeviceTypes.find(d => d.id === deviceTypeId)
        return deviceType ? deviceType.name : '-'
      }
    }
  }
</script>

<style>
  .app_card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 375px;
    text-align: center;
    border: 1px solid grey;
    border-radius: 5px;
    padding: 30px;
    background-repeat: no-repeat !important;
    background-position: center !important;
  }

  .app_card:hover {
    text-decoration: none;
  }
</style>
