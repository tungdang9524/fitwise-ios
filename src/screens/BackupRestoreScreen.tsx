import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Modal, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFitness } from '../store/FitnessStore';
import { useTheme } from '../theme/ThemeProvider';
import { FitnessState } from '../models/fitness';

export const BackupRestoreScreen: React.FC = () => {
  const { state, dispatch, resetState } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation();

  // Modals state
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importText, setImportText] = useState('');

  const handleCopyBackup = async () => {
    try {
      const backupString = JSON.stringify(state);
      await Clipboard.setStringAsync(backupString);
      Alert.alert('Success', 'Backup data copied to clipboard!');
    } catch (e) {
      Alert.alert('Error', 'Failed to copy backup data to clipboard.');
    }
  };

  const handleImportBackup = () => {
    if (!importText.trim()) {
      Alert.alert('Validation Error', 'Please paste a backup JSON string.');
      return;
    }

    try {
      const parsed = JSON.parse(importText.trim());
      if (parsed && typeof parsed === 'object' && 'hasCompletedSetup' in parsed) {
        dispatch({
          type: 'INITIALIZE_STATE',
          payload: parsed as FitnessState,
        });
        
        Alert.alert('Success', 'Backup data successfully restored!');
        setImportText('');
        setImportModalVisible(false);
        navigation.goBack();
      } else {
        Alert.alert('Import Failed', 'Invalid format. The JSON does not match a Fitwise backup schema.');
      }
    } catch (e) {
      Alert.alert('Parser Error', 'Invalid JSON string. Please ensure the string is complete.');
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your workouts, nutrition history, measurements, and profile configurations. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Data',
          style: 'destructive',
          onPress: () => {
            resetState();
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <AppText variant="h2">Data Management</AppText>
        <AppText variant="body" color="textSecondary" style={styles.subtitle}>
          Backup, import, or purge all local files.
        </AppText>
      </View>

      <Card variant="glass" style={styles.card}>
        <AppText variant="bodyBold" style={styles.sectionTitle}>Backup & Import via JSON</AppText>
        <AppText variant="caption" color="textSecondary" style={styles.description}>
          Export your fitwise dataset as a raw text string to paste somewhere safe, or restore an existing backup.
        </AppText>
        
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: theme.border }]}
            onPress={() => setBackupModalVisible(true)}
          >
            <Ionicons name="cloud-upload-outline" size={20} color={theme.primary} />
            <AppText variant="bodyBold" color="primary">Export Data</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: theme.border }]}
            onPress={() => setImportModalVisible(true)}
          >
            <Ionicons name="cloud-download-outline" size={20} color={theme.primary} />
            <AppText variant="bodyBold" color="primary">Import Data</AppText>
          </TouchableOpacity>
        </View>
      </Card>

      <Card variant="normal" style={[styles.card, styles.dangerCard]}>
        <AppText variant="bodyBold" color="error">Factory Reset</AppText>
        <AppText variant="caption" color="textSecondary" style={styles.description}>
          Delete all stored data (workouts, weight trends, foods, and goals) to revert settings back to default.
        </AppText>
        <PrimaryButton
          title="Reset Local State Data"
          variant="danger"
          onPress={handleResetData}
          style={styles.resetBtn}
        />
      </Card>

      {/* Export Backup Modal */}
      <Modal visible={backupModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.modalHeader}>
                <AppText variant="h3">Export Fitwise Data</AppText>
                <TouchableOpacity onPress={() => setBackupModalVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalForm}>
                <AppText variant="body" color="textSecondary" style={styles.introText}>
                  Copy the text below and save it somewhere safe. You can paste this text back in the "Import" tab to restore your settings, workouts, and progress.
                </AppText>
                
                <TextInput
                  style={[styles.textarea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  value={JSON.stringify(state)}
                  editable={false}
                  selectTextOnFocus
                  multiline
                />
                
                <PrimaryButton
                  title="Copy to Clipboard"
                  onPress={handleCopyBackup}
                  style={styles.copyBtn}
                />
                
                <PrimaryButton
                  title="Done"
                  variant="outline"
                  onPress={() => setBackupModalVisible(false)}
                  style={styles.modalSubmitBtn}
                />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Import Backup Modal */}
      <Modal visible={importModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.modalHeader}>
                <AppText variant="h3">Import Fitwise Data</AppText>
                <TouchableOpacity onPress={() => setImportModalVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalForm}>
                <AppText variant="body" color="textSecondary" style={styles.introText}>
                  Paste your backup JSON string below. This will overwrite all current data in the application.
                </AppText>
                
                <TextInput
                  style={[styles.textarea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder="Paste backup JSON string here..."
                  placeholderTextColor={theme.textMuted}
                  value={importText}
                  onChangeText={setImportText}
                  multiline
                />
                
                <PrimaryButton
                  title="Verify & Restore Data"
                  onPress={handleImportBackup}
                  style={styles.modalSubmitBtn}
                />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    marginVertical: 16,
  },
  subtitle: {
    marginTop: 6,
  },
  card: {
    marginTop: 10,
    padding: 16,
  },
  dangerCard: {
    borderColor: 'rgba(239, 68, 68, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    lineHeight: 16,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  resetBtn: {
    height: 46,
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalForm: {
    paddingBottom: 40,
  },
  introText: {
    lineHeight: 18,
    marginBottom: 16,
  },
  textarea: {
    height: 180,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    lineHeight: 18,
    textAlignVertical: 'top',
    fontFamily: 'System',
  },
  copyBtn: {
    marginTop: 20,
    marginBottom: 4,
  },
  modalSubmitBtn: {
    marginTop: 8,
    marginBottom: 16,
  },
});
export default BackupRestoreScreen;
