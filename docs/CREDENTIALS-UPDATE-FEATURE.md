# Credentials Update Feature

This document describes the credentials update feature in the Atelier Kaisla backoffice.

## Overview

Users can securely update their login credentials (username and password) through a dedicated settings page in the backoffice.

## Features

- **Secure authentication**: Current password required for all changes
- **Flexible updates**: Update username only, password only, or both
- **Real-time validation**: Client-side and server-side validation
- **User feedback**: Clear success/error messages
- **Form state management**: Auto-clear on success, preserve on error
- **Accessibility**: Full keyboard navigation and screen reader support

## Architecture

### Frontend (Nuxt 4)

**Page**: `/apps/backoffice/app/pages/settings/credentials.vue`

**Design Patterns Applied**:
- **Chain of Responsibility Pattern**: Validation pipeline for form fields
- **Command Pattern**: Encapsulates credentials update action
- **Adapter Pattern**: Transforms API errors to user-friendly messages
- **Decorator Pattern**: Adds loading/error states to async operations

**Key Components**:
```typescript
// Form validation chain
const currentPasswordError = computed(() => /* validation logic */)
const usernameError = computed(() => /* validation logic */)
const newPasswordError = computed(() => /* validation logic */)
const confirmPasswordError = computed(() => /* validation logic */)

// Form validity check
const isFormValid = computed(() => {
  // Current password always required
  if (!form.value.currentPassword) return false

  // At least one field must be changed
  if (!hasChanges.value) return false

  // No validation errors
  return !usernameError.value && !newPasswordError.value && !confirmPasswordError.value
})
```

**API Integration**:
```typescript
// PATCH /api/auth/credentials
const requestBody = {
  currentPassword: string,
  username?: string,      // Optional
  newPassword?: string    // Optional
}
```

### Backend (NestJS)

**Endpoint**: `PATCH /api/auth/credentials`

**Controller**: `/apps/backend/src/modules/auth/auth.controller.ts`
```typescript
@Patch('credentials')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
async updateCredentials(@Request() req, @Body() updateCredentialsDto: UpdateCredentialsDto)
```

**Service**: `/apps/backend/src/modules/auth/auth.service.ts`
```typescript
async updateCredentials(userId: string, updateCredentialsDto: UpdateCredentialsDto)
```

**DTO**: `/apps/backend/src/modules/auth/dto/update-credentials.dto.ts`
```typescript
export class UpdateCredentialsDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  newPassword?: string;
}
```

## Validation Rules

### Client-Side (Frontend)

1. **Current Password**:
   - Required for all updates
   - No format validation (checked on backend)

2. **Username**:
   - Optional
   - Must be at least 3 characters if provided
   - Cannot be empty string

3. **New Password**:
   - Optional
   - Must be at least 6 characters if provided
   - Must match confirmation password

4. **Confirmation Password**:
   - Required if new password is provided
   - Must exactly match new password

5. **Form-Level**:
   - At least one field (username or password) must be modified

### Server-Side (Backend)

1. **Current Password**:
   - Required (returns 400 if missing)
   - Must match user's current password (returns 401 if incorrect)

2. **Username**:
   - Optional
   - Must not be empty if provided
   - Must not be already taken by another user (returns 409 if conflict)

3. **New Password**:
   - Optional
   - Must be at least 6 characters if provided
   - Automatically hashed with bcrypt (10 rounds)

4. **Business Rules**:
   - At least one field (username or newPassword) must be provided (returns 400 if neither)
   - User must exist (returns 404 if not found)

## Security Features

1. **JWT Authentication**: All requests require valid JWT token
2. **Current Password Verification**: User must prove identity before changes
3. **Password Hashing**: bcrypt with 10 salt rounds
4. **Token-Based Authorization**: User can only update their own credentials
5. **Input Sanitization**: class-validator DTOs prevent injection attacks
6. **Error Messages**: Generic messages to prevent username enumeration

## User Flow

1. **Navigate to Settings**: Click "Settings" in sidebar navigation
2. **Fill Current Password**: Always required for security
3. **Update Fields**: Choose username, password, or both
4. **Submit Form**: Click "Update Credentials"
5. **View Feedback**: Success message or detailed error
6. **Auto-Clear**: Form clears on success, preserves on error

## Error Handling

### Frontend Error Messages

- "Current password is required"
- "Username must be at least 3 characters"
- "New password must be at least 6 characters"
- "Passwords do not match"
- "Please modify at least one field (username or password)"
- "Failed to update credentials" (generic for API errors)

### Backend Error Responses

```typescript
// 400 Bad Request
{
  statusCode: 400,
  message: "At least one field (username or newPassword) must be provided",
  error: "Bad Request"
}

// 401 Unauthorized
{
  statusCode: 401,
  message: "Current password is incorrect",
  error: "Unauthorized"
}

// 404 Not Found
{
  statusCode: 404,
  message: "User not found",
  error: "Not Found"
}

// 409 Conflict
{
  statusCode: 409,
  message: "Username is already taken",
  error: "Conflict"
}

// 200 Success
{
  id: "user-id",
  username: "updated-username",
  role: "admin"
}
```

## Testing

### Manual Testing

1. **Start development environment**:
   ```bash
   make dev-up-d
   ```

2. **Access backoffice**:
   ```
   http://localhost:3001
   ```

3. **Login with default credentials**:
   - Username: `admin`
   - Password: `k4sla1!`

4. **Navigate to Settings**:
   - Click "Settings" in sidebar
   - Or go to: `http://localhost:3001/settings/credentials`

5. **Test scenarios**:
   - Update username only
   - Update password only
   - Update both fields
   - Try invalid current password
   - Try duplicate username
   - Test validation errors

### Automated Testing

**Run API endpoint tests**:
```bash
./test-credentials-update.sh
```

This script tests:
- Login to get JWT token
- Update username validation
- Update password successfully
- Login with new password
- Restore original password
- Validation error scenarios

## UI Components

The page uses existing backoffice UI components:

- `Button` - Submit and cancel buttons
- `Input` - Text and password input fields
- `Label` - Form field labels

All components are from `/apps/backoffice/app/components/ui/`.

## Accessibility Features

- **Semantic HTML**: Proper form structure with labels
- **ARIA Attributes**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Logical tab order
- **Error Announcements**: Screen reader error feedback
- **Password Toggle**: Show/hide password buttons
- **Visual Feedback**: Clear success/error states

## Navigation Integration

The credentials page is accessible via:

1. **Sidebar Menu**: "Settings" navigation item
2. **Direct URL**: `/settings/credentials`
3. **Protected Route**: Requires authentication (middleware: auth)

**Navigation Configuration**:
```typescript
// /apps/backoffice/app/composables/useNavigation.ts
{
  title: 'Settings',
  path: '/settings/credentials',
  icon: Settings,
  isActive: route.path.startsWith('/settings')
}
```

## Future Enhancements

Potential improvements for future iterations:

1. **Email Verification**: Send confirmation email when email/username changes
2. **Password Strength Meter**: Visual feedback for password strength
3. **Two-Factor Authentication**: Optional 2FA setup
4. **Session Management**: View and revoke active sessions
5. **Password History**: Prevent reusing recent passwords
6. **Account Activity Log**: Track credential changes
7. **Password Reset**: Forgot password flow
8. **Profile Picture**: Upload and manage avatar

## Related Files

### Frontend Files
- `/apps/backoffice/app/pages/settings/credentials.vue` - Main page component
- `/apps/backoffice/app/composables/useAuth.ts` - Authentication composable
- `/apps/backoffice/app/composables/useNavigation.ts` - Navigation config
- `/apps/backoffice/app/types/auth.d.ts` - TypeScript types

### Backend Files
- `/apps/backend/src/modules/auth/auth.controller.ts` - REST controller
- `/apps/backend/src/modules/auth/auth.service.ts` - Business logic
- `/apps/backend/src/modules/auth/dto/update-credentials.dto.ts` - DTO validation
- `/apps/backend/src/entities/user.entity.ts` - User database entity

### Documentation
- `/CREDENTIALS-UPDATE-FEATURE.md` - This file
- `/test-credentials-update.sh` - API testing script
- `/CLAUDE.md` - Project overview and conventions

## Support

For issues or questions:
1. Check backend logs: `make dev-logs-backend`
2. Check backoffice logs: `make dev-logs-backoffice`
3. Run test script: `./test-credentials-update.sh`
4. Review API documentation: `http://localhost:4000/api/docs`
