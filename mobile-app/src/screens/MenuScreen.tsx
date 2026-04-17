import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const menuItems = [
  { icon: 'account', label: 'Profile' },
  { icon: 'map-marker', label: 'Track Order' },
  { icon: 'clipboard-list', label: 'My Orders' },
  { icon: 'phone', label: 'My Address' },
];

const helpItems = [
  { icon: 'chat', label: 'Live Chat' },
  { icon: 'help-circle', label: 'Help & Support' },
  { icon: 'information', label: 'About Us' },
  { icon: 'file-document', label: 'Terms & Conditions' },
  { icon: 'shield-check', label: 'Privacy Policy' },
];

export default function MenuScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Icon name="account" size={40} color="#ffffff" />
        </View>
        <View>
          <Text style={styles.userName}>Guest User</Text>
          <Text style={styles.userSubtitle}>Sign in to continue</Text>
        </View>
      </View>

      {/* Main Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <Icon name={item.icon} size={22} color="#6b7280" />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Icon name="chevron-right" size={22} color="#9ca3af" style={styles.chevron} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Help Section */}
      <Text style={styles.sectionTitle}>Help & Support</Text>
      <View style={styles.menuSection}>
        {helpItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <Icon name={item.icon} size={22} color="#6b7280" />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Icon name="chevron-right" size={22} color="#9ca3af" style={styles.chevron} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  profileSection: {
    backgroundColor: '#7c3aed',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  userSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7c3aed',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  menuSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    marginLeft: 12,
  },
  chevron: {
    marginLeft: 'auto',
  },
});
