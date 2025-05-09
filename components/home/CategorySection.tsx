import React from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"

export interface Category {
  id: string
  title: string
  icon: string
  color: string
}

// Sample categories data
const categories: Category[] = [
  {
    id: "1",
    title: "Mathematics",
    icon: "math",
    color: "#F5A623",
  },
  {
    id: "2",
    title: "Geography",
    icon: "globe",
    color: "#4A86E8",
  },
  {
    id: "3",
    title: "History",
    icon: "history",
    color: "#9B59B6",
  },
  {
    id: "4",
    title: "Physics",
    icon: "physics",
    color: "#3498DB",
  },
]

interface CategoryCardProps {
  category: Category
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <TouchableOpacity style={[styles.categoryCard, { backgroundColor: category.color }]}>
      <View style={styles.categoryHeader}>
        <View style={styles.iconContainer}>
          {category.icon === "math" ? (
            <MaterialCommunityIcons name="function-variant" size={24} color="white" />
          ) : (
            <MaterialCommunityIcons name="earth" size={24} color="white" />
          )}
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="white" />
        </TouchableOpacity>
      </View>
      <Text style={styles.categoryTitle}>{category.title}</Text>
    </TouchableOpacity>
  )
}

const AddCategoryButton: React.FC = () => {
  return (
    <TouchableOpacity style={styles.addButton}>
      <Ionicons name="add" size={30} color="white" />
    </TouchableOpacity>
  )
}

const CategorySection: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <AddCategoryButton />
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333333",
  },
  scrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  categoryCard: {
    width: 150,
    height: 100,
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-between",
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconContainer: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  menuButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryTitle: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4A86E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginTop: 20,
  },
})

export default CategorySection
