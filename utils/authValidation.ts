// Email validation utilities
export const validateEmail = (email: string) => {
  const trimmedEmail = email.trim().toLowerCase()

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, message: "Please enter a valid email address" }
  }

  // Gmail specific validation
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
  if (!gmailRegex.test(trimmedEmail)) {
    return { isValid: false, message: "Please use a valid Gmail address" }
  }

  // Additional Gmail rules
  const localPart = trimmedEmail.split("@")[0]

  // Check for consecutive dots
  if (localPart.includes("..")) {
    return { isValid: false, message: "Gmail address cannot contain consecutive dots" }
  }

  // Check for dots at start or end
  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return { isValid: false, message: "Gmail address cannot start or end with a dot" }
  }

  // Check minimum length
  if (localPart.length < 1) {
    return { isValid: false, message: "Gmail address is too short" }
  }

  return { isValid: true, message: "Valid Gmail address" }
}

// Password validation utilities
export const validatePassword = (password: string) => {
  const errors = []
  const checks = {
    length: password.length >= 8,
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    noSpaces: !/\s/.test(password),
  }

  if (!checks.length) errors.push("At least 8 characters")
  if (!checks.special) errors.push("One special character")
  if (!checks.noSpaces) errors.push("No spaces allowed")

  const strength = Object.values(checks).filter(Boolean).length
  let strengthLevel = "Very Weak"
  let strengthColor = "#FF3B30"

  if (strength >= 3) {
    strengthLevel = "Very Strong"
    strengthColor = "#34C759"
  } else if (strength >= 2) {
    strengthLevel = "Good"
    strengthColor = "#FF9500"
  } else if (strength >= 1) {
    strengthLevel = "Weak"
    strengthColor = "#FF6B00"
  }

  return {
    isValid: errors.length === 0,
    errors,
    checks,
    strength: strengthLevel,
    strengthColor,
    strengthScore: strength,
  }
}

// Name validation
export const validateName = (name: string) => {
  const trimmedName = name.trim()

  if (trimmedName.length < 2) {
    return { isValid: false, message: "Name must be at least 2 characters" }
  }

  if (trimmedName.length > 50) {
    return { isValid: false, message: "Name must be less than 50 characters" }
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-']+$/
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, message: "Name can only contain letters, spaces, hyphens, and apostrophes" }
  }

  // Check for at least one letter
  if (!/[a-zA-Z]/.test(trimmedName)) {
    return { isValid: false, message: "Name must contain at least one letter" }
  }

  return { isValid: true, message: "Valid name" }
}
