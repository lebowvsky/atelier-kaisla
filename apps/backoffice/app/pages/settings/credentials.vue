<!--
  @pattern Chain of Responsibility + Command Pattern
  @purpose Credentials update page with validation chain and command execution
  @description Secure form for updating user email and password with comprehensive validation
-->

<script setup lang="ts">
import { ref, computed } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Page metadata
 * Note: Route is automatically protected by global auth middleware (auth.global.ts)
 */

/**
 * SEO Metadata
 */
useSeoMeta({
  title: "Modify Credentials - Atelier Kaisla Backoffice",
  description: "Update your login credentials securely",
  robots: "noindex, nofollow",
});

/**
 * Authentication composable
 * Pattern: Facade Pattern - simplified auth interface
 */
const { getToken, user } = useAuth();

/**
 * Runtime configuration for API URL
 */
const config = useRuntimeConfig();

/**
 * Get API URL based on environment and execution context
 * Pattern: Adapter Pattern for environment-specific configuration
 */
const getApiUrl = (): string => {
  // Client-side (browser)
  if (import.meta.client) {
    // Production: use public API URL from environment
    if (process.env.NODE_ENV === "production") {
      return config.public.apiUrl;
    }
    // Development: force localhost (backend hostname not accessible from browser)
    return "http://localhost:4000/api";
  }

  // Server-side (SSR): always use environment variable
  return config.public.apiUrl || "http://backend:4000/api";
};

/**
 * Form state (reactive)
 * Pattern: Value Object for credentials data
 */
interface CredentialsForm {
  currentPassword: string;
  username: string;
  newPassword: string;
  confirmPassword: string;
}

const form = ref<CredentialsForm>({
  currentPassword: "",
  username: user.value?.username || "", // Pre-fill with current username
  newPassword: "",
  confirmPassword: "",
});

/**
 * UI state
 */
const loading = ref(false);
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

/**
 * Validation functions
 * Pattern: Chain of Responsibility for validation
 */
const currentPasswordError = computed(() => {
  if (!form.value.currentPassword) return "Current password is required";
  return null;
});

const usernameError = computed(() => {
  if (form.value.username && form.value.username.length < 3) {
    return "Username must be at least 3 characters";
  }
  return null;
});

const newPasswordError = computed(() => {
  if (form.value.newPassword && form.value.newPassword.length < 6) {
    return "New password must be at least 6 characters";
  }
  return null;
});

const confirmPasswordError = computed(() => {
  if (form.value.confirmPassword && form.value.newPassword !== form.value.confirmPassword) {
    return "Passwords do not match";
  }
  return null;
});

/**
 * Check if at least one field is being modified
 */
const hasChanges = computed(() => {
  const usernameChanged = form.value.username && form.value.username !== user.value?.username;
  const passwordChanged = form.value.newPassword.length > 0;
  return usernameChanged || passwordChanged;
});

/**
 * Check if form is valid
 */
const isFormValid = computed(() => {
  // Current password is always required
  if (!form.value.currentPassword) return false;

  // At least one field must be changed
  if (!hasChanges.value) return false;

  // No validation errors
  if (usernameError.value) return false;
  if (newPasswordError.value) return false;
  if (confirmPasswordError.value) return false;

  // If changing password, confirmation must match
  if (form.value.newPassword && form.value.newPassword !== form.value.confirmPassword) {
    return false;
  }

  return true;
});

/**
 * Form submission handler
 * Pattern: Command Pattern - encapsulates credentials update action
 */
const handleSubmit = async () => {
  // Clear previous messages
  successMessage.value = null;
  errorMessage.value = null;

  // Validate form
  if (!isFormValid.value) {
    errorMessage.value = "Please fix the errors before submitting";
    return;
  }

  loading.value = true;

  try {
    const apiUrl = getApiUrl();
    const token = getToken();

    console.log("[credentials] Updating credentials at:", `${apiUrl}/auth/credentials`);

    // Prepare request body
    const requestBody: {
      currentPassword: string;
      username?: string;
      newPassword?: string;
    } = {
      currentPassword: form.value.currentPassword,
    };

    // Only include changed fields
    if (form.value.username && form.value.username !== user.value?.username) {
      requestBody.username = form.value.username;
    }

    if (form.value.newPassword) {
      requestBody.newPassword = form.value.newPassword;
    }

    console.log("[credentials] Request body:", {
      ...requestBody,
      currentPassword: "***",
      newPassword: requestBody.newPassword ? "***" : undefined,
    });

    // Call backend credentials update endpoint
    interface UpdateCredentialsResponse {
      id: string;
      username: string;
      role: string;
      createdAt: string;
      updatedAt: string;
    }

    const response = await $fetch<UpdateCredentialsResponse>(`${apiUrl}/auth/credentials`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: requestBody,
    });

    console.log("[credentials] Update successful:", response);

    // Show success message
    successMessage.value = "Credentials updated successfully";

    // Clear form
    form.value.currentPassword = "";
    form.value.username = user.value?.username || "";
    form.value.newPassword = "";
    form.value.confirmPassword = "";

    // Scroll to top to show success message
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err: any) {
    console.error("[credentials] Update error:", err);

    // Adapter Pattern: Transform error to standard format
    const errorMsg =
      err.data?.message ||
      (Array.isArray(err.message) ? err.message.join(", ") : err.message) ||
      "Failed to update credentials";

    errorMessage.value = errorMsg;

    // Scroll to top to show error message
    window.scrollTo({ top: 0, behavior: "smooth" });
  } finally {
    loading.value = false;
  }
};

/**
 * Handle Enter key press
 */
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === "Enter" && isFormValid.value && !loading.value) {
    handleSubmit();
  }
};
</script>

<template>
  <div class="container mx-auto max-w-2xl py-8 px-4">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Modify Credentials
      </h1>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Update your login username and password securely
      </p>
    </div>

    <!-- Success Message -->
    <div
      v-if="successMessage"
      class="mb-6 rounded-md bg-green-50 border border-green-200 p-4 dark:bg-green-900/20 dark:border-green-800 animate-fade-in"
    >
      <div class="flex items-start gap-3">
        <svg
          class="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-medium text-green-800 dark:text-green-200">
            {{ successMessage }}
          </p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="errorMessage"
      class="mb-6 rounded-md bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800 animate-fade-in"
    >
      <div class="flex items-start gap-3">
        <svg
          class="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-medium text-red-800 dark:text-red-200">
            {{ errorMessage }}
          </p>
        </div>
      </div>
    </div>

    <!-- Credentials Form Card -->
    <div
      class="rounded-lg border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <form @submit.prevent="handleSubmit" @keypress="handleKeyPress" class="space-y-6">
        <!-- Current Password Field (Always Required) -->
        <div class="space-y-2">
          <Label for="currentPassword" class="text-sm font-medium">
            Current Password
            <span class="text-red-500">*</span>
          </Label>
          <div class="relative">
            <Input
              id="currentPassword"
              v-model="form.currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Enter your current password"
              :disabled="loading"
              :class="{
                'border-red-500 dark:border-red-500':
                  currentPasswordError && form.currentPassword,
              }"
              class="w-full pr-20"
            />
            <button
              type="button"
              @click="showCurrentPassword = !showCurrentPassword"
              :disabled="loading"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs"
              tabindex="-1"
            >
              {{ showCurrentPassword ? "Hide" : "Show" }}
            </button>
          </div>
          <p
            v-if="currentPasswordError && form.currentPassword"
            class="text-xs text-red-600 dark:text-red-400"
          >
            {{ currentPasswordError }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Required to confirm your identity before making changes
          </p>
        </div>

        <!-- Divider -->
        <div class="border-t border-slate-200 dark:border-slate-700"></div>

        <!-- Username Field (Optional) -->
        <div class="space-y-2">
          <Label for="username" class="text-sm font-medium">
            Username
            <span class="text-slate-500 text-xs font-normal">(optional)</span>
          </Label>
          <Input
            id="username"
            v-model="form.username"
            type="text"
            autocomplete="username"
            placeholder="Enter new username"
            :disabled="loading"
            :class="{ 'border-red-500 dark:border-red-500': usernameError && form.username }"
            class="w-full"
          />
          <p v-if="usernameError && form.username" class="text-xs text-red-600 dark:text-red-400">
            {{ usernameError }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Current: {{ user?.username || "N/A" }}
          </p>
        </div>

        <!-- New Password Field (Optional) -->
        <div class="space-y-2">
          <Label for="newPassword" class="text-sm font-medium">
            New Password
            <span class="text-slate-500 text-xs font-normal">(optional)</span>
          </Label>
          <div class="relative">
            <Input
              id="newPassword"
              v-model="form.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Enter new password"
              :disabled="loading"
              :class="{
                'border-red-500 dark:border-red-500': newPasswordError && form.newPassword,
              }"
              class="w-full pr-20"
            />
            <button
              type="button"
              @click="showNewPassword = !showNewPassword"
              :disabled="loading"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs"
              tabindex="-1"
            >
              {{ showNewPassword ? "Hide" : "Show" }}
            </button>
          </div>
          <p
            v-if="newPasswordError && form.newPassword"
            class="text-xs text-red-600 dark:text-red-400"
          >
            {{ newPasswordError }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Must be at least 6 characters long
          </p>
        </div>

        <!-- Confirm Password Field (Required if New Password is set) -->
        <div v-if="form.newPassword" class="space-y-2">
          <Label for="confirmPassword" class="text-sm font-medium">
            Confirm New Password
            <span class="text-red-500">*</span>
          </Label>
          <div class="relative">
            <Input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Confirm your new password"
              :disabled="loading"
              :class="{
                'border-red-500 dark:border-red-500':
                  confirmPasswordError && form.confirmPassword,
              }"
              class="w-full pr-20"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              :disabled="loading"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs"
              tabindex="-1"
            >
              {{ showConfirmPassword ? "Hide" : "Show" }}
            </button>
          </div>
          <p
            v-if="confirmPasswordError && form.confirmPassword"
            class="text-xs text-red-600 dark:text-red-400"
          >
            {{ confirmPasswordError }}
          </p>
        </div>

        <!-- Validation Messages -->
        <div v-if="!hasChanges && form.currentPassword" class="text-sm text-amber-600 dark:text-amber-400">
          ⚠️ Please modify at least one field (username or password)
        </div>

        <!-- Submit Button -->
        <div class="flex items-center gap-4 pt-4">
          <Button type="submit" :disabled="!isFormValid || loading" class="flex-1 sm:flex-none">
            <span v-if="!loading">Update Credentials</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg
                class="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Updating...
            </span>
          </Button>

          <NuxtLink
            to="/"
            class="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Cancel
          </NuxtLink>
        </div>
      </form>

      <!-- Security Notice -->
      <div class="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700">
        <div class="flex items-start gap-3">
          <svg
            class="h-5 w-5 text-slate-400 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <div>
            <p class="text-xs font-medium text-slate-700 dark:text-slate-300">Security Notice</p>
            <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Your current password is always required to make changes. If you change your
              password, you will need to use the new one for your next login.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/**
 * Animation: Fade in for messages
 */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/**
 * Responsive container
 */
.container {
  width: 100%;
  max-width: 100%;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}
</style>
