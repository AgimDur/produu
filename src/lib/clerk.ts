import { auth, clerkClient } from '@clerk/nextjs/server'

export { clerkClient }

// Helper function to get current user
export async function getCurrentUser() {
  try {
    const { userId } = await auth()
    if (!userId) return null
    
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Helper function to get user ID
export async function getCurrentUserId() {
  try {
    const { userId } = await auth()
    return userId
  } catch (error) {
    console.error('Error getting current user ID:', error)
    return null
  }
} 