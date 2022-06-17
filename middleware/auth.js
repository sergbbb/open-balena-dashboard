export default function ({ $axios, store, route, redirect }) {
    if (!store.state.jwt) {
        redirect('/login')
    } else {
        $axios.defaults.headers.common['Authorization'] = store.state.jwt;
    }
}
