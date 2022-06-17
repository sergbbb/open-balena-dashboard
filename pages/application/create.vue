<template>
    <div>
        <!--<logo />-->
        <div class="links">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><nuxt-link to="/">Home</nuxt-link></li>
                    <li class="breadcrumb-item active" aria-current="page">Create Application</li>
                </ol>
            </nav>
        </div>
        <h1>
            Create Application
        </h1>
        <div>
            <form v-on:submit.prevent="submitApp">
                <div class="form-group">
                    <label>Application Name</label>
                    <input type="text" class="form-control" v-model.lazy.trim="app_name">
                    <small class="form-text text-muted">The name should be at least 4 characters long. It can only contain letters and numbers.</small>
                </div>
                <div class="form-group">
                    <label>Default Device Type</label>
                    <select class="form-control" v-model="device_type">
                        <option :key="deviceType.slug" v-for="deviceType in supportedDeviceTypes" v-bind:value="deviceType.slug">{{ deviceType.name }}</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-success">Submit</button>
                <nuxt-link to="/" class="btn btn-secondary">Back</nuxt-link>
            </form>
        </div>
    </div>
</template>

<script>

    export default {
        data: function() {
            return {
                app_name : '',
                device_type : '',
            }
        },
        async asyncData ({ $axios }) {
            let supportedDeviceTypesRes = await $axios.get('/api/deviceType/getAll');
            let supportedDeviceTypes = supportedDeviceTypesRes.data.deviceTypes.filter(type => {
              return type.name.includes('Balena') || type.name.includes('Intel NUC') || type.name.includes('Raspberry') || type.name.includes('Nvidia Jetson TX2')
            });
            return { supportedDeviceTypes: supportedDeviceTypes.sort((a, b) => a.name.localeCompare(b.name)) };
        },
        methods: {
          submitApp: function () {
            if (this.app_name.length < 5 || this.device_type.length === 0) {
              this.$notify({
                message: 'App name should be longer then 4 symbols and App type should be selected.',
                type: 'warning'
              })
              return
            }

            this.$axios.get('/api/app/create', {params: { appName: this.app_name, deviceType: this.device_type }})
                .then(response => {
                    let app = response.data.app;
                    this.$router.push({
                        path: '/application/' + app.app_name
                    })
                })
                .catch(error => {
                    console.log(error);
                });
            }
        }
    }
</script>
