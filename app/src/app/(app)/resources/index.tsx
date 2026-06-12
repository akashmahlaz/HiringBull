import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  TextInput,
  View as RNView,
} from 'react-native';

import { client } from '@/api/common/client';
import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';

// ─── Types ───────────────────────────────────────────────────────────────────
type Step = { text: string; status: 'loading' | 'done' };
type AnalysisMode = 'match' | 'review';

interface MatchResult {
  matchScore: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  missingKeywords: string[];
  improvedBullets: string[];
}

interface ReviewResult {
  overallScore: number;
  summary: string;
  formatScore: number;
  contentScore: number;
  atsScore: number;
  strengths: string[];
  issues: string[];
  suggestions: string[];
  improvedBullets: string[];
}

// ─── Score Bar Component ──────────────────────────────────────────────────────
function ScoreBar({
  score,
  label,
  size = 'md',
}: {
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
  const trackH = size === 'lg' ? 10 : size === 'md' ? 7 : 5;
  const numSz = size === 'lg' ? 40 : size === 'md' ? 28 : 22;
  const lblSz = size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <View className="mb-1">
      <View className="mb-1.5 flex-row items-center justify-between">
        <Text
          className={`${lblSz} font-semibold text-neutral-700 dark:text-neutral-200`}
        >
          {label}
        </Text>
        <Text style={{ color, fontSize: numSz * 0.55, fontWeight: '800' }}>
          {score}
        </Text>
      </View>
      <View
        className="w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
        style={{ height: trackH }}
      >
        <RNView
          style={{
            width: `${score}%`,
            height: trackH,
            backgroundColor: color,
            borderRadius: 999,
          }}
        />
      </View>
    </View>
  );
}

// ─── Thinking Steps ───────────────────────────────────────────────────────────
function ThinkingSteps({ steps }: { steps: Step[] }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <View className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <View className="mb-3 flex-row items-center gap-2">
        <View className="size-7 items-center justify-center rounded-full bg-neutral-900 dark:bg-white">
          <Ionicons
            name="sparkles"
            size={13}
            color={isDark ? '#171717' : '#ffffff'}
          />
        </View>
        <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          Copilot is thinking…
        </Text>
      </View>
      {steps.map((step, i) => (
        <View key={i} className="ml-1 mt-2 flex-row items-center gap-3">
          {step.status === 'done' ? (
            <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
          ) : (
            <ActivityIndicator
              size={14}
              color={isDark ? '#ffffff' : '#171717'}
            />
          )}
          <Text
            className={`flex-1 text-sm ${
              step.status === 'done'
                ? 'text-neutral-500 dark:text-neutral-400'
                : 'font-medium text-neutral-800 dark:text-neutral-100'
            }`}
          >
            {step.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({
  icon,
  iconBg,
  iconColor,
  title,
  titleColor,
  children,
  borderColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  titleColor: string;
  children: React.ReactNode;
  borderColor?: string;
}) {
  return (
    <View
      className="mt-4 rounded-2xl border bg-white p-4 dark:bg-neutral-900"
      style={{ borderColor: borderColor || '#e5e5e5' }}
    >
      <View className="mb-3 flex-row items-center gap-2">
        <View
          className="size-7 items-center justify-center rounded-full"
          style={{ backgroundColor: iconBg }}
        >
          <Ionicons name={icon} size={14} color={iconColor} />
        </View>
        <Text className="text-sm font-bold" style={{ color: titleColor }}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CopilotScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [jdText, setJdText] = useState('');
  const [mode, setMode] = useState<AnalysisMode>('match');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [result, setResult] = useState<MatchResult | ReviewResult | null>(null);
  const [error, setError] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const pickResume = useCallback(async () => {
    try {
      const docResult = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (docResult.canceled) return;

      const file = docResult.assets[0];
      setResumeFileName(file.name);

      if (file.mimeType === 'text/plain') {
        const response = await fetch(file.uri);
        const text = await response.text();
        setResumeText(text);
      } else {
        setResumeText(`[Uploaded: ${file.name}]`);
      }
    } catch (e) {
      console.error('Document pick error:', e);
    }
  }, []);

  const analyze = useCallback(async () => {
    if (!resumeText.trim()) {
      setError('Please upload or paste your resume first');
      return;
    }
    if (mode === 'match' && !jdText.trim()) {
      setError('Please paste the job description for match analysis');
      return;
    }

    setError('');
    setResult(null);
    setSteps([]);
    setIsAnalyzing(true);
    fadeAnim.setValue(0);

    try {
      const response = await fetch(`${client.defaults.baseURL}/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            (client.defaults.headers.Authorization as string) || '',
        },
        body: JSON.stringify({
          resume: resumeText,
          jobDescription: jdText || undefined,
          mode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const event = JSON.parse(data);
            if (event.type === 'step') {
              setSteps((prev) => {
                const existing = prev.findIndex((s) => s.text === event.step);
                if (existing >= 0) {
                  const updated = [...prev];
                  updated[existing] = {
                    text: event.step,
                    status: event.status,
                  };
                  return updated;
                }
                return [...prev, { text: event.step, status: event.status }];
              });
            } else if (event.type === 'result') {
              setResult(event.data);
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }).start();
            } else if (event.type === 'error') {
              setError(event.message);
            }
          } catch {}
        }
      }
    } catch (e: any) {
      setError(e.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [resumeText, jdText, mode, fadeAnim]);

  const reset = () => {
    setResult(null);
    setSteps([]);
    setError('');
  };

  const mainScore = result
    ? 'matchScore' in result
      ? (result as MatchResult).matchScore
      : (result as ReviewResult).overallScore
    : 0;

  const scoreColor =
    mainScore >= 75 ? '#16a34a' : mainScore >= 50 ? '#d97706' : '#dc2626';

  const scoreLabel =
    mainScore >= 75
      ? 'Strong match'
      : mainScore >= 50
        ? 'Partial match'
        : 'Needs work';

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-neutral-950"
      edges={['top']}
    >
      <FocusAwareStatusBar />

      {/* ── Header ── */}
      <View className="border-b border-neutral-200 bg-white px-5 pb-4 pt-6 dark:border-neutral-800 dark:bg-neutral-950">
        <View className="flex-row items-center gap-2">
          <Text
            className="text-3xl text-neutral-900 dark:text-white"
            style={{ fontFamily: 'Montez' }}
          >
            Copilot
          </Text>
          <View className="flex-row items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 dark:bg-neutral-800">
            <Ionicons
              name="sparkles"
              size={11}
              color={isDark ? '#ffffff' : '#171717'}
            />
            <Text className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              AI
            </Text>
          </View>
        </View>
        <Text className="mt-2 text-base text-neutral-500 dark:text-neutral-400">
          Analyse your resume against any job description or get a quality
          review.
        </Text>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        ref={scrollRef}
        className="flex-1 bg-slate-50 dark:bg-neutral-950"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
      >
        {/* Mode Toggle */}
        <View className="mt-4 flex-row gap-3">
          <Pressable
            onPress={() => {
              setMode('match');
              reset();
            }}
            className={`flex-1 rounded-xl border px-4 py-3 ${
              mode === 'match'
                ? 'border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white'
                : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
            }`}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="git-compare-outline"
                size={16}
                color={
                  mode === 'match'
                    ? isDark
                      ? '#171717'
                      : '#ffffff'
                    : '#737373'
                }
              />
              <Text
                className={`text-sm font-semibold ${
                  mode === 'match'
                    ? 'text-white dark:text-neutral-900'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                Match with JD
              </Text>
            </View>
            <Text
              className={`mt-1 text-xs ${
                mode === 'match'
                  ? 'text-neutral-300 dark:text-neutral-600'
                  : 'text-neutral-400 dark:text-neutral-500'
              }`}
            >
              Compare resume vs job
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setMode('review');
              reset();
            }}
            className={`flex-1 rounded-xl border px-4 py-3 ${
              mode === 'review'
                ? 'border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white'
                : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
            }`}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="document-text-outline"
                size={16}
                color={
                  mode === 'review'
                    ? isDark
                      ? '#171717'
                      : '#ffffff'
                    : '#737373'
                }
              />
              <Text
                className={`text-sm font-semibold ${
                  mode === 'review'
                    ? 'text-white dark:text-neutral-900'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                Resume Review
              </Text>
            </View>
            <Text
              className={`mt-1 text-xs ${
                mode === 'review'
                  ? 'text-neutral-300 dark:text-neutral-600'
                  : 'text-neutral-400 dark:text-neutral-500'
              }`}
            >
              General quality check
            </Text>
          </Pressable>
        </View>

        {/* Resume Upload */}
        <View className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <Text className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            Your Resume
          </Text>

          <Pressable
            onPress={pickResume}
            className="flex-row items-center gap-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50"
          >
            <View className="size-10 items-center justify-center rounded-full bg-neutral-900 dark:bg-white">
              <Ionicons
                name="cloud-upload-outline"
                size={18}
                color={
                  resumeFileName ? '#16a34a' : isDark ? '#171717' : '#ffffff'
                }
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                {resumeFileName || 'Upload Resume'}
              </Text>
              <Text className="text-xs text-neutral-400 dark:text-neutral-500">
                PDF, DOC, or TXT
              </Text>
            </View>
            {resumeFileName ? (
              <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            ) : (
              <Ionicons name="chevron-forward" size={18} color="#a3a3a3" />
            )}
          </Pressable>

          <View className="my-3 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
            <Text className="text-xs text-neutral-400 dark:text-neutral-500">
              or paste below
            </Text>
            <View className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
          </View>

          <TextInput
            placeholder="Paste your resume text here…"
            placeholderTextColor="#a3a3a3"
            value={resumeText.startsWith('[Uploaded:') ? '' : resumeText}
            onChangeText={(t) => {
              setResumeText(t);
              setResumeFileName('');
            }}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            className="min-h-[120px] rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </View>

        {/* Job Description */}
        {mode === 'match' && (
          <View className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <Text className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
              Job Description
            </Text>
            <TextInput
              placeholder="Paste the job description here…"
              placeholderTextColor="#a3a3a3"
              value={jdText}
              onChangeText={setJdText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="min-h-[120px] rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </View>
        )}

        {/* Error */}
        {error ? (
          <View className="mt-4 flex-row items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 dark:border-danger-900 dark:bg-danger-950">
            <Ionicons name="alert-circle" size={18} color="#dc2626" />
            <Text className="flex-1 text-sm text-danger-700 dark:text-danger-300">
              {error}
            </Text>
          </View>
        ) : null}

        {/* Analyze Button */}
        <Pressable
          onPress={analyze}
          disabled={isAnalyzing}
          className={`mt-5 flex-row items-center justify-center gap-2 rounded-xl py-4 ${
            isAnalyzing
              ? 'bg-neutral-400 dark:bg-neutral-600'
              : 'bg-neutral-900 active:opacity-80 dark:bg-white'
          }`}
        >
          {isAnalyzing ? (
            <ActivityIndicator size={18} color="#ffffff" />
          ) : (
            <Ionicons
              name="sparkles"
              size={18}
              color={isDark ? '#171717' : '#ffffff'}
            />
          )}
          <Text
            className={`text-base font-bold ${
              isAnalyzing ? 'text-white' : 'text-white dark:text-neutral-900'
            }`}
          >
            {isAnalyzing
              ? 'Analysing…'
              : mode === 'match'
                ? 'Analyse Match'
                : 'Review Resume'}
          </Text>
        </Pressable>

        {/* Thinking Steps */}
        {steps.length > 0 && <ThinkingSteps steps={steps} />}

        {/* ─── Results ─── */}
        {result && (
          <Animated.View style={{ opacity: fadeAnim }} className="mt-5">
            {/* ── Score Banner ── */}
            <View className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              {/* Top coloured strip */}
              <RNView style={{ height: 6, backgroundColor: scoreColor }} />

              <View className="p-5">
                {/* Main score row */}
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                      {mode === 'match' ? 'Match Score' : 'Overall Score'}
                    </Text>
                    <View className="mt-1 flex-row items-end gap-1">
                      <Text
                        style={{
                          fontSize: 52,
                          fontWeight: '800',
                          color: scoreColor,
                          lineHeight: 56,
                        }}
                      >
                        {mainScore}
                      </Text>
                      <Text className="mb-2 text-xl font-bold text-neutral-400">
                        /100
                      </Text>
                    </View>
                    <View
                      className="mt-1 self-start rounded-full px-3 py-1"
                      style={{ backgroundColor: scoreColor + '18' }}
                    >
                      <Text
                        style={{ color: scoreColor }}
                        className="text-xs font-semibold"
                      >
                        {scoreLabel}
                      </Text>
                    </View>
                  </View>

                  {/* Gauge ring */}
                  <RNView
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      borderWidth: 8,
                      borderColor: scoreColor + '22',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <RNView
                      style={{
                        position: 'absolute',
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        borderWidth: 8,
                        borderColor: 'transparent',
                        borderTopColor: scoreColor,
                        transform: [
                          { rotate: `${(mainScore / 100) * 360 - 90}deg` },
                        ],
                      }}
                    />
                    <Text
                      style={{
                        color: scoreColor,
                        fontWeight: '800',
                        fontSize: 18,
                      }}
                    >
                      {mainScore}
                    </Text>
                  </RNView>
                </View>

                {/* Progress bar */}
                <View className="mt-4">
                  <View className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
                    <RNView
                      style={{
                        width: `${mainScore}%`,
                        height: 10,
                        backgroundColor: scoreColor,
                        borderRadius: 999,
                      }}
                    />
                  </View>
                </View>

                {/* Sub-scores (review mode) */}
                {mode === 'review' && 'formatScore' in result && (
                  <View className="mt-5 gap-3">
                    <ScoreBar
                      score={(result as ReviewResult).formatScore}
                      label="Format"
                      size="sm"
                    />
                    <ScoreBar
                      score={(result as ReviewResult).contentScore}
                      label="Content"
                      size="sm"
                    />
                    <ScoreBar
                      score={(result as ReviewResult).atsScore}
                      label="ATS Compatibility"
                      size="sm"
                    />
                  </View>
                )}
              </View>
            </View>

            {/* Summary */}
            <View className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <Text className="mb-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Summary
              </Text>
              <Text className="text-sm leading-[22px] text-neutral-600 dark:text-neutral-300">
                {result.summary}
              </Text>
            </View>

            {/* Strengths */}
            {result.strengths && result.strengths.length > 0 && (
              <SectionCard
                icon="checkmark-circle"
                iconBg="#dcfce7"
                iconColor="#16a34a"
                title="Strengths"
                titleColor="#15803d"
                borderColor="#bbf7d0"
              >
                {result.strengths.map((s: string, i: number) => (
                  <View key={i} className="mt-2 flex-row gap-2">
                    <Text className="text-sm text-success-600 dark:text-success-400">
                      ✓
                    </Text>
                    <Text className="flex-1 text-sm leading-[20px] text-success-700 dark:text-success-300">
                      {s}
                    </Text>
                  </View>
                ))}
              </SectionCard>
            )}

            {/* Gaps / Issues */}
            {('gaps' in result ? result.gaps : (result as ReviewResult).issues)
              ?.length > 0 && (
              <SectionCard
                icon="alert-circle"
                iconBg="#fee2e2"
                iconColor="#dc2626"
                title={mode === 'match' ? 'Gaps' : 'Issues'}
                titleColor="#b91c1c"
                borderColor="#fecaca"
              >
                {('gaps' in result
                  ? result.gaps
                  : (result as ReviewResult).issues
                )?.map((g: string, i: number) => (
                  <View key={i} className="mt-2 flex-row gap-2">
                    <Text className="text-sm text-danger-500">✕</Text>
                    <Text className="flex-1 text-sm leading-[20px] text-danger-700 dark:text-danger-300">
                      {g}
                    </Text>
                  </View>
                ))}
              </SectionCard>
            )}

            {/* Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <SectionCard
                icon="bulb-outline"
                iconBg="#f5f5f5"
                iconColor="#171717"
                title="Suggestions"
                titleColor="#171717"
                borderColor="#e5e5e5"
              >
                {result.suggestions.map((s: string, i: number) => (
                  <View
                    key={i}
                    className="mt-2 flex-row gap-3 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800"
                  >
                    <View className="mt-0.5 size-5 items-center justify-center rounded-full bg-neutral-900 dark:bg-white">
                      <Text className="text-[10px] font-bold text-white dark:text-neutral-900">
                        {i + 1}
                      </Text>
                    </View>
                    <Text className="flex-1 text-sm leading-[20px] text-neutral-700 dark:text-neutral-200">
                      {s}
                    </Text>
                  </View>
                ))}
              </SectionCard>
            )}

            {/* Missing Keywords */}
            {'missingKeywords' in result &&
              (result as MatchResult).missingKeywords?.length > 0 && (
                <SectionCard
                  icon="key-outline"
                  iconBg="#fef3c7"
                  iconColor="#d97706"
                  title="Missing Keywords"
                  titleColor="#92400e"
                  borderColor="#fde68a"
                >
                  <View className="mt-2 flex-row flex-wrap gap-2">
                    {(result as MatchResult).missingKeywords.map(
                      (k: string, i: number) => (
                        <View
                          key={i}
                          className="rounded-full border border-warning-300 bg-warning-100 px-3 py-1 dark:border-warning-700 dark:bg-warning-900/50"
                        >
                          <Text className="text-xs font-semibold text-warning-800 dark:text-warning-200">
                            {k}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                </SectionCard>
              )}

            {/* Improved Bullets */}
            {result.improvedBullets && result.improvedBullets.length > 0 && (
              <SectionCard
                icon="create-outline"
                iconBg="#f5f5f5"
                iconColor="#171717"
                title="Improved Bullets — Copy These"
                titleColor="#171717"
                borderColor="#e5e5e5"
              >
                {result.improvedBullets.map((b: string, i: number) => (
                  <View
                    key={i}
                    className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <Text className="text-sm leading-[20px] text-neutral-700 dark:text-neutral-200">
                      • {b}
                    </Text>
                  </View>
                ))}
              </SectionCard>
            )}

            {/* Reset */}
            <Pressable
              onPress={() => {
                reset();
                setResumeText('');
                setJdText('');
                setResumeFileName('');
              }}
              className="mt-6 flex-row items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-3 active:opacity-70 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <Ionicons name="refresh-outline" size={18} color="#737373" />
              <Text className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                Start New Analysis
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
