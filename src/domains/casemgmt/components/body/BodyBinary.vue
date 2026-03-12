<template>
  <div class="body-binary">
    <div class="file-select-btn">Select file</div>
    <div class="file-dropdown">
      <div class="new-file">+ New file from local machine</div>
      <div>Files uploaded to team</div>
      <div class="no-file">No file found</div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'BodyBinary' })
</script>

<style scoped>
.body-binary {
  padding: 16px;
}

.file-select-btn {
  padding: 8px 16px;
  border: 2px solid #2563eb;
  border-radius: 4px;
  background: #fff;
  color: #2563eb;
  cursor: pointer;
  font-size: 14px;
  width: 240px;
  text-align: left;
}

.file-dropdown {
  margin-top: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  width: 240px;
  background: #fff;
}

.file-dropdown div {
  padding: 8px 16px;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
}
</style>
