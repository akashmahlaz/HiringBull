import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';

// ─── Types ───────────────────────────────────────────────────────────────────
type ResourceItem = {
  id: string;
  title: string;
  description: string;
  Icon: React.ComponentType<object>;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, (i + 1) * size)
  );
}

// ─── Card Icons (SVG) ────────────────────────────────────────────────────────
const ICON_W = 48;
const ICON_H = 44;

function CompensationIcon(_props: object) {
  return (
    <Svg width={ICON_W} height={ICON_H} viewBox="0 0 48 44">
      {/* Dollar coin circle */}
      <Circle
        cx="17"
        cy="20"
        r="12"
        stroke="#15803d"
        strokeWidth="2"
        fill="none"
      />
      {/* Dollar sign vertical stem */}
      <Line
        x1="17"
        y1="12"
        x2="17"
        y2="28"
        stroke="#15803d"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Dollar sign upper curve */}
      <Path
        d="M13.5 15.5 Q17 13.5 20.5 15.5 Q22.5 17.5 17 19"
        stroke="#15803d"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Dollar sign lower curve */}
      <Path
        d="M17 19 Q22.5 20.5 20.5 22.5 Q17 24.5 13.5 22.5"
        stroke="#15803d"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Bar chart — 3 ascending bars */}
      <Rect x="27" y="32" width="5" height="8" rx="1.5" fill="#15803d" />
      <Rect x="34" y="28" width="5" height="12" rx="1.5" fill="#15803d" />
      <Rect x="41" y="24" width="5" height="16" rx="1.5" fill="#15803d" />
    </Svg>
  );
}

function InterviewExperiencesIcon(_props: object) {
  return (
    <Svg width={ICON_W} height={ICON_H} viewBox="0 0 48 44">
      {/* Rounded speech bubble with tail at bottom-left */}
      <Path
        d="M6 6 Q6 2 10 2 L38 2 Q42 2 42 6 L42 28 Q42 32 38 32 L22 32 L13 42 L13 32 Q6 32 6 28 Z"
        stroke="#5b21b6"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Three dots inside bubble */}
      <Circle cx="18" cy="17" r="2.5" fill="#5b21b6" />
      <Circle cx="24" cy="17" r="2.5" fill="#5b21b6" />
      <Circle cx="30" cy="17" r="2.5" fill="#5b21b6" />
    </Svg>
  );
}

function AICoachIcon(_props: object) {
  return (
    <Svg width={ICON_W} height={ICON_H} viewBox="0 0 48 44">
      {/* Large 4-pointed sparkle */}
      <Path
        d="M30 2 Q31.5 14 35 18 Q39 21 46 22 Q39 23 35 26 Q31.5 30 30 42 Q28.5 30 25 26 Q21 23 14 22 Q21 21 25 18 Q28.5 14 30 2 Z"
        stroke="#d97706"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Small sparkle — top-left */}
      <Path
        d="M12 4 Q12.5 9.5 14 11.5 Q15.5 13 19 13.5 Q15.5 14 14 15.5 Q12.5 17 12 22.5 Q11.5 17 10 15.5 Q8.5 14 5 13.5 Q8.5 13 10 11.5 Q11.5 9.5 12 4 Z"
        stroke="#d97706"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function QuestionsToSolveIcon(_props: object) {
  return (
    <Svg width={ICON_W} height={ICON_H} viewBox="0 0 48 44">
      {/* Document body */}
      <Path
        d="M9 2 L30 2 L41 13 L41 42 Q41 43.5 39.5 43.5 L9 43.5 Q7.5 43.5 7.5 42 L7.5 3.5 Q7.5 2 9 2 Z"
        stroke="#2563eb"
        strokeWidth="2"
        fill="none"
      />
      {/* Page-fold corner */}
      <Path d="M30 2 L30 13 L41 13" stroke="#2563eb" strokeWidth="2" fill="none" />
      {/* Text line 1 */}
      <Line
        x1="14"
        y1="22"
        x2="35"
        y2="22"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Text line 2 */}
      <Line
        x1="14"
        y1="28"
        x2="35"
        y2="28"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Text line 3 — shorter */}
      <Line
        x1="14"
        y1="34"
        x2="27"
        y2="34"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function MockInterviewsIcon(_props: object) {
  return (
    <Svg width={ICON_W} height={ICON_H} viewBox="0 0 48 44">
      {/* Head circle */}
      <Circle
        cx="24"
        cy="13"
        r="9"
        stroke="#0e7490"
        strokeWidth="2"
        fill="none"
      />
      {/* Shoulders arc */}
      <Path
        d="M4 44 Q4 29 24 29 Q44 29 44 44"
        stroke="#0e7490"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function OnlineResourcesIcon(_props: object) {
  return (
    <Svg width={ICON_W} height={ICON_H} viewBox="0 0 48 44">
      {/* Globe outline */}
      <Circle
        cx="24"
        cy="22"
        r="18"
        stroke="#2563eb"
        strokeWidth="2"
        fill="none"
      />
      {/* Vertical longitude ellipse */}
      <Ellipse
        cx="24"
        cy="22"
        rx="8"
        ry="18"
        stroke="#2563eb"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Equator */}
      <Line
        x1="6"
        y1="22"
        x2="42"
        y2="22"
        stroke="#2563eb"
        strokeWidth="1.5"
      />
      {/* Upper latitude */}
      <Path
        d="M9 13 Q24 9 39 13"
        stroke="#2563eb"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Lower latitude */}
      <Path
        d="M9 31 Q24 35 39 31"
        stroke="#2563eb"
        strokeWidth="1.5"
        fill="none"
      />
    </Svg>
  );
}

// ─── Resource Data ────────────────────────────────────────────────────────────
const RESOURCES: ResourceItem[] = [
  {
    id: 'compensation',
    title: 'Compensation Insights',
    description: 'Explore salary ranges, perks & company benefits',
    Icon: CompensationIcon,
  },
  {
    id: 'interview-experiences',
    title: 'Interview Experiences',
    description: 'Real interview experiences shared by candidates',
    Icon: InterviewExperiencesIcon,
  },
  {
    id: 'ai-coach',
    title: 'AI Interview Coach',
    description: 'Get AI-powered feedback to improve',
    Icon: AICoachIcon,
  },
  {
    id: 'questions',
    title: 'Questions to Solve',
    description: 'Practice technical & aptitude questions',
    Icon: QuestionsToSolveIcon,
  },
  {
    id: 'mock-interviews',
    title: 'Mock Interviews',
    description: 'Practice with topmate profiles & experts',
    Icon: MockInterviewsIcon,
  },
  {
    id: 'online-resources',
    title: 'Online Resources',
    description: 'Curated blogs, videos & study materials',
    Icon: OnlineResourcesIcon,
  },
];

// ─── Resource Card ────────────────────────────────────────────────────────────
function ResourceCard({ item }: { item: ResourceItem }) {
  const { Icon, title, description } = item;

  return (
    <Pressable
      style={({ pressed }) => [
        {
          flex: 1,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
      className="border border-neutral-200 rounded-2xl bg-white p-4"
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {/* Icon */}
      <View className="mb-4">
        <Icon />
      </View>

      {/* Title */}
      <Text
        className="text-sm font-bold text-neutral-900 leading-5 mb-2"
        numberOfLines={3}
      >
        {title}
      </Text>

      {/* Description */}
      <Text className="text-xs text-neutral-500 leading-relaxed flex-1">
        {description}
      </Text>

      {/* Arrow */}
      <View className="mt-4 items-end">
        <Ionicons name="chevron-forward" size={16} color="#a3a3a3" />
      </View>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function Resources() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return RESOURCES;
    return RESOURCES.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const rows = useMemo(
    () => chunkArray(filteredResources, 3),
    [filteredResources]
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <FocusAwareStatusBar />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View className="pt-6 pb-2">
          <Text className="text-4xl font-bold text-neutral-900 mb-2">
            Resources
          </Text>
          <Text className="text-base text-neutral-500 leading-relaxed">
            Everything you need to prepare{'\n'}and ace your interviews.
          </Text>
        </View>

        {/* ── Search Bar ─────────────────────────────────────────────────── */}
        <View className="flex-row items-center rounded-2xl bg-neutral-100 border border-neutral-200 px-4 py-3 gap-3 my-6">
          <Ionicons name="search-outline" size={18} color="#a3a3a3" />
          <TextInput
            placeholder="Search resources"
            placeholderTextColor="#a3a3a3"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            style={{ flex: 1, fontSize: 15, color: '#171717' }}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#a3a3a3" />
            </Pressable>
          )}
        </View>

        {/* ── Grid ───────────────────────────────────────────────────────── */}
        {filteredResources.length === 0 ? (
          <View className="mt-16 items-center justify-center">
            <Ionicons name="search-outline" size={48} color="#a3a3a3" />
            <Text className="mt-4 text-center text-base font-medium text-neutral-500">
              No resources found
            </Text>
            <Text className="mt-1 text-center text-sm text-neutral-400">
              Try a different keyword
            </Text>
          </View>
        ) : (
          rows.map((row, rowIdx) => (
            <View key={rowIdx} className="flex-row gap-3 mb-3">
              {row.map((item) => (
                <ResourceCard key={item.id} item={item} />
              ))}
              {/* Fill empty slots so last row aligns left */}
              {row.length < 3 &&
                Array.from({ length: 3 - row.length }).map((_, i) => (
                  <View key={`placeholder-${i}`} style={{ flex: 1 }} />
                ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
