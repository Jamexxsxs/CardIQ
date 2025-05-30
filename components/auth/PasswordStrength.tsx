"use client"

import { View, Text, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"

interface PasswordStrengthIndicatorProps {
  password: string
  validation: {
    isValid: boolean
    errors: string[]
    checks: {
      length: boolean
      special: boolean
      noSpaces: boolean
    }
    strength: string
    strengthColor: string
    strengthScore: number
  }
}

const PasswordStrength = ({ password, validation }: PasswordStrengthIndicatorProps) => {
  if (!password) return null

  const requirements = [
    { key: "length", label: "At least 8 characters", check: validation.checks.length },
    { key: "special", label: "One special character", check: validation.checks.special },
    { key: "noSpaces", label: "No spaces", check: validation.checks.noSpaces },
  ]

  return (
    <View style={styles.container}>
        {/* Strength label and bar side by side */}
        <View style={styles.strengthHeader}>
        <Text style={styles.strengthLabel}>Password Strength:</Text>
        <View style={styles.strengthBarBackground}>
            <View
            style={[
                styles.strengthBarFill,
                {
                width: `${(validation.strengthScore / 3) * 100}%`,
                backgroundColor: validation.strengthColor,
                },
            ]}
            />
        </View>
        <Text style={[styles.strengthText, { color: validation.strengthColor }]}>{validation.strength}</Text>
        </View>

        {/* Horizontal checklist */}
        <View style={styles.requirementsRow}>
        {requirements.map((req) => (
            <View key={req.key} style={styles.requirementBadge}>
            <Feather
                name={req.check ? "check-circle" : "circle"}
                size={14}
                color={req.check ? "#34C759" : "#999"}
                style={styles.requirementIcon}
            />
            <Text style={[styles.requirementText, { color: req.check ? "#34C759" : "#666" }]}>{req.label}</Text>
            </View>
        ))}
        </View>
    </View>
    )
}

const styles = StyleSheet.create({
   strengthHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 8,
    },

    strengthLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    },

    strengthBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
    overflow: "hidden",
    },

    strengthBarFill: {
    height: "100%",
    borderRadius: 4,
    },

    strengthText: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 80,
    textAlign: "right",
    },

    requirementsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
    },

    requirementBadge: {
    flexDirection: "row",
    alignItems: "center",
    },

    requirementIcon: {
    marginRight: 4,
    },

    requirementText: {
    fontSize: 12,
    },
})

export default PasswordStrength
