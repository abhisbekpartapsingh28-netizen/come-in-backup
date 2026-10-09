import * as Haptics from "expo-haptics";
import Feather from "@react-native-vector-icons/feather";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

type Props = {
  qty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
  size?: "sm" | "md";
  testID?: string;
};

export function QuantityStepper({ qty, onAdd, onInc, onDec, size = "sm", testID }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  const haptic = () => {
    Haptics.selectionAsync().catch(() => {});
  };

  if (qty === 0) {
    return (
      <Pressable
        testID={testID ?? "add-to-cart-btn"}
        onPress={() => {
          haptic();
          onAdd();
        }}
        style={({ pressed }) => [
          size === "sm" ? styles.addBtnSm : styles.addBtnMd,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={size === "sm" ? styles.addTextSm : styles.addTextMd}>ADD</Text>
      </Pressable>
    );
  }

  return (
    <View
      testID={testID ?? "qty-stepper"}
      style={size === "sm" ? styles.stepperSm : styles.stepperMd}
    >
      <Pressable
        testID="qty-dec-btn"
        onPress={() => {
          haptic();
          onDec();
        }}
        style={styles.stepBtn}
        hitSlop={6}
      >
        <Feather name="minus" size={size === "sm" ? 14 : 18} color={colors.onBrandPrimary} />
      </Pressable>
      <Text style={size === "sm" ? styles.qtyTextSm : styles.qtyTextMd}>{qty}</Text>
      <Pressable
        testID="qty-inc-btn"
        onPress={() => {
          haptic();
          onInc();
        }}
        style={styles.stepBtn}
        hitSlop={6}
      >
        <Feather name="plus" size={size === "sm" ? 14 : 18} color={colors.onBrandPrimary} />
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  addBtnSm: {
    minWidth: 68,
    height: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnMd: {
    minWidth: 100,
    height: 46,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  addTextSm: {
    color: colors.brandPrimary,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  addTextMd: {
    color: colors.onBrandPrimary,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  stepperSm: {
    minWidth: 68,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
  },
  stepperMd: {
    minWidth: 120,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
  },
  stepBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyTextSm: {
    color: colors.onBrandPrimary,
    fontSize: 13,
    fontWeight: "800",
    minWidth: 16,
    textAlign: "center",
  },
  qtyTextMd: {
    color: colors.onBrandPrimary,
    fontSize: 15,
    fontWeight: "800",
    minWidth: 20,
    textAlign: "center",
  },
}));
