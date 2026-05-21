import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  TextInput,
} from 'react-native';

import type {
  CategoryCountsResponse,
  Resource,
  ResourceCategory,
  ResourceType,
} from '@/api';
import { ComingSoonScreen } from '@/components/coming-soon-screen';
import { ScreenHeader } from '@/components/screen-header';
import { SafeAreaView, Text, View } from '@/components/ui';
import {
  useFetchResourceCategories,
  useFetchResources,
  useToggleResourceBookmark,
} from '@/features/resources';

// ─── Display config ──────────────────────────────────────────────────────────
const CATEGORY_META: Record<ResourceCategory, { label: string }> = {
  INTERVIEW_PREP: { label: 'Interview Prep' },
  SYSTEM_DESIGN: { label: 'System Design' },
  DSA: { label: 'DSA' },
  BEHAVIORAL: { label: 'Behavioral' },
  CAREER_GROWTH: { label: 'Career' },
  COMPANY_RESEARCH: { label: 'Companies' },
  RESUME: { label: 'Resume' },
  NEGOTIATION: { label: 'Negotiation' },
  TECH_BLOGS: { label: 'Tech Blogs' },
  PODCASTS_VIDEOS: { label: 'Podcasts' },
};

const TYPE_META: Record<ResourceType, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  ARTICLE: { label: 'Article', icon: 'document-text-outline' },
  VIDEO: { label: 'Video', icon: 'play-circle-outline' },
  BOOK: { label: 'Book', icon: 'book-outline' },
  COURSE: { label: 'Course', icon: 'school-outline' },
  TOOL: { label: 'Tool', icon: 'construct-outline' },
  PODCAST: { label: 'Podcast', icon: 'mic-outline' },
  REPO: { label: 'Repo', icon: 'logo-github' },
  NEWSLETTER: { label: 'Newsletter', icon: 'mail-outline' },
  CHEATSHEET: { label: 'Cheatsheet', icon: 'list-outline' },
};

function formatDuration(min?: number | null): string | null {
  if (!min || min <= 0) return null;
  if (min < 60) return `${min} min`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

function hostnameFromUrl(url: string): string {
  try {
    const m = url.match(/^https?:\/\/(?:www\.)?([^/]+)/i);
    return m ? m[1] : url;
  } catch {
    return url;
  }
}

// ─── Category Filter Chips ───────────────────────────────────────────────────
function CategoryChips({
  selected,
  onSelect,
  categories,
}: {
  selected: ResourceCategory | '';
  onSelect: (cat: ResourceCategory | '') => void;
  categories?: CategoryCountsResponse['data'];
}) {
  const items = useMemo(() => {
    const list: { value: ResourceCategory | ''; label: string; count?: number }[] = [
      { value: '', label: 'All', count: categories?.total },
    ];
    (Object.keys(CATEGORY_META) as ResourceCategory[]).forEach((key) => {
      const count = categories?.byCategory.find((c) => c.category === key)?.count;
      if (categories && (count ?? 0) === 0) return; // hide empty cats
      list.push({ value: key, label: CATEGORY_META[key].label, count });
    });
    return list;
  }, [categories]);

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={items}
      keyExtractor={(i) => i.value || 'all'}
      contentContainerClassName="px-4 py-3 gap-2"
      renderItem={({ item }) => {
        const active = selected === item.value;
        return (
          <Pressable
            onPress={() => onSelect(item.value)}
            className={`h-9 flex-row items-center rounded-full border px-4 ${
              active
                ? 'border-neutral-900 bg-neutral-900'
                : 'border-neutral-200 bg-white'
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text
              className={`text-[13px] font-semibold ${
                active ? 'text-white' : 'text-neutral-700'
              }`}
            >
              {item.label}
            </Text>
            {typeof item.count === 'number' && (
              <Text
                className={`ml-1.5 text-[12px] ${
                  active ? 'text-neutral-300' : 'text-neutral-400'
                }`}
              >
                {item.count}
              </Text>
            )}
          </Pressable>
        );
      }}
    />
  );
}

// ─── Resource Row ────────────────────────────────────────────────────────────
function ResourceRow({
  resource,
  onToggleBookmark,
}: {
  resource: Resource;
  onToggleBookmark: (id: string) => void;
}) {
  const open = useCallback(() => {
    Linking.openURL(resource.url).catch(() => {});
  }, [resource.url]);

  const typeMeta = TYPE_META[resource.type] ?? TYPE_META.ARTICLE;
  const duration = formatDuration(resource.estimated_min);
  const host = resource.source || hostnameFromUrl(resource.url);
  const initial = (resource.title?.[0] ?? '?').toUpperCase();

  return (
    <Pressable
      onPress={open}
      className="flex-row gap-3 px-4 py-4 active:bg-neutral-50"
      accessibilityRole="link"
      accessibilityLabel={`Open ${resource.title}`}
    >
      {/* Avatar */}
      <View className="h-11 w-11 items-center justify-center rounded-xl bg-neutral-100">
        <Ionicons name={typeMeta.icon} size={20} color="#525252" />
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text
          className="text-[15px] font-semibold leading-[20px] text-neutral-900"
          numberOfLines={2}
        >
          {resource.title}
        </Text>
        <Text
          className="mt-1 text-[13px] leading-[18px] text-neutral-500"
          numberOfLines={2}
        >
          {resource.description}
        </Text>

        {/* Meta row */}
        <View className="mt-2 flex-row flex-wrap items-center gap-2">
          <View className="rounded-full bg-neutral-100 px-2 py-0.5">
            <Text className="text-[11px] font-medium text-neutral-600">
              {typeMeta.label}
            </Text>
          </View>
          <Text className="text-[11px] text-neutral-400" numberOfLines={1}>
            {host}
          </Text>
          {duration ? (
            <>
              <Text className="text-[11px] text-neutral-300">•</Text>
              <Text className="text-[11px] text-neutral-400">{duration}</Text>
            </>
          ) : null}
          {resource.is_free ? (
            <>
              <Text className="text-[11px] text-neutral-300">•</Text>
              <Text className="text-[11px] font-medium text-emerald-600">
                Free
              </Text>
            </>
          ) : null}
        </View>
      </View>

      {/* Bookmark */}
      <Pressable
        onPress={() => onToggleBookmark(resource.id)}
        hitSlop={10}
        className="h-9 w-9 items-center justify-center"
        accessibilityRole="button"
        accessibilityLabel={resource.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
      >
        <Ionicons
          name={resource.isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={20}
          color={resource.isBookmarked ? '#0a0a0a' : '#9ca3af'}
        />
      </Pressable>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function OnlineResources() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState<ResourceCategory | ''>('');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  // debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data: categoriesData } = useFetchResourceCategories();

  const query = useFetchResources({
    category,
    search: debouncedSearch,
    bookmarkedOnly,
  });

  const toggleBookmark = useToggleResourceBookmark();

  const resources = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data]
  );

  const handleEndReached = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  const handleToggle = useCallback(
    (id: string) => {
      toggleBookmark.mutate(id);
    },
    [toggleBookmark]
  );

  // Loading state
  if (query.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <ScreenHeader
          title="Online Resources"
          subtitle="Curated blogs, videos, books & courses"
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0a0a0a" />
        </View>
      </SafeAreaView>
    );
  }

  // Error state → reuse ComingSoon visual but show a real retry
  if (query.isError) {
    return (
      <ComingSoonScreen
        title="Online Resources"
        subtitle="Something went wrong"
        icon="cloud-offline-outline"
        message="We couldn't load resources right now. Please check your connection and pull down to retry."
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScreenHeader
        title="Online Resources"
        subtitle="Curated blogs, videos, books & courses"
        rightAccessory={
          <Pressable
            onPress={() => setBookmarkedOnly((v) => !v)}
            hitSlop={10}
            className={`h-10 w-10 items-center justify-center rounded-full ${
              bookmarkedOnly ? 'bg-neutral-900' : 'bg-neutral-100'
            }`}
            accessibilityRole="button"
            accessibilityLabel="Toggle bookmarked only"
          >
            <Ionicons
              name={bookmarkedOnly ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={bookmarkedOnly ? '#ffffff' : '#0a0a0a'}
            />
          </Pressable>
        }
      />

      {/* Search */}
      <View className="px-4 pt-3">
        <View className="h-12 flex-row items-center gap-3 rounded-2xl bg-neutral-100 px-4">
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search resources"
            placeholderTextColor="#9ca3af"
            returnKeyType="search"
            className="flex-1 p-0 text-[15px] text-neutral-900"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Category chips */}
      <CategoryChips
        selected={category}
        onSelect={setCategory}
        categories={categoriesData?.data}
      />

      {/* Results list */}
      <FlatList
        data={resources}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ResourceRow resource={item} onToggleBookmark={handleToggle} />
        )}
        ItemSeparatorComponent={() => (
          <View className="mx-4 h-px bg-neutral-100" />
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching && !query.isFetchingNextPage}
            onRefresh={() => query.refetch()}
            tintColor="#0a0a0a"
          />
        }
        ListEmptyComponent={
          <View className="mt-20 items-center px-8">
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
              <Ionicons
                name={bookmarkedOnly ? 'bookmark-outline' : 'search-outline'}
                size={28}
                color="#9ca3af"
              />
            </View>
            <Text className="mt-4 text-center text-[16px] font-semibold text-neutral-900">
              {bookmarkedOnly
                ? 'No bookmarks yet'
                : debouncedSearch
                  ? 'No matching resources'
                  : 'No resources available'}
            </Text>
            <Text className="mt-1 max-w-[280px] text-center text-[13px] text-neutral-500">
              {bookmarkedOnly
                ? 'Tap the bookmark icon on any resource to save it for later.'
                : 'Try a different keyword or category.'}
            </Text>
          </View>
        }
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <View className="py-6">
              <ActivityIndicator color="#0a0a0a" />
            </View>
          ) : (
            <View className="h-6" />
          )
        }
        contentContainerClassName="pb-10"
      />
    </SafeAreaView>
  );
}
