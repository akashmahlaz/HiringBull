import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';

// ─── Types ───────────────────────────────────────────────────────────────────
type ResourceItem = {
  id: string;
  route: string;
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

const C = {
  green: '#2ec27e',
  purple: '#7c3aed',
  amber: '#f5b942',
  blue: '#3b82f6',
  teal: '#0d9488',
};

const ICON = 40;

// ─── Card Icons (SVG) ────────────────────────────────────────────────────────
function CompensationIcon() {
  return (
    <Svg width={ICON} height={ICON} viewBox="0 0 40 40" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={C.green} strokeWidth="1.8" />
      <Path
        d="M13.2 8.4c-.6-.6-1.6-.9-2.6-.5-1 .4-1.3 1.5-.6 2 .6.5 2 .4 2.6 1 .7.5.4 1.6-.6 2-1 .4-2 .1-2.6-.5M11 6.4v9.2"
        stroke={C.green}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <Rect x="22" y="22" width="4" height="10" rx="1" fill={C.green} />
      <Rect x="28" y="18" width="4" height="14" rx="1" fill={C.green} />
      <Rect x="34" y="14" width="4" height="18" rx="1" fill={C.green} />
    </Svg>
  );
}

function InterviewExperiencesIcon() {
  return (
    <Svg width={ICON} height={ICON} viewBox="0 0 40 40" fill="none">
      <Path
        d="M6 8c0-2.2 1.8-4 4-4h20c2.2 0 4 1.8 4 4v14c0 2.2-1.8 4-4 4H20l-7 7v-7h-3c-2.2 0-4-1.8-4-4V8z"
        stroke={C.purple}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <Circle cx="14" cy="15" r="1.8" fill={C.purple} />
      <Circle cx="20" cy="15" r="1.8" fill={C.purple} />
      <Circle cx="26" cy="15" r="1.8" fill={C.purple} />
    </Svg>
  );
}

function AICoachIcon() {
  return (
    <Svg width={ICON} height={ICON} viewBox="0 0 40 40" fill="none">
      <Path
        d="M22 4c.8 7 2.2 9 6 11.5-3.8 2.5-5.2 4.5-6 11.5-.8-7-2.2-9-6-11.5 3.8-2.5 5.2-4.5 6-11.5z"
        stroke={C.amber}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <Path
        d="M32 22c.4 3.4 1.2 4.4 3 5.8-1.8 1.4-2.6 2.4-3 5.8-.4-3.4-1.2-4.4-3-5.8 1.8-1.4 2.6-2.4 3-5.8z"
        stroke={C.amber}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function QuestionsToSolveIcon() {
  return (
    <Svg width={ICON} height={ICON} viewBox="0 0 40 40" fill="none">
      <Path
        d="M8 5h17l8 8v22c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2z"
        stroke={C.blue}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <Path d="M25 5v8h8" stroke={C.blue} strokeWidth="1.8" strokeLinejoin="round" />
      <Line x1="12" y1="22" x2="28" y2="22" stroke={C.blue} strokeWidth="1.6" strokeLinecap="round" />
      <Line x1="12" y1="27" x2="28" y2="27" stroke={C.blue} strokeWidth="1.6" strokeLinecap="round" />
      <Line x1="12" y1="32" x2="22" y2="32" stroke={C.blue} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

function MockInterviewsIcon() {
  return (
    <Svg width={ICON} height={ICON} viewBox="0 0 40 40" fill="none">
      <Circle cx="20" cy="13" r="7" stroke={C.teal} strokeWidth="1.8" />
      <Path
        d="M6 36c0-7 6.3-12 14-12s14 5 14 12"
        stroke={C.teal}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function OnlineResourcesIcon() {
  return (
    <Svg width={ICON} height={ICON} viewBox="0 0 40 40" fill="none">
      <Circle cx="20" cy="20" r="15" stroke={C.blue} strokeWidth="1.8" />
      <Ellipse cx="20" cy="20" rx="6" ry="15" stroke={C.blue} strokeWidth="1.5" />
      <Line x1="5" y1="20" x2="35" y2="20" stroke={C.blue} strokeWidth="1.5" />
      <Path d="M8 12c4-3 20-3 24 0" stroke={C.blue} strokeWidth="1.5" fill="none" />
      <Path d="M8 28c4 3 20 3 24 0" stroke={C.blue} strokeWidth="1.5" fill="none" />
    </Svg>
  );
}

// ─── Resource Data ────────────────────────────────────────────────────────────
const RESOURCES: ResourceItem[] = [
  {
    id: 'compensation',
    route: '/resources/compensation',
    title: 'Compensation Insights',
    description: 'Explore salary ranges, perks & company benefits',
    Icon: CompensationIcon,
  },
  {
    id: 'interview-experiences',
    route: '/resources/interview-experiences',
    title: 'Interview Experiences',
    description: 'Real interview experiences shared by candidates',
    Icon: InterviewExperiencesIcon,
  },
  {
    id: 'ai-coach',
    route: '/resources/ai-coach',
    title: 'AI Interview Coach',
    description: 'Get AI-powered feedback to improve',
    Icon: AICoachIcon,
  },
  {
    id: 'questions',
    route: '/resources/questions',
    title: 'Questions to Solve',
    description: 'Practice technical & aptitude questions',
    Icon: QuestionsToSolveIcon,
  },
  {
    id: 'mock-interviews',
    route: '/resources/mock-interviews',
    title: 'Mock Interviews',
    description: 'Practice with topmate profiles & experts',
    Icon: MockInterviewsIcon,
  },
  {
    id: 'online-resources',
    route: '/resources/online-resources',
    title: 'Online Resources',
    description: 'Curated blogs, videos & study materials',
    Icon: OnlineResourcesIcon,
  },
];

// ─── Resource Card ────────────────────────────────────────────────────────────
function ResourceCard({ item }: { item: ResourceItem }) {
  const router = useRouter();
  const { Icon, title, description, route } = item;

  return (
    <Pressable
      onPress={() => router.push(route as never)}
      className="h-[200px] flex-1 rounded-2xl border border-neutral-200 bg-white p-4 active:opacity-75"
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View className="mb-3 items-start">
        <Icon />
      </View>

      <Text
        className="mb-1 text-[15px] font-bold leading-[20px] text-neutral-900"
        numberOfLines={2}
      >
        {title}
      </Text>

      <Text
        className="text-[12px] leading-[17px] text-neutral-500"
        numberOfLines={3}
      >
        {description}
      </Text>

      <View className="mt-auto items-end">
        <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
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
    () => chunkArray(filteredResources, 2),
    [filteredResources]
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <FocusAwareStatusBar />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-5 pb-10">
          <View className="pb-1 pt-4">
            <Text className="mb-2 text-[36px] font-extrabold leading-[42px] text-neutral-900">
              Resources
            </Text>
            <Text className="text-[16px] leading-[24px] text-neutral-500">
              Everything you need to prepare{'\n'}and ace your interviews.
            </Text>
          </View>

          <View className="my-6 h-14 flex-row items-center gap-3 rounded-2xl bg-neutral-100 px-4">
            <Ionicons name="search-outline" size={20} color="#9ca3af" />
            <TextInput
              placeholder="Search resources"
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              className="flex-1 p-0 text-[16px] text-neutral-900"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
              </Pressable>
            )}
          </View>

          {filteredResources.length === 0 ? (
            <View className="mt-16 items-center justify-center">
              <Ionicons name="search-outline" size={48} color="#9ca3af" />
              <Text className="mt-4 text-center text-base font-semibold text-neutral-500">
                No resources found
              </Text>
              <Text className="mt-1 text-center text-[13px] text-neutral-400">
                Try a different keyword
              </Text>
            </View>
          ) : (
            rows.map((row, rowIdx) => (
              <View key={rowIdx} className="mb-4 flex-row gap-4">
                {row.map((item) => (
                  <ResourceCard key={item.id} item={item} />
                ))}
                {row.length < 2 &&
                  Array.from({ length: 2 - row.length }).map((_, i) => (
                    <View key={`ph-${i}`} className="flex-1" />
                  ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
