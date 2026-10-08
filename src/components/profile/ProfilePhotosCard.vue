<script setup>
import AvatarUpload from '../ui/AvatarUpload.vue'
import ProfileSection from './ProfileSection.vue'

// Settings → "Profile Photos": avatar + header uploads. New photos go to admin
// approval; the page handles it via submit(kind, fileId), fileId null = cancel.
defineProps({
  user: { type: Object, required: true }, // currentUser (live + pending image IDs)
})
const emit = defineEmits(['submit'])
</script>

<template>
  <ProfileSection title="Profile Photos">
    <p class="text-sm text-bark/70 mb-5">New photos appear once an admin approves them.</p>
    <div class="grid md:grid-cols-[auto_1fr] gap-8">
      <div>
        <div class="text-sm text-bark mb-2">Profile picture</div>
        <AvatarUpload
          :live-image-id="user.avatarImageId"
          :pending-image-id="user.pendingAvatarImageId"
          shape="circle"
          @submit="emit('submit', 'avatar', $event)"
          @withdraw="emit('submit', 'avatar', null)"
        />
      </div>
      <div>
        <div class="text-sm text-bark mb-2">Profile header</div>
        <AvatarUpload
          :live-image-id="user.headerImageId"
          :pending-image-id="user.pendingHeaderImageId"
          shape="rectangle"
          @submit="emit('submit', 'header', $event)"
          @withdraw="emit('submit', 'header', null)"
        />
      </div>
    </div>
  </ProfileSection>
</template>
