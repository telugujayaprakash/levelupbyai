import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import { fetchSettings, saveSettings, updateProfileName, logout } from '../redux/authSlice';
import API from '../services/api';

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const { settings, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logout()) }
      ]
    );
  };

  const [provider, setProvider] = useState('Gemini');
  const [apiKey, setApiKey] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // null, 'success', 'fail'

  // Profile
  const [displayName, setDisplayName] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setProvider(settings.provider || 'Gemini');
      setApiKey(settings.apiKey || '');
    }
  }, [settings]);

  useEffect(() => {
    if (user?.name) setDisplayName(user.name);
  }, [user]);

  const handleSave = () => {
    dispatch(saveSettings({ provider, apiKey }));
    setTestResult(null);
    alert('Credentials saved successfully!');
  };

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setSavingName(true);
    await dispatch(updateProfileName({ name: displayName.trim() }));
    setSavingName(false);
    alert('Display name updated!');
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await API.post('/settings/test', { provider, apiKey });
      if (response.success) {
        setTestResult('success');
      } else {
        setTestResult('fail');
      }
    } catch (error) {
      setTestResult('fail');
    } finally {
      setTesting(false);
    }
  };

  // Mask function: e.g. ********ABCD
  const getMaskedKey = () => {
    if (isFocused || !apiKey) {
      return apiKey;
    }
    if (apiKey.length > 4) {
      return '********' + apiKey.slice(-4);
    }
    return '********';
  };

  return (
    <ScrollView className="flex-1 bg-bgMain px-4 py-6">
      <Text className="text-textMain text-2xl font-black">Settings</Text>
      <Text className="text-textMuted text-xs mt-1 mb-6">Manage your profile and AI provider credentials</Text>

      {/* ── User Profile Card ── */}
      <View className="bg-bgCard border border-borderLight rounded-3xl p-5 mb-5">
        <View className="flex-row items-center mb-4 space-x-2">
          <View className="w-8 h-8 rounded-full bg-googleBlue/15 items-center justify-center mr-2">
            <Feather name="user" size={15} color="#1a73e8" />
          </View>
          <Text className="text-googleBlue text-sm font-black uppercase">User Profile</Text>
        </View>

        {/* Email (read-only) */}
        <View className="mb-3">
          <Text className="text-textMuted text-xs font-semibold uppercase mb-1.5 tracking-wider">Email Address</Text>
          <View className="flex-row items-center bg-bgMain border border-borderLight rounded-xl px-4 py-3 opacity-60">
            <Feather name="mail" size={14} color="#5C6470" style={{ marginRight: 10 }} />
            <Text className="text-textMuted text-sm flex-1">{user?.email || '—'}</Text>
          </View>
        </View>

        {/* Display Name (editable) */}
        <View className="mb-4">
          <Text className="text-textMuted text-xs font-semibold uppercase mb-1.5 tracking-wider">Display Name</Text>
          <View className={`flex-row items-center bg-bgMain border rounded-xl px-4 py-0.5 ${nameFocused ? 'border-googleBlue' : 'border-borderLight'}`}>
            <Feather name="edit-3" size={14} color={nameFocused ? '#1a73e8' : '#5C6470'} style={{ marginRight: 10 }} />
            <TextInput
              className="flex-1 text-textMain text-sm py-3"
              placeholder="Your display name"
              placeholderTextColor="#5C6470"
              value={displayName}
              onChangeText={setDisplayName}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />
          </View>
          <Text className="text-textMuted text-[10px] mt-1 ml-1">This name is shown on your dashboard and achievements.</Text>
        </View>

        <TouchableOpacity
          className="bg-googleBlue/15 border border-googleBlue/30 rounded-xl py-3 flex-row items-center justify-center"
          onPress={handleSaveName}
          disabled={savingName}
        >
          {savingName ? (
            <ActivityIndicator size="small" color="#1a73e8" />
          ) : (
            <>
              <Feather name="check" size={14} color="#1a73e8" style={{ marginRight: 8 }} />
              <Text className="text-googleBlue text-xs font-black uppercase tracking-wider">Save Display Name</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      <View className="bg-bgCard border border-borderLight rounded-3xl p-5 mb-6 space-y-6">
        <Text className="text-[#1a73e8] text-sm font-black uppercase">AI Provider Setup</Text>

        {/* Provider Segment Toggle */}
        <View className="flex-row space-x-2 bg-bgMain p-1 rounded-full border border-borderLight">
          <TouchableOpacity
            className={`flex-1 py-2.5 rounded-full items-center justify-center ${provider === 'Gemini' ? 'bg-[#1a73e8]' : ''}`}
            onPress={() => {
              setProvider('Gemini');
              setTestResult(null);
            }}
          >
            <Text className={`text-xs font-black ${provider === 'Gemini' ? 'text-white' : 'text-textMuted'}`}>Gemini</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2.5 rounded-full items-center justify-center ${provider === 'OpenAI' ? 'bg-[#1a73e8]' : ''}`}
            onPress={() => {
              setProvider('OpenAI');
              setTestResult(null);
            }}
          >
            <Text className={`text-xs font-black ${provider === 'OpenAI' ? 'text-white' : 'text-textMuted'}`}>OpenAI</Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View className="bg-[#1a73e8]/10 border border-[#1a73e8]/20 rounded-2xl p-4">
          <Text className="text-textMain text-xs leading-relaxed">
            {provider === 'Gemini'
              ? 'Note: If you leave the Gemini key empty, the app will automatically fall back to the built-in system key so you can start practicing immediately!'
              : 'Authorization note: OpenAI requires a valid chat-compatible token (sk-...) to query gpt-4o-mini questions.'}
          </Text>
        </View>

        {/* API Key Input */}
        <View className="space-y-2">
          <Text className="text-textMuted text-xs font-bold uppercase">{provider} API Key</Text>
          <TextInput
            className="bg-bgMain border border-borderLight text-textMain rounded-xl px-4 py-3 text-sm focus:border-googleBlue"
            placeholder={isFocused ? "Paste API key" : "Enter API key credentials"}
            placeholderTextColor="#5C6470"
            value={getMaskedKey()}
            onChangeText={(text) => {
              if (isFocused) {
                setApiKey(text);
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoCapitalize="none"
            secureTextEntry={false}
          />
        </View>

        {/* Test Result Indicator */}
        {testResult === 'success' && (
          <View className="bg-googleGreen/10 border border-googleGreen/20 rounded-xl p-3 flex-row items-center space-x-2">
            <Feather name="check-circle" size={16} color="#34a853" />
            <Text className="text-googleGreen text-xs font-bold">Connection successful! Key authorized.</Text>
          </View>
        )}
        {testResult === 'fail' && (
          <View className="bg-googleRed/10 border border-googleRed/20 rounded-xl p-3 flex-row items-center space-x-2">
            <Feather name="x-circle" size={16} color="#ea4335" />
            <Text className="text-googleRed text-xs font-bold">Connection failed. Please check credentials.</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row space-x-3 mt-4">
          <TouchableOpacity
            className="flex-1 bg-bgMain border border-borderLight rounded-xl py-3 items-center justify-center flex-row"
            onPress={handleTestConnection}
            disabled={testing}
          >
            {testing ? (
              <ActivityIndicator size="small" color="#1a73e8" />
            ) : (
              <Text className="text-textMain text-xs font-bold">Test API Connect</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-googleBlue rounded-xl py-3 items-center justify-center"
            onPress={handleSave}
          >
            <Text className="text-white text-xs font-black">Save Credentials</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Security Shield Banner */}
      <View className="bg-bgCard border border-borderLight rounded-3xl p-5 mb-12 flex-row space-x-3 items-center">
        <View className="w-10 h-10 rounded-full bg-[#1a73e8]/10 items-center justify-center">
          <Feather name="shield" size={20} color="#1a73e8" />
        </View>
        <View className="flex-1">
          <Text className="text-textMain text-sm font-black mb-1">Privacy & Key Security</Text>
          <Text className="text-textMuted text-xs leading-relaxed">
            API keys are posted directly and securely to your sandboxed backend session database storage. They are never shared or logged.
          </Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        className="border border-googleRed/30 bg-googleRed/5 rounded-3xl p-4 mb-12 flex-row items-center justify-center space-x-2"
        onPress={handleLogout}
      >
        <Feather name="log-out" size={16} color="#ea4335" />
        <Text className="text-googleRed text-xs font-black uppercase tracking-wider">Sign Out of Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SettingsScreen;
