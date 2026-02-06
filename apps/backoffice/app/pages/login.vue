<!--
  @pattern Strategy Pattern + Command Pattern
  @purpose Login page with form validation and authentication
  @description User authentication form with loading states and error handling
-->

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LoginCredentials } from "@/types/auth";

/**
 * Layout: Use auth layout for minimal design
 */
definePageMeta({
  layout: "auth",
});

/**
 * Authentication composable
 * Pattern: Facade Pattern - simplified auth interface
 */
const { login: authLogin, error: authError, loading: authLoading, isAuthenticated } = useAuth();

/**
 * Auto-redirect if already authenticated
 */
if (import.meta.client) {
  onMounted(() => {
    if (isAuthenticated.value) {
      navigateTo("/");
    }
  });
}

/**
 * SEO Metadata
 */
useSeoMeta({
  title: "Login - Atelier Kaisla Backoffice",
  description: "Login to Atelier Kaisla backoffice admin panel",
  robots: "noindex, nofollow",
});

/**
 * Form state (reactive)
 */
const credentials = ref<LoginCredentials>({
  username: "",
  password: "",
});

/**
 * UI state
 */
const showPassword = ref(false);
const formError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

/**
 * Validation state
 * Pattern: Chain of Responsibility for validation
 */
const usernameError = computed(() => {
  if (!credentials.value.username) return "Username is required";
  if (credentials.value.username.length < 3) return "Username must be at least 3 characters";
  return null;
});

const passwordError = computed(() => {
  if (!credentials.value.password) return "Password is required";
  if (credentials.value.password.length < 6) return "Password must be at least 6 characters";
  return null;
});

const isFormValid = computed(() => {
  return !usernameError.value && !passwordError.value;
});

/**
 * Form submission handler
 * Pattern: Command Pattern - encapsulates login action
 */
const handleSubmit = async () => {
  // Clear previous messages
  formError.value = null;
  successMessage.value = null;

  // Validate form
  if (!isFormValid.value) {
    formError.value = "Please fix the errors before submitting";
    return;
  }

  // Call auth login
  const success = await authLogin(credentials.value);

  if (success) {
    // Show success message briefly before redirect
    successMessage.value = "Login successful! Redirecting...";
    // useAuth will handle navigation to home
  } else if (authError.value) {
    // Display error from useAuth
    const errorMessage = Array.isArray(authError.value.message)
      ? authError.value.message.join(", ")
      : authError.value.message;

    formError.value = errorMessage || "Login failed. Please check your credentials.";
  }
};

/**
 * Handle Enter key press
 */
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === "Enter" && isFormValid.value && !authLoading.value) {
    handleSubmit();
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Card Header -->
    <div class="space-y-2 text-center">
      <h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Welcome back Combiniiiiiita
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400">
        Entre tes identifiants et un monde va s'ouvrir devant toi
      </p>
    </div>

    <!-- Login Form Card -->
    <div
      class="rounded-lg border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <form @submit.prevent="handleSubmit" @keypress="handleKeyPress" class="space-y-6">
        <!-- Username Field -->
        <div class="space-y-2">
          <Label for="username" class="text-sm font-medium"> Quel est ton nom Combinita ? </Label>
          <Input
            id="username"
            v-model="credentials.username"
            type="text"
            autocomplete="username"
            placeholder="ex : combinita"
            :disabled="authLoading"
            :class="{ 'border-red-500 dark:border-red-500': usernameError && credentials.username }"
            class="w-full"
          />
          <p v-if="usernameError && credentials.username" class="text-xs text-red-600 dark:text-red-400">
            {{ usernameError }}
          </p>
        </div>

        <!-- Password Field -->
        <div class="space-y-2">
          <Label for="password" class="text-sm font-medium">Le mot de passe c'est là</Label>
          <div class="relative">
            <Input
              id="password"
              v-model="credentials.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="ex : pas combinita"
              :disabled="authLoading"
              :class="{ 'border-red-500 dark:border-red-500': passwordError && credentials.password }"
              class="w-full pr-10"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              :disabled="authLoading"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              tabindex="-1"
            >
              <span v-if="showPassword" class="text-xs">Tu me vois</span>
              <span v-else class="text-xs">Tu me vois pas</span>
            </button>
          </div>
          <p v-if="passwordError && credentials.password" class="text-xs text-red-600 dark:text-red-400">
            {{ passwordError }}
          </p>
        </div>

        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="rounded-md bg-green-50 border border-green-200 p-3 dark:bg-green-900/20 dark:border-green-800 animate-fade-in"
        >
          <div class="flex items-center gap-2">
            <svg
              class="h-4 w-4 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <p class="text-sm text-green-800 dark:text-green-200">
              {{ successMessage }}
            </p>
          </div>
        </div>

        <!-- Form Error Message -->
        <div
          v-if="formError"
          class="rounded-md bg-red-50 border border-red-200 p-3 dark:bg-red-900/20 dark:border-red-800 animate-fade-in"
        >
          <div class="flex items-center gap-2">
            <svg
              class="h-4 w-4 text-red-600 dark:text-red-400"
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
            <p class="text-sm text-red-800 dark:text-red-200">
              {{ formError }}
            </p>
          </div>
        </div>

        <!-- Submit Button -->
        <Button type="submit" :disabled="!isFormValid || authLoading" class="w-full">
          <span v-if="!authLoading">Hop !</span>
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
            Un peu de patience Combinita...
          </span>
        </Button>
      </form>

      <!-- Footer Info -->
      <div class="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700">
        <p class="text-xs text-center text-slate-600 dark:text-slate-400">
          Demo credentials: <code class="bg-slate-100 dark:bg-slate-700 px-1 rounded">admin</code> /
          <code class="bg-slate-100 dark:bg-slate-700 px-1 rounded">k4sla1!</code>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/**
 * Component-specific styles
 */
code {
  font-family: "Courier New", monospace;
  font-size: 0.75rem;
}

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
</style>
