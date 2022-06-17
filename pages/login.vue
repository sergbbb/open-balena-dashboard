<template>
    <div>
        <div v-if="formError" class="alert alert-danger">{{ formError }}</div>
        <form v-if="!$store.state.authUser" class="my-5" method="post" @submit.prevent="login">
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="text" class="form-control" name="username" v-model="formUsername">
            </div>
            <div class="form-group">
                <label class="form-label d-flex justify-content-between align-items-end">
                    <div>Password</div>
                </label>
                <input type="password" class="form-control" name="password" v-model="formPassword">
            </div>
            <div class="d-flex justify-content-between align-items-center m-0">

                <button type="submit" class="btn btn-primary">Sign In</button>
            </div>
        </form>
        <div v-else>
            You are logged! <nuxt-link to="dashboard">Dashboard</nuxt-link>
            <button @click="logout">
                Logout
            </button>
        </div>
    </div>
</template>

<script>
    export default {
        layout: 'auth',
        data() {
            return {
                formError: null,
                formUsername: '',
                formPassword: ''
            }
        },
        methods: {
            async login() {
                try {
                    await this.$store.dispatch('login', {
                        username: this.formUsername,
                        password: this.formPassword
                    })
                    this.formUsername = ''
                    this.formPassword = ''
                    this.formError = null
                    this.$router.push('/')
                } catch (e) {
                    this.$notify({
                        message: e.message,
                        type: 'danger'
                    })
                }
            },
            async logout() {
                try {
                    await this.$store.dispatch('logout')
                } catch (e) {
                    this.formError = e.message
                }
            }
        }
    }
</script>
