<script setup>
import AvatarUpload from '../ui/AvatarUpload.vue'
import ProfileSection from './ProfileSection.vue'
import { REMOVE_IMAGE } from '../../constants/images'

// Settings → "Profile Photos": avatar + header uploads. New photos go to admin
// approval, and so does removing one; the page handles both via
// submit(kind, fileId): a file ID, REMOVE_IMAGE, or null = cancel the request.
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
          @remove="emit('submit', 'avatar', REMOVE_IMAGE)"
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
          @remove="emit('submit', 'header', REMOVE_IMAGE)"
          @withdraw="emit('submit', 'header', null)"
        />
      </div>
    </div>
  </ProfileSection>
</template>
