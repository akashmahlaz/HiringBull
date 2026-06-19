import React, { useRef } from 'react';
import { type TextInput } from 'react-native';
// import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { ProfileData } from '@/app/onboarding/types';
import { Input, Text, View } from '@/components/ui';

import { StepperControls } from './StepperInput';

type Props = {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
  onContinue: () => void;
  canContinue: boolean;
};

function Step0({ data, onChange, onContinue, canContinue }: Props) {
  const nameRef = useRef<TextInput>(null);
  const collegeOrCompanyRef = useRef<TextInput>(null);
  const cgpaOrYoeRef = useRef<TextInput>(null);
  const resumeLinkRef = useRef<TextInput>(null);

  const updateField = (field: keyof ProfileData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleSubmit = () => {
    if (canContinue) {
      onContinue();
    }
  };

  return (
    <View
      // entering={FadeInRight.duration(300)}
      // exiting={FadeOutLeft.duration(300)}
      className="flex-1"
    >
      <View className="px-6">
        <Text className="mb-2 text-3xl font-bold dark:text-white">
          Tell us about you
        </Text>
        <Text className="mb-8 text-base text-neutral-500">
          We&apos;ll personalize your experience based on this
        </Text>
      </View>

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 24,
        }}
        bottomOffset={100}
      >
        <View className="gap-5">
          <View>
            <Text className="mb-2 font-medium text-neutral-900 dark:text-white">
              Full Name
            </Text>
            <Input
              ref={nameRef}
              placeholder="Enter your full name"
              value={data.name}
              onChangeText={(text) => updateField('name', text)}
              returnKeyType="next"
              onSubmitEditing={() => collegeOrCompanyRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>
          <View>
            <Text className="mb-2 font-medium text-neutral-900 dark:text-white">
              College Name
            </Text>
            <Input
              ref={collegeOrCompanyRef}
              placeholder="e.g. IIT Delhi"
              value={data.collegeOrCompany}
              onChangeText={(text) => updateField('collegeOrCompany', text)}
              returnKeyType="next"
              onSubmitEditing={() => cgpaOrYoeRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          <View>
            <Text className="mb-2 font-medium text-neutral-900 dark:text-white">
              CGPA / Percentage
            </Text>
            <View className="relative">
              <Input
                ref={cgpaOrYoeRef}
                placeholder="e.g. 8.5"
                value={data.cgpaOrYoe}
                keyboardType="decimal-pad"
                onChangeText={(text) => {
                  const sanitized = text
                    .replace(/[^0-9.]/g, '')
                    .replace(/(\..*)\./g, '$1');

                  updateField('cgpaOrYoe', sanitized);
                }}
              />

              <StepperControls
                onInc={() => {
                  const val = Number(data.cgpaOrYoe) || 0;
                  updateField('cgpaOrYoe', (val + 0.5).toString());
                }}
                onDec={() => {
                  const val = Number(data.cgpaOrYoe) || 0;
                  updateField('cgpaOrYoe', Math.max(0, val - 0.5).toString());
                }}
              />
            </View>
          </View>

          <View>
            <Text className="mb-2 font-medium text-neutral-900 dark:text-white">
              Resume Link <Text className="text-neutral-400">(Optional)</Text>
            </Text>
            <Input
              ref={resumeLinkRef}
              placeholder="Google Drive / Dropbox link"
              value={data.resumeLink}
              onChangeText={(text) => updateField('resumeLink', text)}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

export default Step0;
