import axios from 'axios'

export const state = () => ({
    authUser: null,
    jwt: null
})

export const mutations = {
    SET_USER: function (state, user) {
        state.authUser = user
    },
    SET_JWT: function (state, jwt) {
        state.jwt = jwt
    }
}

export const actions = {
    // nuxtServerInit is called by Nuxt.js before server-rendering every page
    nuxtServerInit({ commit }, { req }) {
        if (req.session && req.session.authUser && req.session.jwt) {
            commit('SET_USER', req.session.authUser)
            commit('SET_JWT', req.session.jwt)
        }
    },
    async login({ commit }, { username, password }) {
        try {
            const { data } = await axios.post('/api/login', { username, password })
            commit('SET_USER', data.username)
            commit('SET_JWT', data.token)
            localStorage.auth_user = data.username
            localStorage.auth_token = data.token

        } catch (error) {
            if (error.response && error.response.status === 401) {
                throw new Error('Bad credentials')
            }
            throw error
        }
    },

    async logout({ commit }) {
        await axios.post('/api/logout')
        commit('SET_USER', null)
        commit('SET_JWT', null)
    }

}
