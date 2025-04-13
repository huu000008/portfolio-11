'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  loginSchema,
  signupSchema,
  type LoginFormData,
  type SignupFormData,
} from '@/lib/schemas/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './LoginModal.module.scss';
import FormField from './FormField';

type AuthMode = 'login' | 'signup';

interface AuthModalProps {
  trigger: React.ReactNode;
  initialMode?: AuthMode;
}

export default function AuthModal({ trigger, initialMode = 'login' }: AuthModalProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const router = useRouter();
  const { fetchSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 로그인 폼 설정
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // 회원가입 폼 설정
  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: signupErrors },
    reset: resetSignup,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const resetAllStates = () => {
    setError(null);
    setSuccessMessage(null);
    resetLogin();
    resetSignup();
    setMode(initialMode);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (isLoading && !newOpen) return;
    setOpen(newOpen);
    if (!newOpen) resetAllStates();
  };

  const toggleMode = () => {
    setError(null);
    setSuccessMessage(null);
    resetLogin();
    resetSignup();
    setMode(prev => (prev === 'login' ? 'signup' : 'login'));
  };

  const handleAuthError = (err: unknown) => {
    console.error(`${mode === 'login' ? '로그인' : '회원가입'} 오류:`, err);
    setError(
      err instanceof Error
        ? err.message
        : `${mode === 'login' ? '로그인' : '회원가입'} 중 오류가 발생했습니다.`,
    );
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: userData, error: loginError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (loginError) throw new Error(loginError.message);
      if (userData?.user) {
        await fetchSession();
        setOpen(false);
        resetLogin();
        router.refresh();
      }
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data: userData, error: signupError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signupError) throw new Error(signupError.message);
      if (userData?.user) {
        setSuccessMessage('이메일로 발송된 확인 링크를 클릭하여 가입을 완료해주세요.');
        setTimeout(() => {
          setMode('login');
          setSuccessMessage(null);
          resetSignup();
        }, 3000);
      }
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <div className={styles.modalContainer}>
            <Dialog.Title className={styles.title}>
              {mode === 'login' ? '로그인' : '회원가입'}
            </Dialog.Title>
            <Dialog.Description className={styles.description}>
              {mode === 'login'
                ? '계정에 로그인하여 서비스를 이용하세요.'
                : '회원가입을 통해 서비스를 이용해보세요.'}
            </Dialog.Description>

            {error && <div className={styles.error}>{error}</div>}
            {successMessage && <div className={styles.success}>{successMessage}</div>}

            <form
              onSubmit={
                mode === 'login'
                  ? handleSubmitLogin(onLoginSubmit)
                  : handleSubmitSignup(onSignupSubmit)
              }
              className={styles.form}
            >
              <div className={styles.formGroup}>
                {mode === 'login' ? (
                  <>
                    <FormField<LoginFormData>
                      label="이메일"
                      id="email"
                      type="email"
                      placeholder="이메일 주소"
                      disabled={isLoading}
                      error={loginErrors.email}
                      register={registerLogin}
                      name="email"
                    />

                    <FormField<LoginFormData>
                      label="비밀번호"
                      id="password"
                      type="password"
                      placeholder="비밀번호"
                      disabled={isLoading}
                      error={loginErrors.password}
                      register={registerLogin}
                      name="password"
                    />
                  </>
                ) : (
                  <>
                    <FormField<SignupFormData>
                      label="이메일"
                      id="email"
                      type="email"
                      placeholder="이메일 주소"
                      disabled={isLoading}
                      error={signupErrors.email}
                      register={registerSignup}
                      name="email"
                    />

                    <FormField<SignupFormData>
                      label="비밀번호"
                      id="password"
                      type="password"
                      placeholder="비밀번호"
                      disabled={isLoading}
                      error={signupErrors.password}
                      register={registerSignup}
                      name="password"
                    />

                    <FormField<SignupFormData>
                      label="비밀번호 확인"
                      id="confirmPassword"
                      type="password"
                      placeholder="비밀번호 확인"
                      disabled={isLoading}
                      error={signupErrors.confirmPassword}
                      register={registerSignup}
                      name="confirmPassword"
                    />
                  </>
                )}
              </div>

              <div className={styles.actionRow}>
                <button type="button" onClick={toggleMode} className={styles.signupLink}>
                  {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
                </button>
              </div>

              <div className={styles.buttonGroup}>
                <button type="submit" disabled={isLoading} className={styles.submitButton}>
                  {isLoading ? (
                    <span className={styles.loadingWrapper}>
                      <svg
                        className={styles.loadingIcon}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {mode === 'login' ? '로그인 중...' : '가입 중...'}
                    </span>
                  ) : mode === 'login' ? (
                    '로그인'
                  ) : (
                    '회원가입'
                  )}
                </button>
              </div>
            </form>
          </div>

          {!isLoading && (
            <Dialog.Close asChild>
              <button className={styles.closeButton} aria-label="닫기">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
