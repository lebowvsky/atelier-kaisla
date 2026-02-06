# Quick Start: Credentials Update

## For Users

### How to Update Your Credentials

1. **Login to backoffice**:
   ```
   http://localhost:3001 (development)
   https://bokaisla.lebowvsky.com (production)
   ```

2. **Navigate to Settings**:
   - Click "Settings" in the sidebar menu
   - Or go directly to: `/settings/credentials`

3. **Fill the form**:
   - **Current Password** (required): Your current password for verification
   - **Username** (optional): New username if you want to change it
   - **New Password** (optional): New password if you want to change it
   - **Confirm Password** (required if changing password): Must match new password

4. **Submit**:
   - Click "Update Credentials"
   - Wait for success message
   - Form will clear automatically on success

### Requirements

- At least one field (username or password) must be modified
- Current password is always required
- Username must be at least 3 characters
- New password must be at least 6 characters
- Passwords must match

## For Developers

### Quick Test

**Test the API endpoint**:
```bash
./test-credentials-update.sh
```

**Manual API test**:
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"k4sla1!"}' \
  | jq -r '.access_token')

# 2. Update password
curl -X PATCH http://localhost:4000/api/auth/credentials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "currentPassword": "k4sla1!",
    "newPassword": "newPassword123"
  }' | jq '.'
```

### File Locations

**Frontend**:
- Page: `/apps/backoffice/app/pages/settings/credentials.vue`
- Navigation: `/apps/backoffice/app/composables/useNavigation.ts`
- Auth: `/apps/backoffice/app/composables/useAuth.ts`

**Backend**:
- Controller: `/apps/backend/src/modules/auth/auth.controller.ts`
- Service: `/apps/backend/src/modules/auth/auth.service.ts`
- DTO: `/apps/backend/src/modules/auth/dto/update-credentials.dto.ts`

### API Endpoint

```http
PATCH /api/auth/credentials
Authorization: Bearer <JWT_TOKEN>

{
  "currentPassword": "string",   // Required
  "username": "string",          // Optional
  "newPassword": "string"        // Optional
}
```

**Response** (200 OK):
```json
{
  "id": "user-id",
  "username": "updated-username",
  "role": "admin",
  "createdAt": "2026-02-06T15:30:20.277Z",
  "updatedAt": "2026-02-06T20:56:37.042Z"
}
```

### Common Errors

| Status | Error | Solution |
|--------|-------|----------|
| 400 | No fields to update | Provide at least username or newPassword |
| 400 | Missing current password | Add currentPassword field |
| 401 | Wrong current password | Verify current password is correct |
| 409 | Username already taken | Choose different username |
| 401 | Unauthorized | Check JWT token is valid |

### Design Patterns Used

- **Chain of Responsibility**: Validation pipeline
- **Command Pattern**: Form submission encapsulation
- **Adapter Pattern**: API response transformation
- **Facade Pattern**: `useAuth()` composable
- **Singleton Pattern**: Global navigation state

### Environment Variables

**Development**:
```bash
# .env.dev
NUXT_PUBLIC_API_URL=http://backend:4000/api  # Server-side
# Client-side automatically uses http://localhost:4000/api
```

**Production**:
```bash
# .env.prod
NUXT_PUBLIC_API_URL=https://api.lebowvsky.com
```

### Development

**Start development**:
```bash
make dev-up-d
```

**View logs**:
```bash
make dev-logs-backoffice   # Frontend logs
make dev-logs-backend      # Backend logs
```

**Access URLs**:
- Backoffice: `http://localhost:3001`
- API: `http://localhost:4000/api`
- API Docs: `http://localhost:4000/api/docs`

### Troubleshooting

**Backend not responding**:
```bash
make dev-logs-backend
```

**Frontend not loading**:
```bash
make dev-logs-backoffice
```

**Database issues**:
```bash
make db-shell
SELECT * FROM users;
```

**Reset environment**:
```bash
make dev-down
make clean-dev
make init
```

## Documentation

- **Full Feature Docs**: `/CREDENTIALS-UPDATE-FEATURE.md`
- **Implementation Summary**: `/CREDENTIALS-IMPLEMENTATION-SUMMARY.md`
- **Project Overview**: `/CLAUDE.md`

## Testing

**Run all tests**:
```bash
./test-credentials-update.sh
```

**Expected output**:
```
✓ Login successful
✓ Login with new password successful
✓ Original password verified
✓ All tests completed!
```

## Support

**Check these first**:
1. Backend running: `docker compose -f docker-compose.dev.yml ps`
2. Logs: `make dev-logs`
3. Test script: `./test-credentials-update.sh`
4. API docs: `http://localhost:4000/api/docs`

**Still stuck?**
- Review `/CREDENTIALS-UPDATE-FEATURE.md` for detailed documentation
- Check `/CREDENTIALS-IMPLEMENTATION-SUMMARY.md` for architecture details

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
