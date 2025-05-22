// CategorySection.jsx
import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Pressable } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Feather } from '@expo/vector-icons';
import { useCategoryTable } from "../../hooks/useCategoryTable";
import { AuthContext } from "../../App";

export interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
}

const categories: Category[] = [
  {
    id: "1",
    title: "Mathematics",
    icon: "math",
    color: "#4DC591",
  },
  {
    id: "2",
    title: "Geography",
    icon: "globe",
    color: "#F09E54",
  },
  {
    id: "3",
    title: "History",
    icon: "history",
    color: "#8F98FF",
  },
  {
    id: "4",
    title: "Physics",
    icon: "physics",
    color: "#4DC591",
  },
];

interface CategoryCardProps {
  category: Category;
  navigation: any;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, navigation }) => {

  return (
    <TouchableOpacity 
      style={[styles.categoryCard, { backgroundColor: category.color }]}
      onPress={() => navigation.navigate('CategoryContent', { id: category.id, title: category.title })}
    >
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
      <View style={styles.decorativeShape}></View>
    </TouchableOpacity>
  );
};

interface AddCategoryButtonProps {
  onPress: () => void;
}

const AddCategoryButton: React.FC<AddCategoryButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.addButton} onPress={onPress}>
      <Ionicons name="add" size={30} color="white" />
    </TouchableOpacity>
  );
};

interface CategorySectionProps {
  navigation: any;
}

const CategorySection: React.FC<CategorySectionProps> = ({ navigation }) => {
  const { userId } = useContext(AuthContext);
  const { addCategory, refresh } = useCategoryTable(userId);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  const handleCreateCategory = async() => {
    await addCategory(categoryName)

    const data = await refresh();


    setModalVisible(false);
    setCategoryName("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <AddCategoryButton onPress={() => setModalVisible(true)} />
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} navigation={navigation} />
        ))}
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Category</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Insert category name to create a new category
            </Text>
            <TextInput
              placeholder="Category name"
              value={categoryName}
              onChangeText={setCategoryName}
              style={styles.input}
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              style={[styles.createButton, !categoryName && styles.createButtonDisabled]} 
              onPress={handleCreateCategory}
              disabled={!categoryName}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

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
    overflow: "hidden"
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
    zIndex: 2,
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
  decorativeShape: {
    position: 'absolute',
    right: -25,
    top: -30,
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: '#000000',
    opacity: 0.5,
    zIndex: -9999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  closeButton: {
    padding: 4,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#4A86E8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#B4B4B4',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CategorySection;