"use client"

import type React from "react"
import { useContext, useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, ActivityIndicator } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import * as DocumentPicker from "expo-document-picker"
import * as FileSystem from "expo-file-system"
import { useCategoryTable } from "../../hooks/useCategoryTable"
import { useCardTable } from "../../hooks/useCardTable"
import { AuthContext } from "../../App"
import { PDFCO_API_KEY } from "@env"

const ImportFile: React.FC = () => {
  const navigation = useNavigation()
  const { userId } = useContext(AuthContext)
  const { refresh } = useCategoryTable(userId)
  const { generateCardsFromPDF } = useCardTable(userId)

  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [extractedText, setExtractedText] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [cardCount, setCardCount] = useState(15)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      const rows = await refresh()
      setCategories(rows)
    }

    loadCategories()
  }, [])

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      })

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0]
        setSelectedFile(file)
        console.log("Selected file:", file.name)

        // Extract text from PDF
        extractTextFromPDF(file.uri)
      }
    } catch (err) {
      console.error("Error picking document:", err)
    }
  }

  const extractTextFromPDF = async (uri: string) => {
    try {
      setIsProcessing(true)

      // Step 1: Read the file as binary buffer
      const fileBuffer = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      const fileName = uri.split('/').pop() || 'upload.pdf'
      const fileType = 'application/pdf'

      // Step 2: Convert to multipart form for upload
      const formData = new FormData()
      formData.append('file', {
        uri,
        name: fileName,
        type: fileType,
      } as any) // `as any` to fix React Native TS typings

      // Step 3: Upload to PDF.co file upload endpoint
      const uploadRes = await fetch('https://api.pdf.co/v1/file/upload', {
        method: 'POST',
        headers: {
          'x-api-key': PDFCO_API_KEY,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      })

      const uploadJson = await uploadRes.json()

      if (!uploadJson || !uploadJson.url) {
        throw new Error(uploadJson.message || 'File upload failed')
      }

      const fileUrl = uploadJson.url

      // Step 4: Convert the uploaded PDF to text
      const convertRes = await fetch('https://api.pdf.co/v1/pdf/convert/to/text-simple', {
        method: 'POST',
        headers: {
          'x-api-key': PDFCO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: fileUrl,
          inline: true,
          async: false,
        }),
      })

      const convertJson = await convertRes.json()

      if (convertJson.error) {
        throw new Error(convertJson.message || 'Text extraction failed')
      }

      setExtractedText(convertJson.body || '')
    } catch (error) {
      console.error('Error extracting text from PDF:', error)
      alert('Failed to extract text from PDF. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSave = async () => {
    if (!extractedText || !category) {
      console.error("Missing required fields")
      return
    }

    try {
      setIsProcessing(true)
      console.log("Processing PDF text to flashcards:", { category, cardCount })

      const { topic_id } = await generateCardsFromPDF(extractedText, category as any, cardCount)
      navigation.navigate("FlashcardDetail", { id: topic_id })
    } catch (error) {
      console.error("Error generating flashcards from PDF:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attach File</Text>
          <View style={styles.fileUploadContainer}>
            <Image source={require("../../assets/file.png")} style={styles.folderIcon} />
            <Text style={styles.uploadText}>
              {selectedFile ? `Selected: ${selectedFile.name}` : "Upload a PDF and we'll convert it to flashcards."}
            </Text>
            <TouchableOpacity style={styles.browseButton} onPress={pickDocument} disabled={isProcessing}>
              <Text style={styles.browseButtonText}>Browse Files</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Set Information</Text>

          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => !isProcessing && setShowDropdown(!showDropdown)}
            disabled={isProcessing}
          >
            <Text style={styles.selectText}>
              {category ? categories.find((c) => c.id === category)?.name : "Select Category"}
            </Text>
            <Feather name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {showDropdown && !isProcessing && (
            <View style={styles.dropdown}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCategory(cat.id)
                    setShowDropdown(false)
                  }}
                >
                  <Text style={styles.dropdownItemText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Number of Cards to Generate</Text>
          <View style={styles.cardCountContainer}>
            {[5, 10, 15, 20, 25].map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.cardCountButton,
                  cardCount === count && styles.cardCountButtonActive,
                  isProcessing && styles.cardCountButtonDisabled,
                ]}
                onPress={() => !isProcessing && setCardCount(count)}
                disabled={isProcessing}
              >
                <Text
                  style={[
                    styles.cardCountText,
                    cardCount === count && styles.cardCountTextActive,
                    isProcessing && styles.cardCountTextDisabled,
                  ]}
                >
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, (!selectedFile || isProcessing) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!selectedFile || isProcessing}
        >
          <Text style={styles.saveButtonText}>{isProcessing ? "Processing..." : "Generate Flashcards"}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Loading Modal */}
      <Modal transparent={true} animationType="fade" visible={isProcessing} onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#4A86E8" />
            <Text style={styles.modalText}>
              {extractedText ? "Generating flashcards..." : "Extracting text from PDF..."}
            </Text>
            <Text style={styles.modalSubtext}>This may take a few moments</Text>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 11,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  fileUploadContainer: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
  },
  folderIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  uploadText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: "#4A86E8",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  browseButtonText: {
    color: "white",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E1E3E6",
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: "#4A86E8",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E1E3E6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  selectInput: {
    borderWidth: 1,
    borderColor: "#E1E3E6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectText: {
    color: "#666",
  },
  cardCountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cardCountButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E1E3E6",
    justifyContent: "center",
    alignItems: "center",
  },
  cardCountButtonActive: {
    backgroundColor: "#4A86E8",
    borderColor: "#4A86E8",
  },
  cardCountButtonDisabled: {
    opacity: 0.5,
  },
  cardCountText: {
    color: "#666",
  },
  cardCountTextActive: {
    color: "white",
  },
  cardCountTextDisabled: {
    opacity: 0.5,
  },
  saveButton: {
    backgroundColor: "#4A86E8",
    margin: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
    backgroundColor: "#A0BFF0",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#E1E3E6",
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: "white",
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E3E6",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  modalSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
})

export default ImportFile
