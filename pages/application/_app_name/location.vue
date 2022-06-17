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
      <div class="col-md flex-grow-1">
        <h1>
          Application Location
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
  import AppMenu from '~/components/app/AppMenu.vue';
  import Breadcrumb from '../../../components/Breadcrumb';

  export default {
    components: {
      Breadcrumb,
      AppMenu
    },
    data: function () {
      return {
        lng: null,
        lat: null,
      }
    },
    async asyncData ({ params, $axios }) {
      let locationRes = await $axios.get(`/api/app/${params.app_name}/getCustomLocation`);
      let applicationRes = await $axios.get(`/api/app/${params.app_name}`);
      return {
        lat: parseFloat(locationRes.data.location.lat),
        lng: parseFloat(locationRes.data.location.lng),
        application: applicationRes.data.app
      };
    },
    methods: {
      setCustomLocation: function () {
        let _this = this;
        this.$axios.get(`/api/app/${this.application.app_name}/setCustomLocation`, {params:{lat: this.lat, lng: this.lng}}).then(function () {
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

      let marker = new this.$google.maps.Marker({position: uluru, map: map, draggable:true, title: _this.application.app_name});

      marker.addListener('dragend', function() {
        map.setCenter(marker.getPosition());
        _this.lat = marker.getPosition().lat();
        _this.lng = marker.getPosition().lng();
      });

    },
  }
</script>
