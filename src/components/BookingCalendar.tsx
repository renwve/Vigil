import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { fonts, palette } from "../theme";

type Props = { value: string; onChange: (date: string) => void };

const keyFor = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const monthLabel = (d: Date) =>
  d.toLocaleDateString(undefined, { month: "long", year: "numeric" });

export default function BookingCalendar({ value, onChange }: Props) {
  const { colors } = useTheme();
  const [monthOpen, setMonthOpen] = useState(false);
  const [shownMonth, setShownMonth] = useState(() => {
    const d = value ? new Date(`${value}T12:00:00`) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const selected = value ? new Date(`${value}T12:00:00`) : new Date();

  const week = useMemo(() => {
    const start = new Date(selected);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [value]);

  const days = useMemo(() => {
    const first = new Date(shownMonth.getFullYear(), shownMonth.getMonth(), 1);
    const offset = first.getDay();
    const count = new Date(
      shownMonth.getFullYear(),
      shownMonth.getMonth() + 1,
      0
    ).getDate();
    return [
      ...Array(offset).fill(null),
      ...Array.from(
        { length: count },
        (_, i) => new Date(shownMonth.getFullYear(), shownMonth.getMonth(), i + 1)
      ),
    ];
  }, [shownMonth]);

  const s = styles(colors);

  const choose = (d: Date) => {
    onChange(keyFor(d));
    setShownMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const changeMonth = (delta: number) =>
    setShownMonth(new Date(shownMonth.getFullYear(), shownMonth.getMonth() + delta, 1));

  return (
    <View style={s.card}>
      <TouchableOpacity
        style={s.titleRow}
        onPress={() => setMonthOpen(!monthOpen)}
        activeOpacity={0.8}
      >
        <View>
          <Text style={s.eyebrow}>SELECT A DATE</Text>
          <Text style={s.title}>{monthLabel(selected)}</Text>
        </View>
        <Text style={s.expand}>{monthOpen ? "WEEKLY －" : "MONTHLY ＋"}</Text>
      </TouchableOpacity>

      {!monthOpen ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.weekRow}
        >
          {week.map((d) => {
            const chosen = keyFor(d) === value;
            return (
              <TouchableOpacity
                key={keyFor(d)}
                onPress={() => choose(d)}
                style={[s.day, chosen && s.daySelected]}
              >
                <Text style={[s.weekday, chosen && s.selectedText]}>
                  {d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase()}
                </Text>
                <Text style={[s.dayNumber, chosen && s.selectedText]}>
                  {d.getDate()}
                </Text>
                <View style={[s.dot, chosen && s.dotSelected]} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <>
          <View style={s.monthNav}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={s.arrow}>
              <Text style={s.arrowText}>‹</Text>
            </TouchableOpacity>
            <Text style={s.monthText}>{monthLabel(shownMonth)}</Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={s.arrow}>
              <Text style={s.arrowText}>›</Text>
            </TouchableOpacity>
          </View>
          <View style={s.grid}>
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <Text key={`${d}${i}`} style={s.weekHeader}>
                {d}
              </Text>
            ))}
            {days.map((d, i) =>
              d ? (
                <TouchableOpacity
                  key={keyFor(d)}
                  onPress={() => choose(d)}
                  style={[s.monthDay, keyFor(d) === value && s.daySelected]}
                >
                  <Text
                    style={[s.monthDayText, keyFor(d) === value && s.selectedText]}
                  >
                    {d.getDate()}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View key={`empty-${i}`} style={s.monthDay} />
              )
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = (c: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.surface,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: 18,
      padding: 16,
      marginBottom: 18,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    eyebrow: { fontFamily: fonts.bold, color: palette.brand, fontSize: 9, letterSpacing: 1.4 },
    title: { color: c.text, fontFamily: fonts.bold, fontSize: 17, marginTop: 3 },
    expand: { color: palette.brand, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.4 },
    weekRow: { gap: 8 },
    day: {
      width: 44,
      height: 70,
      borderRadius: 13,
      backgroundColor: c.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    daySelected: { backgroundColor: palette.brand },
    weekday: { fontFamily: fonts.semibold, color: c.muted, fontSize: 9 },
    dayNumber: { fontFamily: fonts.bold, color: c.text, fontSize: 16, marginTop: 5 },
    selectedText: { color: "#FFFFFF" },
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: palette.brand, marginTop: 4 },
    dotSelected: { backgroundColor: "#FFFFFF" },
    monthNav: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    arrow: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: c.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    arrowText: { color: c.text, fontSize: 24, lineHeight: 27 },
    monthText: { color: c.text, fontFamily: fonts.semibold, fontSize: 13 },
    grid: { flexDirection: "row", flexWrap: "wrap" },
    weekHeader: {
      width: `${100 / 7}%`,
      textAlign: "center",
      color: c.muted,
      fontFamily: fonts.bold,
      fontSize: 10,
      paddingVertical: 8,
    },
    monthDay: {
      width: `${100 / 7}%`,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
    },
    monthDayText: { color: c.text, fontFamily: fonts.medium, fontSize: 12 },
  });