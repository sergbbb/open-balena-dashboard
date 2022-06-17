<template>
    <div>

    </div>
</template>

<script>
    export default {
      mounted: function () {
            this.$axios.get(`/api/app/remove`, {params: { appName: this.$nuxt._route.params.app_name}}).then(function () {

            });
            this.$router.push({
                path: '/dashboard/'
            })

        }
    }
</script>
