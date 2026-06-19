import { getUserEmail } from '@/lib/auth';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable } from 'react-native';

import Step0 from '@/app/onboarding/ExperienceLevel';
import Step2 from '@/app/onboarding/Step2';
import { type ProfileData } from '@/app/onboarding/types';
import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';
import { checkMembership } from '@/features/users';
import useRegisterOrEditUser from '@/features/users/hooks/useRegisterOrEditUser';
import {
  showGlobalLoading,
  hideGlobalLoading,
  useOnboarding,
} from '@/lib';
import { getMembership, isMembershipValid, saveMembership } from '@/lib/membership';
import NoActiveMembership from '../no-membership';

type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
};

function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <View className="mb-4 w-full flex-row items-center">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => {
        const isActive = currentStep >= step;
        return (
          <React.Fragment key={step}>
            <View
              className={`h-2 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700 ${step > 1 && step < totalSteps + 1 ? 'mx-4' : ''}`}
            >
              <View
                className={`h-full rounded-full ${
                  isActive ? 'bg-orange-400' : 'bg-transparent'
                }`}
                style={{ width: isActive ? '100%' : '0%' }}
              />
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const TOTAL_STEPS = 2;

export default function Onboarding() {
  const router = useRouter();
  const completeOnboarding = useOnboarding.use.completeOnboarding();
  const [isVerifiedUser, setIsVerifiedUser] = useState(false);

  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    collegeOrCompany: '',
    cgpaOrYoe: '',
    resumeLink: '',
  });
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  const { mutate: registerUser, isPending: isRegistering } =
    useRegisterOrEditUser();

  const [membershipLoading, setMembershipLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkIfVerified = async () => {
      const email = getUserEmail();
      console.log('[Onboarding] checkIfVerified: email =', email);
      if (!email) {
        console.log('[Onboarding] No email in JWT, cannot check membership');
        if (!cancelled) setMembershipLoading(false);
        return;
      }

      try {
        console.log('[Onboarding] Calling checkMembership');
        const result = await checkMembership();
        console.log(
          '[Onboarding] Membership check result:',
          JSON.stringify(result)
        );

        // Always save what server returned so local cache stays in sync.
        if (result.membershipEnd) {
          saveMembership({
            email,
            membershipEnd: result.membershipEnd,
          });
        }

        const localMembership = getMembership();
        const candidateExpiry =
          result.membershipEnd || localMembership?.membershipEnd || '';
        const isValid =
          (Boolean(candidateExpiry) && isMembershipValid(candidateExpiry)) ||
          result.active === true;

        console.log(
          '[Onboarding] Membership valid =',
          isValid,
          '| membershipEnd =',
          result.membershipEnd,
          '| active =',
          result.active
        );

        if (!cancelled) {
          setIsVerifiedUser(isValid);
        }
      } catch (err: any) {
        console.log(
          '[Onboarding] Membership check failed:',
          err?.response?.status || err.message
        );
        if (!cancelled) setIsVerifiedUser(false);
      } finally {
        if (!cancelled) setMembershipLoading(false);
      }
    };

    checkIfVerified();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleCompany = (companyId: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleSelectAll = (companyIds: string[], select: boolean) => {
    setSelectedCompanies((prev) => {
      if (select) {
        return companyIds;
      } else {
        return prev.filter((id) => !companyIds.includes(id));
      }
    });
  };

  const handleContinue = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const handleBack = useCallback(() => {
    setStep((prev) => Math.max(1, prev - 1));
  }, []);

  const handleFinish = () => {
    if (profileData && selectedCompanies) {
      // Freshers only — server marks these fields itself and we don't
      // need to send an experience_level from the client anymore.
      const payload = {
        name: profileData.name,
        is_experienced: false,
        resume_link: profileData.resumeLink,
        followedCompanies: selectedCompanies,
        cgpa: profileData.cgpaOrYoe,
        college_name: profileData.collegeOrCompany,
      };

      registerUser(payload, {
        onSuccess: () => {
          hideGlobalLoading();
          completeOnboarding();
          router.replace('/');
        },
        onError: (e) => {
          hideGlobalLoading();
          console.error(e);
        },
      });
      showGlobalLoading();
    }
  };

  const canContinue = useMemo(() => {
    if (step === 1) {
      return (
        profileData.name.trim().length > 0 &&
        profileData.collegeOrCompany.trim().length > 0 &&
        profileData.cgpaOrYoe.trim().length > 0
      );
    }
    return true; // Step 2 (company selection) — selection optional, finishes either way
  }, [step, profileData]);

  if (membershipLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-900">
        <Text className="text-base text-neutral-500">
          Checking membership...
        </Text>
      </View>
    );
  }

  if (!isVerifiedUser) {
    return <NoActiveMembership />;
  }

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      <FocusAwareStatusBar />
      <SafeAreaView className="flex-1">
        <View className="flex-1 pt-4">
          <View className="px-6">
            <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />
          </View>
          {step === 1 ? (
            <Step0
              data={profileData}
              onChange={setProfileData}
              onContinue={handleContinue}
              canContinue={canContinue}
            />
          ) : (
            <Step2
              selectedCompanies={selectedCompanies}
              onToggle={handleToggleCompany}
              onBack={handleBack}
              onSelectAll={handleSelectAll}
            />
          )}
        </View>
      </SafeAreaView>

      <View className="border-t border-neutral-200 bg-white px-6 pb-8 pt-4 dark:border-neutral-700 dark:bg-neutral-900">
        {step === TOTAL_STEPS && selectedCompanies.length > 0 && (
          <Text className="mb-3 text-center text-sm font-medium text-neutral-600 dark:text-neutral-400">
            You will be notified for {selectedCompanies.length} companies info
          </Text>
        )}
        <Pressable
          onPress={step < TOTAL_STEPS ? handleContinue : handleFinish}
          disabled={!canContinue || isRegistering}
          className={`h-14 items-center justify-center rounded-xl ${
            canContinue && !isRegistering ? 'bg-black dark:bg-white' : 'bg-neutral-300'
          }`}
        >
          <Text
            className={`text-lg font-semibold ${
              canContinue && !isRegistering
                ? 'text-white dark:text-black'
                : 'text-neutral-500'
            }`}
          >
            {isRegistering
              ? 'Finishing...'
              : step < TOTAL_STEPS
                ? 'Continue'
                : 'Finish'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
