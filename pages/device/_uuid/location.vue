<template>
  <div>
    <breadcrumb>
      <li class="breadcrumb-item"><nuxt-link to="/">Home</nuxt-link></li>
      <li class="breadcrumb-item"><nuxt-link :to="{ path: '/application/' + application.app_name}">Application : {{ application.app_name }}</nuxt-link></li>
      <li class="breadcrumb-item active" aria-current="page">Device : {{ device.device_name }}</li>
    </breadcrumb>
    <div class="row">
      <div class="col-xl flex-lg-grow-1 flex-xl-grow-0">
        <DeviceMenu v-bind:uuid="device.uuid"></DeviceMenu>
      </div>
      <div class="col-xl flex-grow-1">
        <h1>
          Device Location
        </h1>
        <div class="card">
          <div class="card-body">
            <div id="map" style="width: 100%; height: 600px; margin-bottom: 30px"></div>
            <input type="hidden" v-model="lng"/>
            <input type="hidden" v-model="lat"/>
            <button type="button" class="btn btn-success" @click="setCustomLocation">Save</button>
          </div>
        </div>
      </div>
    </div>
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
        lng: null,
        lat: null,
      }
    },
    async asyncData ({ params, $axios }) {
      let deviceRes = await $axios.get(`/api/device/${params.uuid}`);
      let locationRes = await $axios.get(`/api/device/${params.uuid}/getCustomLocation`);
      let applicationRes = await $axios.get(`/api/app/${parseInt(deviceRes.data.device.belongs_to__application.__id)}`);
      return {
        lat: parseFloat(locationRes.data.location.lat),
        lng: parseFloat(locationRes.data.location.lng),
        device: deviceRes.data.device,
        application: applicationRes.data.app
      };
    },
    methods: {
      setCustomLocation: function () {
        let _this = this;
        this.$axios.get(`/api/device/${this.device.uuid}/setCustomLocation`, {params:{lat: this.lat, lng: this.lng}}).then(function () {
          _this.$notify({
            message: 'Custom Location saved successfully!',
            type: 'success'
          })
        });
      },
    },
    mounted: function() {
      let _this = this;
      let uluru = {lat: this.lat, lng: this.lng};

      let map = new this.$google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: uluru
      });

      let marker = new this.$google.maps.Marker({position: uluru, map: map, draggable:true, title: _this.device.device_name});

      marker.addListener('dragend', function() {
        map.setCenter(marker.getPosition());
        _this.lat = marker.getPosition().lat();
        _this.lng = marker.getPosition().lng();
      });

    },
  }
</script>
