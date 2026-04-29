import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

function formatValue(value: string | null | undefined) {
  if (!value || !value.trim()) {
    return "-";
  }

  return value;
}

export default function ProfileScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const { user, signOut, isLoading } = useAuthContext();

  const pageBackground = isDark ? "#11131A" : "#F7F7FB";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const mutedText = isDark ? "#9EA3BA" : "#868A9F";
  const softBlock = isDark ? "#242735" : "#F2F3F8";

  const initials = `${user?.civilite?.slice(0, 1) ?? ""}${
    user?.nom?.slice(0, 1)?.toUpperCase() ?? "U"
  }`;

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}>
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Mon profil" />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: cardBackground,
              shadowColor: "#10131F",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.22 : 0.08,
              shadowRadius: 18,
              elevation: 3,
            },
          ]}
        >
          <View style={styles.topRow}>
            <View style={styles.avatarWrap}>
              <ThemedText style={styles.avatarText}>{initials}</ThemedText>
            </View>
            <View style={styles.topInfo}>
              <ThemedText type="defaultSemiBold" style={styles.nameText}>
                {formatValue(user?.nom)}
              </ThemedText>
              <ThemedText style={[styles.roleText, { color: mutedText }]}>
                {formatValue(user?.type)}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.infoStrip, { backgroundColor: softBlock }]}>
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: mutedText }]}>
                Code
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.infoValue}>
                {formatValue(user?.code)}
              </ThemedText>
            </View>
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: mutedText }]}>
                Agence
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.infoValue}>
                {formatValue(user?.nomAgence)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.detailList}>
            <View style={styles.detailRow}>
              <MaterialIcons name="mail-outline" size={18} color={mutedText} />
              <ThemedText style={styles.detailText}>
                {formatValue(user?.email)}
              </ThemedText>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="phone-iphone" size={18} color={mutedText} />
              <ThemedText style={styles.detailText}>
                {formatValue(user?.telMobile)}
              </ThemedText>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="home-work" size={18} color={mutedText} />
              <ThemedText style={styles.detailText}>
                {formatValue(user?.adresse)}
              </ThemedText>
            </View>
          </View>
        </View>

        <Pressable
          onPress={handleSignOut}
          disabled={isLoading}
          style={[
            styles.signOutButton,
            isLoading ? styles.signOutDisabled : null,
          ]}
        >
          <MaterialIcons name="logout" size={18} color="#FFFFFF" />
          <ThemedText style={styles.signOutText}>Se deconnecter</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  headerWrap: {
    marginTop: -16,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 14,
  },
  profileCard: {
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#1F8B82",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  topInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: 21,
    lineHeight: 26,
  },
  roleText: {
    marginTop: 2,
    fontSize: 13,
  },
  infoStrip: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
  },
  detailList: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
  },
  signOutButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: "#E05252",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  signOutText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  signOutDisabled: {
    opacity: 0.7,
  },
});
