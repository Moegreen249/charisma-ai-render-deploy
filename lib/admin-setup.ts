import { prisma } from './prisma'
import { hashPassword } from './auth'

/**
 * Create an admin user for testing purposes
 * This should only be used in development or for initial setup
 */
export async function createAdminUser(email: string, password: string, name?: string) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('User already exists:', email)
      return existingUser
    }

    // Hash the password
    const hashedPassword = await hashPassword(password)

    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || 'Admin User',
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })

    console.log('Admin user created successfully:', adminUser.email)
    return adminUser
  } catch (error) {
    console.error('Error creating admin user:', error)
    throw error
  }
}

/**
 * Create a regular user for testing purposes
 */
export async function createUser(email: string, password: string, name?: string) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('User already exists:', email)
      return existingUser
    }

    // Hash the password
    const hashedPassword = await hashPassword(password)

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || 'Regular User',
        role: 'USER',
        emailVerified: new Date()
      }
    })

    console.log('User created successfully:', user.email)
    return user
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

/**
 * List all users (for admin purposes)
 */
export async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return users
  } catch (error) {
    console.error('Error listing users:', error)
    throw error
  }
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, role: 'USER' | 'ADMIN') {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role }
    })

    console.log('User role updated:', user.email, '->', role)
    return user
  } catch (error) {
    console.error('Error updating user role:', error)
    throw error
  }
}

/**
 * Delete user
 */
export async function deleteUser(userId: string) {
  try {
    const user = await prisma.user.delete({
      where: { id: userId }
    })

    console.log('User deleted:', user.email)
    return user
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
} 