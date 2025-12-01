"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Sparkles, ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import MagneticButton from "@/components/ui/magnetic-button";
import { saveOnboardingPreferences } from "@/actions/preference-actions";

const STEPS = [
    { id: 1, title: "Technical Background" },
    { id: 2, title: "Your Role" },
    { id: 3, title: "Learning Style" },
    { id: 4, title: "Documentation Experience" },
    { id: 5, title: "Explanation Depth" },
    { id: 6, title: "All Set!" },
];

const TECH_BACKGROUNDS = [
    { id: "none", label: "No Technical Background", description: "New to technology and programming" },
    { id: "beginner", label: "Beginner", description: "Learning the basics of programming" },
    { id: "intermediate", label: "Intermediate", description: "Comfortable with coding concepts" },
    { id: "advanced", label: "Advanced", description: "Professional developer or engineer" },
    { id: "expert", label: "Expert", description: "Senior engineer or architect" },
];

const ROLES = [
    "Student",
    "Hobbyist/Self-learner",
    "Junior Developer",
    "Senior Developer",
    "Product Manager",
    "Designer",
    "Technical Writer",
    "Business Analyst",
    "Project Manager",
    "Other",
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

export function OnboardingClient() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        techBackground: "",
        primaryRole: "",
        customRole: "",
        learningStyle: "",
        experienceWithDocs: "",
        preferredExplanationDepth: "",
    });

    const progress = (step / STEPS.length) * 100;

    const handleNext = () => {
        if (step < STEPS.length) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleComplete = async () => {
        setIsSubmitting(true);
        try {
            const result = await saveOnboardingPreferences({
                techBackground: formData.techBackground,
                primaryRole: formData.primaryRole === "Other" ? formData.customRole : formData.primaryRole,
                learningStyle: formData.learningStyle,
                experienceWithDocs: formData.experienceWithDocs,
                preferredExplanationDepth: formData.preferredExplanationDepth,
            });

            if (result.success) {
                // Use window.location for a hard redirect to ensure fresh data
                window.location.href = "/dashboard";
            } else {
                alert(result.error || "Failed to save preferences");
                setIsSubmitting(false);
            }
        } catch (error) {
            alert("An error occurred");
            setIsSubmitting(false);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1: return formData.techBackground !== "";
            case 2: return formData.primaryRole !== "" && (formData.primaryRole !== "Other" || formData.customRole.trim() !== "");
            case 3: return formData.learningStyle !== "";
            case 4: return formData.experienceWithDocs !== "";
            case 5: return formData.preferredExplanationDepth !== "";
            case 6: return true;
            default: return false;
        }
    };

    const selectOption = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Auto-advance after selection for single-choice questions
        if (field !== "primaryRole" || value !== "Other") {
            setTimeout(() => {
                if (step < STEPS.length) {
                    setStep(step + 1);
                }
            }, 300);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
            {/* Ambient Background */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="h-[600px] w-[600px] rounded-full bg-accent/5 blur-[120px]" />
            </div>

            <div className="w-full max-w-lg space-y-8 relative z-10">

                {/* Progress Header */}
                <div className="space-y-4">
                    <div className="flex items-end justify-between">
                        <h1 className="font-heading text-4xl font-medium tracking-tight">
                            Step {step} <span className="text-muted-foreground">/ {STEPS.length}</span>
                        </h1>
                        <span className="font-mono text-xs text-muted-foreground">
                            {Math.round(progress)}% COMPLETE
                        </span>
                    </div>
                    <Progress value={progress} className="h-1" />
                </div>

                <GlassCard className="p-8 sm:p-12 backdrop-blur-3xl">
                    <AnimatePresence mode="wait">

                        {/* Step 1: Technical Background */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="space-y-2">
                                    <h2 className="font-heading text-2xl font-bold">What is your technical background?</h2>
                                    <p className="text-muted-foreground">This helps us tailor documentation complexity for you.</p>
                                </div>
                                <div className="grid gap-3">
                                    {TECH_BACKGROUNDS.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => selectOption("techBackground", option.id)}
                                            className={`group flex w-full flex-col items-start rounded-lg border p-4 text-left transition-all ${formData.techBackground === option.id
                                                    ? "border-accent bg-accent/10"
                                                    : "border-white/5 bg-white/5 hover:border-accent/50 hover:bg-accent/5"
                                                } focus:outline-none focus:ring-1 focus:ring-accent`}
                                        >
                                            <span className={`font-medium ${formData.techBackground === option.id ? "text-accent" : "group-hover:text-accent"} transition-colors`}>
                                                {option.label}
                                            </span>
                                            <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Role Selection */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="space-y-2">
                                    <h2 className="font-heading text-2xl font-bold">What best describes your role?</h2>
                                    <p className="text-muted-foreground">We will customize the experience based on this.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <select
                                            value={formData.primaryRole}
                                            onChange={(e) => setFormData(prev => ({ ...prev, primaryRole: e.target.value }))}
                                            className="w-full h-14 pl-4 pr-10 rounded-lg border border-white/10 bg-white/5 text-base appearance-none outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                                        >
                                            <option value="" disabled>Select your role...</option>
                                            {ROLES.map((role) => (
                                                <option key={role} value={role} className="bg-background">
                                                    {role}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                                    </div>

                                    {formData.primaryRole === "Other" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="space-y-2"
                                        >
                                            <Input
                                                placeholder="Enter your role..."
                                                value={formData.customRole}
                                                onChange={(e) => setFormData(prev => ({ ...prev, customRole: e.target.value }))}
                                                autoFocus
                                                className="text-lg h-14"
                                            />
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Learning Style */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="space-y-2">
                                    <h2 className="font-heading text-2xl font-bold">How do you prefer to learn?</h2>
                                    <p className="text-muted-foreground">Choose your preferred learning style.</p>
                                </div>
                                <div className="grid gap-3">
                                    {LEARNING_STYLES.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => selectOption("learningStyle", option.id)}
                                            className={`group flex w-full flex-col items-start rounded-lg border p-4 text-left transition-all ${formData.learningStyle === option.id
                                                    ? "border-accent bg-accent/10"
                                                    : "border-white/5 bg-white/5 hover:border-accent/50 hover:bg-accent/5"
                                                } focus:outline-none focus:ring-1 focus:ring-accent`}
                                        >
                                            <span className={`font-medium ${formData.learningStyle === option.id ? "text-accent" : "group-hover:text-accent"} transition-colors`}>
                                                {option.label}
                                            </span>
                                            <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Documentation Experience */}
                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="space-y-2">
                                    <h2 className="font-heading text-2xl font-bold">How often do you read documentation?</h2>
                                    <p className="text-muted-foreground">This helps us understand your familiarity with docs.</p>
                                </div>
                                <div className="grid gap-3">
                                    {DOC_EXPERIENCE.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => selectOption("experienceWithDocs", option.id)}
                                            className={`group flex w-full flex-col items-start rounded-lg border p-4 text-left transition-all ${formData.experienceWithDocs === option.id
                                                    ? "border-accent bg-accent/10"
                                                    : "border-white/5 bg-white/5 hover:border-accent/50 hover:bg-accent/5"
                                                } focus:outline-none focus:ring-1 focus:ring-accent`}
                                        >
                                            <span className={`font-medium ${formData.experienceWithDocs === option.id ? "text-accent" : "group-hover:text-accent"} transition-colors`}>
                                                {option.label}
                                            </span>
                                            <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 5: Explanation Depth */}
                        {step === 5 && (
                            <motion.div
                                key="step5"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="space-y-2">
                                    <h2 className="font-heading text-2xl font-bold">How detailed should explanations be?</h2>
                                    <p className="text-muted-foreground">Choose your preferred level of detail.</p>
                                </div>
                                <div className="grid gap-3">
                                    {EXPLANATION_DEPTHS.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => selectOption("preferredExplanationDepth", option.id)}
                                            className={`group flex w-full flex-col items-start rounded-lg border p-4 text-left transition-all ${formData.preferredExplanationDepth === option.id
                                                    ? "border-accent bg-accent/10"
                                                    : "border-white/5 bg-white/5 hover:border-accent/50 hover:bg-accent/5"
                                                } focus:outline-none focus:ring-1 focus:ring-accent`}
                                        >
                                            <span className={`font-medium ${formData.preferredExplanationDepth === option.id ? "text-accent" : "group-hover:text-accent"} transition-colors`}>
                                                {option.label}
                                            </span>
                                            <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 6: Success */}
                        {step === 6 && (
                            <motion.div
                                key="step6"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center space-y-6 text-center py-8"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 animate-ping rounded-full bg-green-500/20" />
                                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                                        <Sparkles className="h-8 w-8" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="font-heading text-3xl font-bold">You are all set!</h2>
                                    <p className="text-muted-foreground max-w-xs mx-auto">
                                        Your preferences have been saved. Documentation will now be tailored to your needs.
                                    </p>
                                </div>
                                <div className="pt-4 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm text-left w-full max-w-sm">
                                    <p className="text-muted-foreground">
                                        <span className="text-foreground font-medium">Your default simplification level:</span>{" "}
                                        {formData.techBackground === "none" && "Noob (Maximum simplification)"}
                                        {formData.techBackground === "beginner" && "Beginner (Very simplified)"}
                                        {formData.techBackground === "intermediate" && "Simplified (Moderate simplification)"}
                                        {formData.techBackground === "advanced" && "Standard (Minimal changes)"}
                                        {formData.techBackground === "expert" && "Technical (Precise and detailed)"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        You can change this anytime in Settings.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>

                    {/* Footer Actions */}
                    <div className="mt-12 flex justify-between gap-4">
                        {step > 1 && step < 6 ? (
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {step === 6 ? (
                            <MagneticButton
                                onClick={handleComplete}
                                size="lg"
                                className="w-full sm:w-auto"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : "Enter Dashboard"}
                            </MagneticButton>
                        ) : step === 2 ? (
                            <MagneticButton
                                onClick={handleNext}
                                size="lg"
                                className="w-full sm:w-auto"
                                disabled={!canProceed()}
                            >
                                Continue
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </MagneticButton>
                        ) : null}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
