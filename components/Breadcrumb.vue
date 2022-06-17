<template>
  <div>
    <div class="links">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <slot/>
          <li style="margin-left: auto"><a href="/logout" class="text-danger">Logout</a></li>
        </ol>
      </nav>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Breadcrumb'
  }
</script>

<style scoped>

</style>
