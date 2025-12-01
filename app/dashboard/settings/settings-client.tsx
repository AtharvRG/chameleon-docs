"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
    User,
    Mail,
    Lock,
    Trash2,
    Save,
    Moon,
    Sun,
    Monitor,
    Check,
    AlertTriangle,
    LogOut,
    Key,
    Eye,
    EyeOff,
    Smartphone,
    Calendar,
    Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { GlassTabs } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { signOutAction } from "@/actions/auth-actions";
import { updateUserProfile, updateUserPassword, deleteUserAccount } from "@/actions/auth-actions";
import { updatePreferences, getUserPreferences } from "@/actions/preference-actions";
import type { ISimplificationPreferences, SimplificationLevel } from "@/models/User";

interface UserData {
    name: string;
    email: string;
    image?: string;
    createdAt: string;
    simplificationPreferences?: ISimplificationPreferences;
}

interface SettingsClientProps {
    user: UserData;
}

const TABS = [
    { id: "profile", label: "Profile" },
    { id: "preferences", label: "Preferences" },
    { id: "account", label: "Account" },
    { id: "appearance", label: "Appearance" },
];

const THEME_OPTIONS = [
    { id: "system", label: "System", icon: Monitor, description: "Follow system preference" },
    { id: "light", label: "Light", icon: Sun, description: "Always use light mode" },
    { id: "dark", label: "Dark", icon: Moon, description: "Always use dark mode" },
];

const ACCENT_COLORS = [
    { id: "indigo", color: "#6366f1", label: "Indigo" },
    { id: "violet", color: "#8b5cf6", label: "Violet" },
    { id: "blue", color: "#3b82f6", label: "Blue" },
    { id: "cyan", color: "#06b6d4", label: "Cyan" },
    { id: "teal", color: "#14b8a6", label: "Teal" },
    { id: "green", color: "#22c55e", label: "Green" },
    { id: "orange", color: "#f97316", label: "Orange" },
    { id: "rose", color: "#f43f5e", label: "Rose" },
];

const TECH_BACKGROUNDS = [
    { id: "none", label: "No Technical Background", description: "New to technology and programming" },
    { id: "beginner", label: "Beginner", description: "Learning the basics of programming" },
    { id: "intermediate", label: "Intermediate", description: "Comfortable with coding concepts" },
    { id: "advanced", label: "Advanced", description: "Professional developer or engineer" },
    { id: "expert", label: "Expert", description: "Senior engineer or architect" },
];

const LEARNING_STYLES = [
    { id: "visual", label: "Visual", description: "Prefer diagrams, charts, and visual explanations" },
    { id: "detailed", label: "Detailed", description: "Prefer thorough, step-by-step explanations" },
    { id: "examples", label: "Example-based", description: "Learn best through code examples and demos" },
    { id: "concise", label: "Concise", description: "Prefer brief, to-the-point information" },
];

const DOC_EXPERIENCE = [
    { id: "never", label: "Never", description: "I rarely read technical documentation" },
    { id: "rarely", label: "Rarely", description: "Only when absolutely necessary" },
    { id: "sometimes", label: "Sometimes", description: "When learning something new" },
    { id: "often", label: "Often", description: "Regularly for work or projects" },
    { id: "daily", label: "Daily", description: "Documentation is part of my daily workflow" },
];

const EXPLANATION_DEPTHS = [
    { id: "high-level", label: "High-Level Overview", description: "Just the key concepts, skip the details" },
    { id: "moderate", label: "Moderate Detail", description: "Balance between overview and specifics" },
    { id: "detailed", label: "In-Depth", description: "Give me all the technical details" },
];

const SIMPLIFICATION_LEVELS = [
    { id: "technical", label: "Technical", description: "Precise, detailed, and terminology-rich" },
    { id: "standard", label: "Standard", description: "Minimal rephrasing, mostly original" },
    { id: "simplified", label: "Simplified", description: "Moderate simplification, clearer language" },
    { id: "beginner", label: "Beginner", description: "Very simplified, basic explanations" },
    { id: "noob", label: "Noob", description: "Maximum simplification, for complete beginners" },
];

export function SettingsClient({ user }: SettingsClientProps) {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState("profile");
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Profile state
    const [profileData, setProfileData] = useState({
        name: user.name,
        email: user.email,
    });
    const [profileError, setProfileError] = useState("");

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Appearance state - stored in localStorage
    const [accentColor, setAccentColor] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("chameleon-accent") || "indigo";
        }
        return "indigo";
    });

    // Delete account state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // Preferences state
    const [preferencesData, setPreferencesData] = useState({
        techBackground: user.simplificationPreferences?.techBackground || "beginner",
        primaryRole: user.simplificationPreferences?.primaryRole || "",
        learningStyle: user.simplificationPreferences?.learningStyle || "detailed",
        experienceWithDocs: user.simplificationPreferences?.experienceWithDocs || "sometimes",
        preferredExplanationDepth: user.simplificationPreferences?.preferredExplanationDepth || "moderate",
        defaultSimplificationLevel: user.simplificationPreferences?.defaultSimplificationLevel || "standard",
    });
    const [preferencesError, setPreferencesError] = useState("");
    const [preferencesSaving, setPreferencesSaving] = useState(false);
    const [preferencesSuccess, setPreferencesSuccess] = useState(false);

    // Apply accent color theme class on mount and when it changes
    useEffect(() => {
        // Remove all theme classes first
        const themeClasses = ['theme-indigo', 'theme-violet', 'theme-blue', 'theme-cyan', 'theme-teal', 'theme-green', 'theme-orange', 'theme-rose'];
        document.documentElement.classList.remove(...themeClasses);
        
        // Add the current accent color theme class
        document.documentElement.classList.add(`theme-${accentColor}`);
    }, [accentColor]);

    // Handle profile save
    const handleSaveProfile = async () => {
        setProfileError("");
        
        if (!profileData.name.trim()) {
            setProfileError("Name is required");
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("name", profileData.name.trim());

            const result = await updateUserProfile(formData);
            if (result.success) {
                setSaveSuccess(true);
                setSuccessMessage("Profile updated successfully!");
                setTimeout(() => {
                    setSaveSuccess(false);
                    setSuccessMessage("");
                }, 3000);
            } else {
                setProfileError(result.error || "Failed to update profile");
            }
        } catch (error) {
            setProfileError("An error occurred while saving");
        }
        setIsSaving(false);
    };

    // Handle password change
    const handleChangePassword = async () => {
        setPasswordError("");
        setPasswordSuccess(false);

        if (!passwordData.currentPassword) {
            setPasswordError("Current password is required");
            return;
        }

        if (!passwordData.newPassword) {
            setPasswordError("New password is required");
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setPasswordError("New password must be at least 8 characters long");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("currentPassword", passwordData.currentPassword);
            formData.append("newPassword", passwordData.newPassword);

            const result = await updateUserPassword(formData);
            if (result.success) {
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                setPasswordSuccess(true);
                setTimeout(() => setPasswordSuccess(false), 3000);
            } else {
                setPasswordError(result.error || "Failed to update password");
            }
        } catch (error) {
            setPasswordError("An error occurred");
        }
        setIsSaving(false);
    };

    // Handle account deletion
    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== user.email) return;

        setIsDeleting(true);
        try {
            const result = await deleteUserAccount();
            if (result.success) {
                router.push("/");
            } else {
                alert(result.error || "Failed to delete account");
            }
        } catch (error) {
            alert("An error occurred");
        }
        setIsDeleting(false);
    };

    // Handle theme change
    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
    };

    // Handle accent color change
    const handleAccentColorChange = (colorId: string) => {
        setAccentColor(colorId);
        if (typeof window !== "undefined") {
            localStorage.setItem("chameleon-accent", colorId);
        }
    };

    // Handle preferences save
    const handleSavePreferences = async () => {
        setPreferencesError("");
        setPreferencesSaving(true);
        
        try {
            const result = await updatePreferences({
                techBackground: preferencesData.techBackground as ISimplificationPreferences["techBackground"],
                primaryRole: preferencesData.primaryRole,
                learningStyle: preferencesData.learningStyle as ISimplificationPreferences["learningStyle"],
                experienceWithDocs: preferencesData.experienceWithDocs as ISimplificationPreferences["experienceWithDocs"],
                preferredExplanationDepth: preferencesData.preferredExplanationDepth as ISimplificationPreferences["preferredExplanationDepth"],
                defaultSimplificationLevel: preferencesData.defaultSimplificationLevel as SimplificationLevel,
            });

            if (result.success) {
                setPreferencesSuccess(true);
                setTimeout(() => setPreferencesSuccess(false), 3000);
            } else {
                setPreferencesError(result.error || "Failed to update preferences");
            }
        } catch (error) {
            setPreferencesError("An error occurred while saving preferences");
        }
        
        setPreferencesSaving(false);
    };

    // Calculate password strength
    const getPasswordStrength = (password: string): number => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 15;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20;
        if (/\d/.test(password)) strength += 20;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
        return Math.min(strength, 100);
    };

    const passwordStrength = getPasswordStrength(passwordData.newPassword);

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="font-heading text-4xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            {/* Tabs */}
            <GlassTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === "profile" && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Profile Avatar Display */}
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{user.name}</h2>
                                    <p className="text-muted-foreground">{user.email}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        <Calendar className="inline h-3 w-3 mr-1" />
                                        Member since {formatDate(user.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Profile Information */}
                        <GlassCard className="p-6">
                            <h2 className="text-lg font-semibold mb-6">Profile Information</h2>
                            
                            {saveSuccess && successMessage && (
                                <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm flex items-center gap-2">
                                    <Check className="h-4 w-4" />
                                    {successMessage}
                                </div>
                            )}

                            {profileError && (
                                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                    {profileError}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Display Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            placeholder="Your name"
                                            className="w-full h-11 pl-10 pr-4 rounded-lg border border-white/10 bg-white/5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        This is how your name will appear across the platform.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            disabled
                                            className="w-full h-11 pl-10 pr-4 rounded-lg border border-white/10 bg-white/5 text-sm outline-none opacity-60 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Email address cannot be changed.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setProfileData({ name: user.name, email: user.email })}
                                >
                                    Reset
                                </Button>
                                <Button onClick={handleSaveProfile} disabled={isSaving || profileData.name === user.name}>
                                    {isSaving ? (
                                        "Saving..."
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === "preferences" && (
                    <motion.div
                        key="preferences"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Simplification Level */}
                        <GlassCard className="p-6">
                            <h2 className="text-lg font-semibold mb-2">Default Simplification Level</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                Choose the default simplification level when reading documentation
                            </p>
                            <div className="grid gap-3">
                                {SIMPLIFICATION_LEVELS.map((level) => (
                                    <button
                                        key={level.id}
                                        onClick={() => setPreferencesData(prev => ({ ...prev, defaultSimplificationLevel: level.id }))}
                                        className={`group flex w-full flex-col items-start rounded-lg border p-4 text-left transition-all ${
                                            preferencesData.defaultSimplificationLevel === level.id
                                                ? "border-primary bg-primary/10"
                                                : "border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/5"
                                        } focus:outline-none focus:ring-1 focus:ring-primary`}
                                    >
                                        <span className={`font-medium ${preferencesData.defaultSimplificationLevel === level.id ? "text-primary" : "group-hover:text-primary"} transition-colors`}>
                                            {level.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-1">{level.description}</span>
                                    </button>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Technical Background */}
                        <GlassCard className="p-6">
                            <h2 className="text-lg font-semibold mb-2">Technical Background</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                Your technical experience level
                            </p>
                            <div className="grid gap-3">
                                {TECH_BACKGROUNDS.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setPreferencesData(prev => ({ ...prev, techBackground: option.id }))}
                                        className={`group flex w-full flex-col items-start rounded-lg border p-4 text-left transition-all ${
                                            preferencesData.techBackground === option.id
                                                ? "border-primary bg-primary/10"
                                                : "border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/5"
                                        } focus:outline-none focus:ring-1 focus:ring-primary`}
                                    >
                                        <span className={`font-medium ${preferencesData.techBackground === option.id ? "text-primary" : "group-hover:text-primary"} transition-colors`}>
                                            {option.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
                                    </button>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Learning Style */}
                        <GlassCard className="p-6">
                            <h2 className="text-lg font-semibold mb-2">Learning Style</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                How do you prefer to learn?
                            </p>
                            <div className="grid gap-3 md:grid-cols-2">
                                {LEARNING_STYLES.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setPreferencesData(prev => ({ ...prev, learningStyle: option.id }))}
                                        className={`group flex w-full flex-col items-start rounded-lg border p-4 text-left transition-all ${
                                            preferencesData.learningStyle === option.id
                                                ? "border-primary bg-primary/10"
                                                : "border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/5"
                                        } focus:outline-none focus:ring-1 focus:ring-primary`}
                                    >
                                        <span className={`font-medium ${preferencesData.learningStyle === option.id ? "text-primary" : "group-hover:text-primary"} transition-colors`}>
                                            {option.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
                                    </button>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Documentation Experience */}
                        <GlassCard className="p-6">
                            <h2 className="text-lg font-semibold mb-2">Documentation Experience</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                How often do you read technical documentation?
                            </p>
                            <div className="grid gap-3">
                                {DOC_EXPERIENCE.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setPreferencesData(prev => ({ ...prev, experienceWithDocs: option.id }))}
                                        className={`group flex w-full flex-col items-start rounded-lg border p-4 text-left transition-all ${
                                            preferencesData.experienceWithDocs === option.id
                                                ? "border-primary bg-primary/10"
                                                : "border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/5"
                                        } focus:outline-none focus:ring-1 focus:ring-primary`}
                                    >
                                        <span className={`font-medium ${preferencesData.experienceWithDocs === option.id ? "text-primary" : "group-hover:text-primary"} transition-colors`}>
                                            {option.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
                                    </button>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Explanation Depth */}
                        <GlassCard className="p-6">
                            <h2 className="text-lg font-semibold mb-2">Preferred Explanation Depth</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                How detailed should explanations be?
                            </p>
                            <div className="grid gap-3">
                                {EXPLANATION_DEPTHS.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setPreferencesData(prev => ({ ...prev, preferredExplanationDepth: option.id }))}
                                        className={`group flex w-full flex-col items-start rounded-lg border p-4 text-left transition-all ${
                                            preferencesData.preferredExplanationDepth === option.id
                                                ? "border-primary bg-primary/10"
                                                : "border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/5"
                                        } focus:outline-none focus:ring-1 focus:ring-primary`}
                                    >
                                        <span className={`font-medium ${preferencesData.preferredExplanationDepth === option.id ? "text-primary" : "group-hover:text-primary"} transition-colors`}>
                                            {option.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
                                    </button>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Save Preferences */}
                        <GlassCard className="p-6">
                            {preferencesSuccess && (
                                <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm flex items-center gap-2">
                                    <Check className="h-4 w-4" />
                                    Preferences saved successfully!
                                </div>
                            )}
                            
                            {preferencesError && (
                                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                    {preferencesError}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <Button onClick={handleSavePreferences} disabled={preferencesSaving}>
                                    {preferencesSaving ? (
                                        "Saving..."
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Preferences
                                        </>
                                    )}
                                </Button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === "account" && (
                    <motion.div
                        key="account"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Change Password */}
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <Key className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Change Password</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Update your password to keep your account secure
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Current Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="w-full h-10 pl-10 pr-10 rounded-lg border border-white/10 bg-white/5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full h-10 pl-10 pr-10 rounded-lg border border-white/10 bg-white/5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {passwordData.newPassword && (
                                        <div className="space-y-2">
                                            <Progress value={passwordStrength} className="h-1" />
                                            <p className={`text-xs ${passwordStrength < 50 ? "text-red-500" : passwordStrength < 75 ? "text-yellow-500" : "text-green-500"}`}>
                                                Password strength: {passwordStrength < 50 ? "Weak" : passwordStrength < 75 ? "Medium" : "Strong"}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Confirm New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full h-10 pl-10 pr-10 rounded-lg border border-white/10 bg-white/5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {passwordError && (
                                    <p className="text-sm text-red-500">{passwordError}</p>
                                )}

                                <Button onClick={handleChangePassword} disabled={isSaving}>
                                    {isSaving ? "Updating..." : "Update Password"}
                                </Button>
                            </div>
                        </GlassCard>

                        {/* Sessions */}
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                                    <Smartphone className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Active Sessions</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Manage your active sessions across devices
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                                            <Monitor className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Current Session</p>
                                            <p className="text-xs text-muted-foreground">
                                                Windows · Chrome · Active now
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="success">Current</Badge>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Button variant="outline" size="sm" onClick={() => signOutAction()}>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out All Other Sessions
                                </Button>
                            </div>
                        </GlassCard>

                        {/* Export Data */}
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                                    <Download className="h-5 w-5 text-cyan-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Export Data</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Download a copy of all your data
                                    </p>
                                </div>
                            </div>

                            <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Request Data Export
                            </Button>
                        </GlassCard>

                        {/* Danger Zone */}
                        <GlassCard className="p-6 border-red-500/20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Irreversible and destructive actions
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-medium">Delete Account</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Permanently delete your account and all associated data. This action cannot be undone.
                                        </p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setShowDeleteModal(true)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Account
                                    </Button>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === "appearance" && (
                    <motion.div
                        key="appearance"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Theme */}
                        <GlassCard className="p-6">
                            <h2 className="text-lg font-semibold mb-2">Theme</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                Choose how Chameleon Docs looks to you
                            </p>
                            <div className="grid gap-4 md:grid-cols-3">
                                {THEME_OPTIONS.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => handleThemeChange(option.id)}
                                            className={`flex flex-col items-center gap-3 rounded-xl border p-6 transition-all ${theme === option.id
                                                ? "border-primary bg-primary/10"
                                                : "border-white/10 bg-white/5 hover:bg-white/10"
                                                }`}
                                        >
                                            <Icon className={`h-8 w-8 ${theme === option.id ? "text-primary" : "text-muted-foreground"}`} />
                                            <span className="font-medium">{option.label}</span>
                                            {theme === option.id && (
                                                <Badge variant="default" className="text-[10px]">
                                                    Active
                                                </Badge>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </GlassCard>

                        {/* Accent Color */}
                        <GlassCard className="p-6">
                            <h2 className="text-lg font-semibold mb-2">Accent Color</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                Choose your preferred accent color
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {ACCENT_COLORS.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() => handleAccentColorChange(color.id)}
                                        className={`group relative h-12 w-12 rounded-full transition-transform hover:scale-110 ${accentColor === color.id ? "ring-2 ring-offset-2 ring-offset-background ring-current" : ""}`}
                                        style={{ backgroundColor: color.color, color: color.color }}
                                        title={color.label}
                                    >
                                        {accentColor === color.id && (
                                            <Check className="absolute inset-0 m-auto h-5 w-5 text-white" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                This setting is saved locally in your browser.
                            </p>
                        </GlassCard>
                    </motion.div>
                )}


            </AnimatePresence>

            {/* Delete Account Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => !isDeleting && setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md rounded-2xl border border-red-500/20 bg-background p-6 shadow-2xl"
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                                <AlertTriangle className="h-6 w-6 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Delete Account</h3>
                            <p className="text-muted-foreground mb-4">
                                This action is permanent and cannot be undone. All your projects, pages, and data will be permanently deleted.
                            </p>

                            <div className="space-y-4 mb-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Type <span className="font-mono text-red-500">{user.email}</span> to confirm
                                    </label>
                                    <input
                                        type="text"
                                        value={deleteConfirmation}
                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                        placeholder={user.email}
                                        className="w-full h-10 px-4 rounded-lg border border-red-500/30 bg-red-500/5 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting || deleteConfirmation !== user.email}
                                >
                                    {isDeleting ? "Deleting..." : "Delete My Account"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
