// Temporary mock data, shaped exactly like the future Appwrite `courses`
// collection documents. When Appwrite is wired up, only the composable
// that reads this file needs to change — components stay untouched.
export const mockCourses = [
  {
    $id: 'course_egypt',
    title: 'Ancient Egypt',
    category: 'Ancient',
    description: 'Explore the pyramids, pharaohs, and daily life along the Nile.',
    lessonCount: 8,
    icon: 'pyramid',
    published: true,
  },
  {
    $id: 'course_goths',
    title: 'The Goths',
    category: 'Medieval',
    description: 'The tribes that reshaped the fall of the Roman Empire.',
    lessonCount: 7,
    icon: 'shield',
    published: true,
  },
  {
    $id: 'course_china',
    title: 'Ancient China',
    category: 'Ancient',
    description: 'Dynasties, philosophy, and the Terracotta Army.',
    lessonCount: 10,
    icon: 'map',
    published: true,
  },
  {
    $id: 'course_napoleon',
    title: "Napoleon's Reign",
    category: 'Modern',
    description: 'From revolution to empire, and the fall that followed.',
    lessonCount: 8,
    icon: 'flag',
    published: true,
  },
]
