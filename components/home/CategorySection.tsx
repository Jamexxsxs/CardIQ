import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useCategoryTable } from "../../hooks/useCategoryTable";
import { AuthContext } from "../../App";

export interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryCardProps {
  category: Category;
  navigation: any;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  deleteCategory: (id: number) => void;
  refresh: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  navigation,
  openMenuId,
  setOpenMenuId,
  deleteCategory,
  refresh,
}) => {
  const isMenuOpen = openMenuId === category.id;

  const handleDeletePress = () => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteCategory(parseInt(category.id));
            await refresh();
            setOpenMenuId(null);
          },
        },
      ]
    );
  };

  return (
    <TouchableWithoutFeedback onPress={() => setOpenMenuId(null)}>
      <TouchableOpacity
        style={[styles.categoryCard, { backgroundColor: category.color }]}
        onPress={() =>
          navigation.navigate("CategoryContent", { id: category.id, title: category.name })
        }
        activeOpacity={0.8}
      >
        <View style={styles.categoryHeader}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="folder" size={24} color="white" />
          </View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={(e) => {
              e.stopPropagation();
              setOpenMenuId(isMenuOpen ? null : category.id);
            }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {isMenuOpen && (
          <TouchableWithoutFeedback onPress={() => setOpenMenuId(null)}>
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        )}

        <Text style={styles.categoryTitle}>{category.name}</Text>
        <View style={styles.decorativeShape}></View>
      </TouchableOpacity>
    </TouchableWithoutFeedback>
  );
};

const AddCategoryButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={styles.addButton} onPress={onPress}>
    <Ionicons name="add" size={30} color="white" />
  </TouchableOpacity>
);

const CategorySection: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userId } = useContext(AuthContext);
  const { categories, addCategory, refresh, deleteCategory } = useCategoryTable(userId);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  const handleCreateCategory = async () => {
    await addCategory(categoryName);
    await refresh();
    setModalVisible(false);
    setCategoryName("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.horizontalContainer}>
        <AddCategoryButton onPress={() => setModalVisible(true)} />
        {categories.length === 0 ? (
          <View style={styles.noCategoryContainer}>
            <Text style={styles.noCategoryText}>No Categories Yet</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
          >
            {[...categories].reverse().map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                navigation={navigation}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                deleteCategory={deleteCategory}
                refresh={refresh}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Category</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Insert category name to create a new category</Text>
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
  noCategoryContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 120,
    paddingLeft: 16,
  },
  noCategoryText: {
    color: "#999",
    fontSize: 16,
    fontStyle: "italic",
  },
  horizontalContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollView: {
    flex: 1, 
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333333",
  },
  scrollContent: {
    paddingRight: 16,
    gap: 16,
  },
  categoryCard: {
    width: 170,
    height: 120,
    borderRadius: 20,
    padding: 18,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconContainer: {
    width: 34,
    height: 34,
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
    fontSize: 18,
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#4A86E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  decorativeShape: {
    position: "absolute",
    right: -25,
    top: -30,
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: "#000000",
    opacity: 0.2,
    zIndex: -9999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  closeButton: {
    padding: 4,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: "#4A86E8",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#B4B4B4",
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  menuContainer: {
    position: "absolute",
    top: 40,
    right: 10,
    backgroundColor: "transparent",
    padding: 8,
    borderRadius: 8,
    zIndex: 10
  },
  deleteButton: {
    backgroundColor: "#E53935",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});


export default CategorySection;
