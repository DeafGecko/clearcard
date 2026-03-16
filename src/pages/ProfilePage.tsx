import { useState } from 'react';
import { usePersonalInfo } from '../hooks/usePersonalInfo';
import { PersonalInfo } from '../types';
import { Save, Trash2, AlertCircle, Eye, EyeOff, User, Phone, Heart, Shield } from 'lucide-react';

interface ProfilePageProps {
  theme: string;
}

type Section = 'personal' | 'emergency' | 'medical' | 'communication';

export function ProfilePage({ theme }: ProfilePageProps) {
  const { info, updateInfo, clearInfo } = usePersonalInfo();
  const [activeSection, setActiveSection] = useState<Section>('personal');
  const [showSensitive, setShowSensitive] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const themes: Record<string, {
    bg: string; text: string; sub: string; input: string; border: string;
    btn: string; tab: string; tabActive: string; card: string; danger: string;
  }> = {
    'high-contrast': {
      bg: 'bg-black',
      text: 'text-white',
      sub: 'text-gray-400',
      input: 'bg-gray-900 border-yellow-400 text-white placeholder-gray-500 focus:ring-yellow-400',
      border: 'border-yellow-400',
      btn: 'bg-yellow-400 text-black hover:bg-yellow-300 font-bold',
      tab: 'text-gray-400 hover:text-white border-b-2 border-transparent hover:border-gray-400',
      tabActive: 'text-yellow-400 border-b-2 border-yellow-400 font-bold',
      card: 'bg-gray-900',
      danger: 'bg-red-900 border-red-600 text-red-300',
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      sub: 'text-gray-400',
      input: 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:ring-blue-400',
      border: 'border-gray-600',
      btn: 'bg-blue-500 text-white hover:bg-blue-400 font-bold',
      tab: 'text-gray-400 hover:text-white border-b-2 border-transparent hover:border-gray-400',
      tabActive: 'text-blue-400 border-b-2 border-blue-400 font-bold',
      card: 'bg-gray-800',
      danger: 'bg-red-900 border-red-700 text-red-300',
    },
    light: {
      bg: 'bg-gray-50',
      text: 'text-gray-900',
      sub: 'text-gray-600',
      input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500',
      border: 'border-gray-300',
      btn: 'bg-blue-600 text-white hover:bg-blue-500 font-bold',
      tab: 'text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-400',
      tabActive: 'text-blue-600 border-b-2 border-blue-600 font-bold',
      card: 'bg-white',
      danger: 'bg-red-50 border-red-300 text-red-700',
    },
  };

  const t = themes[theme] || themes['high-contrast'];

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    updateInfo({ [field]: value });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const InputField = ({
    label,
    field,
    placeholder,
    type = 'text',
    sensitive = false,
  }: {
    label: string;
    field: keyof PersonalInfo;
    placeholder?: string;
    type?: string;
    sensitive?: boolean;
  }) => (
    <div>
      <label className={`block text-sm font-semibold mb-1 ${t.text}`}>{label}</label>
      <input
        type={sensitive && !showSensitive ? 'password' : type}
        value={(info[field] as string) || ''}
        onChange={e => handleChange(field, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg border-2 ${t.input} focus:outline-none focus:ring-2 transition-colors`}
      />
    </div>
  );

  const TextareaField = ({
    label,
    field,
    placeholder,
    rows = 3,
  }: {
    label: string;
    field: keyof PersonalInfo;
    placeholder?: string;
    rows?: number;
  }) => (
    <div>
      <label className={`block text-sm font-semibold mb-1 ${t.text}`}>{label}</label>
      <textarea
        value={(info[field] as string) || ''}
        onChange={e => handleChange(field, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 rounded-lg border-2 ${t.input} focus:outline-none focus:ring-2 resize-none transition-colors`}
      />
    </div>
  );

  const sections = [
    { id: 'personal' as Section, label: 'Personal', icon: User },
    { id: 'emergency' as Section, label: 'Emergency', icon: Phone },
    { id: 'medical' as Section, label: 'Medical', icon: Heart },
    { id: 'communication' as Section, label: 'Communication', icon: Shield },
  ];

  return (
    <div className={`min-h-screen ${t.bg} ${t.text}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black mb-1">My Information</h1>
              <p className={`${t.sub} text-lg`}>Stored securely on your device</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSensitive(!showSensitive)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${t.border} ${t.sub} transition-colors text-sm`}
                title={showSensitive ? 'Hide sensitive info' : 'Show sensitive info'}
              >
                {showSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="hidden sm:inline">{showSensitive ? 'Hide' : 'Show'}</span>
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${t.btn} transition-all hover:scale-105`}
              >
                <Save className="w-4 h-4" />
                {saved ? 'Saved!' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className={`flex items-start gap-3 p-4 rounded-xl mb-6 ${t.card} border ${t.border} border-opacity-30`}>
          <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <p className={`text-sm ${t.sub}`}>
            Your information is stored only on this device using encrypted local storage.
            It is never sent to any server or shared with third parties.
          </p>
        </div>

        {/* Section Tabs */}
        <div className={`flex gap-1 border-b ${t.border} border-opacity-30 mb-6 overflow-x-auto`}>
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap transition-all ${
                activeSection === id ? t.tabActive : t.tab
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Section Content */}
        <div className={`${t.card} rounded-xl p-6 space-y-4`}>
          {activeSection === 'personal' && (
            <>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Full Name" field="name" placeholder="Your full name" />
                <InputField label="Date of Birth" field="dateOfBirth" type="date" />
                <InputField label="Phone Number" field="phone" placeholder="Your phone number" type="tel" />
                <InputField label="Email Address" field="email" placeholder="your@email.com" type="email" />
                <div className="md:col-span-2">
                  <InputField label="Street Address" field="address" placeholder="Street address" />
                </div>
                <InputField label="City" field="city" placeholder="City" />
                <InputField label="State" field="state" placeholder="State" />
                <InputField label="ZIP Code" field="zipCode" placeholder="ZIP code" />
                <InputField label="Preferred Language" field="preferredLanguage" placeholder="e.g., ASL, English" />
              </div>
            </>
          )}

          {activeSection === 'emergency' && (
            <>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Emergency Contacts
              </h2>
              <div>
                <h3 className={`font-semibold ${t.sub} mb-3 text-sm uppercase tracking-wide`}>Primary Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField label="Name" field="emergencyContact1Name" placeholder="Contact name" />
                  <InputField label="Phone" field="emergencyContact1Phone" placeholder="Phone number" type="tel" />
                  <InputField label="Relationship" field="emergencyContact1Relation" placeholder="e.g., Spouse, Parent" />
                </div>
              </div>
              <div>
                <h3 className={`font-semibold ${t.sub} mb-3 text-sm uppercase tracking-wide`}>Secondary Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField label="Name" field="emergencyContact2Name" placeholder="Contact name" />
                  <InputField label="Phone" field="emergencyContact2Phone" placeholder="Phone number" type="tel" />
                  <InputField label="Relationship" field="emergencyContact2Relation" placeholder="e.g., Sibling, Friend" />
                </div>
              </div>
            </>
          )}

          {activeSection === 'medical' && (
            <>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Medical Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Blood Type" field="bloodType" placeholder="e.g., O+, A-, B+" />
                <InputField label="Insurance Provider" field="insuranceProvider" placeholder="Insurance company" />
                <InputField
                  label="Insurance Policy Number"
                  field="insurancePolicyNumber"
                  placeholder="Policy number"
                  sensitive
                />
                <InputField label="Doctor's Name" field="doctorName" placeholder="Primary care physician" />
                <InputField label="Doctor's Phone" field="doctorPhone" placeholder="Doctor's phone number" type="tel" />
              </div>
              <TextareaField
                label="Medical Conditions"
                field="medicalConditions"
                placeholder="List any medical conditions..."
              />
              <TextareaField
                label="Current Medications"
                field="medications"
                placeholder="List medications and dosages..."
              />
              <TextareaField
                label="Allergies"
                field="allergies"
                placeholder="List all allergies (especially medications and foods)..."
              />
            </>
          )}

          {activeSection === 'communication' && (
            <>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Communication Preferences
              </h2>
              <TextareaField
                label="Communication Notes"
                field="communicationNotes"
                placeholder="e.g., I prefer written communication. I use ASL. Please write or type your messages. I can lip-read but prefer written communication for clarity."
                rows={5}
              />
              <InputField
                label="Preferred Language / Method"
                field="preferredLanguage"
                placeholder="e.g., ASL, Written English, Both"
              />
            </>
          )}
        </div>

        {/* Danger Zone */}
        <div className={`mt-8 p-4 rounded-xl border-2 ${t.danger}`}>
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Danger Zone
          </h3>
          <p className="text-sm mb-3">This will permanently delete all your saved information from this device.</p>
          {confirmClear ? (
            <div className="flex gap-3">
              <button
                onClick={() => { clearInfo(); setConfirmClear(false); }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-500"
              >
                Yes, Delete Everything
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-4 py-2 rounded-lg border border-current"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Information
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
