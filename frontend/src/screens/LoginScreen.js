import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, ScrollView, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp, sendOtp, clearError } from '../redux/authSlice';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const scrollContentStyle = { flexGrow: 1, justifyContent: 'center', paddingTop: 40, paddingBottom: 80 };

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleRequestOtp = async () => {
    if (!email.trim()) {
      setSendError('Please enter your email address.');
      return;
    }
    setSendError('');
    setSending(true);
    const result = await dispatch(sendOtp({ email: email.trim() }));
    setSending(false);
    if (sendOtp.fulfilled.match(result)) {
      setOtpSent(true);
    } else {
      setSendError(result.payload || 'Failed to send code. Please try again.');
    }
  };

  const handleVerify = () => {
    if (!otp.trim()) {
      return;
    }
    dispatch(verifyOtp({ email: email.trim(), otp: otp.trim() }));
  };

  return (
    <SafeAreaView className="flex-1 bg-bgCard" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'ios'}
      >
        <ScrollView
          contentContainerStyle={scrollContentStyle}
          className="px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo & Brand */}
          {/* <View className="items-center mb-10">
            <View className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-googleBlue/10 flex items-center justify-center mb-4">
              <Image
                source={require('../assets/LevelUp-logo.png')}
                className="w-16 h-16"
                resizeMode="contain"
              />
            </View>
            <Text className="text-textMain text-4xl font-black tracking-tight text-center mb-1">Level Up</Text>
            <Text className="text-textMuted text-xs font-semibold text-center max-w-[260px]">
              Enter your email to receive a secure one-time passcode. No password needed.
            </Text>
          </View> */}

          {/* Card */}
          <View className="bg-white border border-borderLight rounded-3xl p-6 shadow-2xl shadow-googleBlue/5">
            <Text className="text-textMain text-xl font-bold mb-4">Welcome</Text>

            {/* Progress tracking hint */}
            <View className="bg-bgCard border border-borderLight rounded-2xl px-4 py-3 mb-5 flex-row items-start space-x-2">
              <Feather name="info" size={13} color="#1a73e8" style={{ marginTop: 2, marginRight: 8 }} />
              <Text className="text-textMuted text-xs leading-relaxed flex-1">
                If you don't have an account, one will be created automatically when you verify your email.
              </Text>
            </View>

            {/* Error */}
            {(error || sendError) ? (
              <View className="bg-googleRed/10 border border-googleRed/20 rounded-xl p-3 mb-4">
                <Text className="text-googleRed text-xs font-bold text-center">{error || sendError}</Text>
              </View>
            ) : null}

            {/* Email Field */}
            <View className="mb-4">
              <Text className="text-textMuted text-[10px] font-bold uppercase mb-2 tracking-wider ml-1">Email Address</Text>
              <View className="flex-row items-center bg-bgCard border border-borderLight rounded-2xl px-4 py-1.5">
                <Feather name="mail" size={16} color="#8E9AA8" style={{ marginRight: 10 }} />
                <TextInput
                  className="flex-1 text-textMain text-sm py-3"
                  placeholder="you@example.com"
                  placeholderTextColor="#8E9AA8"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setOtpSent(false); setSendError(''); }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!otpSent}
                />
                {otpSent && (
                  <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); }}>
                    <Feather name="edit-2" size={14} color="#1a73e8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* OTP Field */}
            {otpSent && (
              <View className="mb-4">
                <View className="flex-row justify-between items-center mb-2 mx-1">
                  <Text className="text-textMuted text-[10px] font-bold uppercase tracking-wider">Verification Code</Text>
                  <TouchableOpacity onPress={handleRequestOtp} disabled={sending}>
                    <Text className="text-googleBlue text-[10px] font-bold">Resend Code</Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row items-center bg-bgCard border border-borderLight rounded-2xl px-4 py-1.5">
                  <Feather name="lock" size={16} color="#8E9AA8" style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 text-textMain text-xl font-black py-3 tracking-[8px]"
                    placeholder="_ _ _ _"
                    placeholderTextColor="#8E9AA8"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              </View>
            )}

            {/* Action Button */}
            {!otpSent ? (
              <TouchableOpacity
                className="bg-googleBlue rounded-2xl py-4 mt-2 flex-row justify-center items-center shadow-lg shadow-googleBlue/20"
                onPress={handleRequestOtp}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text className="text-white text-sm font-bold uppercase tracking-wider mr-2">Request Passcode</Text>
                    <Feather name="send" size={15} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="bg-googleBlue rounded-2xl py-4 mt-2 flex-row justify-center items-center shadow-lg shadow-googleBlue/20"
                onPress={handleVerify}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text className="text-white text-sm font-bold uppercase tracking-wider mr-2">Verify & Sign In</Text>
                    <Feather name="arrow-right" size={15} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
