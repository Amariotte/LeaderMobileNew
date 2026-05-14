import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { Href } from "expo-router";
import { router, usePathname } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";

type HeaderVariant = "surface" | "primary";

type AppRoute =
  | "/"
  | "/profile"
  | "/clients"
  | "/vehicules"
  | "/contrats"
  | "/encaissements-primes"
  | "/operations-diverses"
  | "/stock-mon"
  | "/stock-courtiers"
  | "/stock-partenaires"
  | "/stock-producteurs";

type SubMenuKey = "souscriptions" | "stocks" | "comptabilites" | "settings";

type DrawerItem = {
  id:
    | "dashboard"
    | "souscriptions"
    | "stocks"
    | "comptabilites"
    | "parametres-parent";
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route?: AppRoute;
  subMenuKey?: SubMenuKey;
};

type DrawerSubItem = {
  id: string;
  label: string;
  route?: AppRoute;
};

type AppHeaderDrawerProps = {
  title: string;
  variant?: HeaderVariant;
};

const DRAWER_WIDTH = 280;

const DRAWER_ITEMS: DrawerItem[] = [
  { id: "dashboard", label: "Tableau de bord", icon: "dashboard", route: "/" },
  { id: "souscriptions", label: "Souscriptions", icon: "sell", subMenuKey: "souscriptions" },
  { id: "stocks", label: "Stocks", icon: "inventory", subMenuKey: "stocks" },
  { id: "comptabilites", label: "Comptabilités", icon: "inventory", subMenuKey: "comptabilites" },
  {id: "parametres-parent",label: "Parametres",icon: "settings",subMenuKey: "settings",},
];

const SUB_MENU_ITEMS: Record<SubMenuKey, DrawerSubItem[]> = {
  souscriptions: [
    { id: "clients", label: "Clients", route: "/clients" },
    { id: "vehicules", label: "Véhicules", route: "/vehicules" },
    { id: "cotations", label: "Cotations" },
    { id: "contrats", label: "Contrats", route: "/contrats" },
    { id: "polices", label: "Polices" },
  ],
  stocks: [
    { id: "stock-me", label: "Mon stock", route: "/stock-mon" },
    { id: "stock-courtiers", label: "Stocks courtiers", route: "/stock-courtiers" },
    { id: "stock-partenaires", label: "Stocks partenaires", route: "/stock-partenaires" },
    { id: "stock-producteurs", label: "Stocks producteurs", route: "/stock-producteurs" },
  ],
  comptabilites: [
    { id: "encaissements-primes", label: "Encaissements Primes", route: "/encaissements-primes" },
    { id: "operations-diverses", label: "Opérations diverses", route: "/operations-diverses" },
  ],

  settings: [
    { id: "settings-familles", label: "Familles" },
    { id: "settings-sites", label: "Sites" },
    { id: "settings-mode-paiement", label: "Mode de paiement" },
  ],
};

function toHref(route: AppRoute): Href {
  if (route === "/" || route === "/profile") {
    return route;
  }

  return `/(commerce)${route}` as Href;
}

export default function AppHeaderDrawer({
  title,
  variant = "primary",
}: AppHeaderDrawerProps) {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const pathname = usePathname();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<SubMenuKey, boolean>>(
    {
      souscriptions:
        pathname === "/clients" || pathname === "/vehicules" || pathname === "/contrats",
      stocks:
        pathname === "/stock-mon" ||
        pathname === "/stock-courtiers" ||
        pathname === "/stock-partenaires" ||
        pathname === "/stock-producteurs",
      comptabilites:
        pathname === "/encaissements-primes" || pathname === "/operations-diverses",
      settings: false,
    },
  );
  const drawerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setOpenSubMenus((prev) => ({
      ...prev,
      souscriptions:
        pathname === "/clients" || pathname === "/vehicules" || pathname === "/contrats"
          ? true
          : prev.souscriptions,
      stocks:
        pathname === "/stock-mon" ||
        pathname === "/stock-courtiers" ||
        pathname === "/stock-partenaires" ||
        pathname === "/stock-producteurs"
          ? true
          : prev.stocks,
      comptabilites:
        pathname === "/encaissements-primes" || pathname === "/operations-diverses"
          ? true
          : prev.comptabilites,
    }));
  }, [pathname]);

  const iconColor =
    variant === "primary" ? "#FFFFFF" : isDark ? "#FFFFFF" : "#2D3142";

  const buttonBg =
    variant === "primary"
      ? "rgba(255,255,255,0.22)"
      : isDark
        ? "#252A39"
        : "#FFFFFF";

  const titleColor = variant === "primary" ? "#FFFFFF" : undefined;
  const mutedText = isDark ? "#A3A9C3" : "#7C8097";
  const headerBg = isDark ? "#1F8B82" : "#1F8B82";

  const openDrawer = () => {
    setIsDrawerVisible(true);
    Animated.timing(drawerAnimation, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnimation, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsDrawerVisible(false);
      }
    });
  };

  const drawerTranslateX = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  const overlayOpacity = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const handleDrawerItemPress = (item: DrawerItem) => {
    if (item.subMenuKey) {
      setOpenSubMenus((prev) => ({
        ...prev,
        [item.subMenuKey!]: !prev[item.subMenuKey!],
      }));
      return;
    }

    if (!item.route) {
      return;
    }

    closeDrawer();

    if (pathname !== item.route) {
      router.push(toHref(item.route));
    }
  };

  const handleSubItemPress = (route?: AppRoute) => {
    if (!route) {
      return;
    }

    closeDrawer();

    if (pathname !== route) {
      router.push(toHref(route));
    }
  };

  return (
    <>
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <Pressable
          onPress={openDrawer}
          style={[styles.iconButton, { backgroundColor: buttonBg }]}
        >
          <MaterialIcons name="menu" size={20} color={iconColor} />
        </Pressable>

        <ThemedText
          type="subtitle"
          style={[styles.title, titleColor ? { color: titleColor } : null]}
        >
          {title}
        </ThemedText>

        <View style={styles.rightGroup}>
          <Pressable style={[styles.iconButton, { backgroundColor: buttonBg }]}>
            <MaterialIcons name="notifications" size={19} color={iconColor} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/profile")}
            style={styles.avatar}
          >
            <ThemedText style={styles.avatarText}>AG</ThemedText>
          </Pressable>
        </View>
      </View>

      <Modal
        transparent
        visible={isDrawerVisible}
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalRoot}>
          <View style={styles.drawerLayer} pointerEvents="box-none">
            <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer}>
              <Animated.View
                style={[styles.drawerOverlay, { opacity: overlayOpacity }]}
              />
            </Pressable>

            <Animated.View
              style={[
                styles.drawer,
                {
                  backgroundColor: isDark ? "#181926" : "#FFFFFF",
                  transform: [{ translateX: drawerTranslateX }],
                },
              ]}
            >
              <View style={styles.drawerHeader}>
                <View style={styles.drawerBrand}>
                  <View
                    style={[
                      styles.drawerLogo,
                      { backgroundColor: isDark ? "#2D2F4D" : "#EEF0FF" },
                    ]}
                  >
                    <MaterialIcons
                      name="local-fire-department"
                      size={18}
                      color="#1F8B82"
                    />
                  </View>
                  <View>
                    <ThemedText style={styles.drawerTitle}>Leader</ThemedText>
                    <ThemedText
                      style={[styles.drawerSubtitle, { color: mutedText }]}
                    >
                      Gestion des courtages d&apos;assurance
                    </ThemedText>
                  </View>
                </View>

                <Pressable
                  onPress={closeDrawer}
                  style={styles.drawerCloseButton}
                >
                  <MaterialIcons
                    name="close"
                    size={18}
                    color={isDark ? "#FFFFFF" : "#1E2238"}
                  />
                </Pressable>
              </View>

              <View style={styles.drawerDivider} />

              <ScrollView
                style={styles.drawerMenuContainer}
                contentContainerStyle={styles.drawerMenu}
                showsVerticalScrollIndicator={false}
              >
                {DRAWER_ITEMS.map((item) => {
                  const subItems = item.subMenuKey
                    ? SUB_MENU_ITEMS[item.subMenuKey]
                    : [];
                  const isParentWithSubMenu = Boolean(item.subMenuKey);
                  const isSubMenuOpen = item.subMenuKey
                    ? openSubMenus[item.subMenuKey]
                    : false;
                  const hasActiveSubItem = subItems.some(
                    (subItem) => subItem.route && pathname === subItem.route,
                  );
                  const isActive =
                    (item.route && pathname === item.route) ||
                    (isParentWithSubMenu && hasActiveSubItem);

                  return (
                    <View key={item.id}>
                      <Pressable
                        onPress={() => handleDrawerItemPress(item)}
                        style={[
                          styles.drawerItem,
                          isActive
                            ? {
                                backgroundColor: isDark ? "#252842" : "#F4F1FF",
                              }
                            : null,
                        ]}
                      >
                        <View
                          style={[
                            styles.drawerItemIcon,
                            {
                              backgroundColor: isDark ? "#252842" : "#F3F4FB",
                            },
                          ]}
                        >
                          <MaterialIcons
                            name={item.icon}
                            size={18}
                            color={isDark ? "#D9DBFF" : "#4D4F6E"}
                          />
                        </View>
                        <ThemedText style={styles.drawerItemLabel}>
                          {item.label}
                        </ThemedText>
                        <MaterialIcons
                          name={
                            isParentWithSubMenu
                              ? isSubMenuOpen
                                ? "expand-less"
                                : "expand-more"
                              : "chevron-right"
                          }
                          size={18}
                          color={isDark ? "#8F94C1" : "#A1A5C8"}
                        />
                      </Pressable>

                      {isParentWithSubMenu && isSubMenuOpen ? (
                        <View style={styles.subMenuWrap}>
                          {subItems.map((subItem) => {
                            const isSubActive = pathname === subItem.route;

                            return (
                              <Pressable
                                key={subItem.id}
                                onPress={() =>
                                  handleSubItemPress(subItem.route)
                                }
                                style={[
                                  styles.subMenuItem,
                                  isSubActive
                                    ? {
                                        backgroundColor: isDark
                                          ? "#22253C"
                                          : "#EEE8FF",
                                      }
                                    : null,
                                ]}
                              >
                                <View
                                  style={[
                                    styles.subMenuDot,
                                    {
                                      backgroundColor: isSubActive
                                        ? "#6B3CFF"
                                        : isDark
                                          ? "#5D638A"
                                          : "#A5AAC7",
                                    },
                                  ]}
                                />
                                <ThemedText style={styles.subMenuLabel}>
                                  {subItem.label}
                                </ThemedText>
                              </Pressable>
                            );
                          })}
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </ScrollView>
            </Animated.View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    lineHeight: 24,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFB357",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#2A1E12",
    fontSize: 11,
    fontWeight: "800",
  },
  modalRoot: {
    flex: 1,
  },
  drawerLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 11, 22, 0.38)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    paddingTop: 54,
    paddingHorizontal: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 14,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  drawerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  drawerLogo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  drawerTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "800",
  },
  drawerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  drawerCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(107,60,255,0.12)",
  },
  drawerDivider: {
    height: 1,
    backgroundColor: "rgba(125,130,170,0.18)",
    marginTop: 18,
    marginBottom: 14,
  },
  drawerMenu: {
    gap: 6,
    paddingBottom: 18,
  },
  drawerMenuContainer: {
    marginTop: 2,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  drawerItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  drawerItemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
  },
  subMenuWrap: {
    marginTop: 2,
    marginBottom: 8,
    marginLeft: 52,
    gap: 6,
  },
  subMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  subMenuDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subMenuLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
});
