# Taskly Project Cleanup Plan

## 🗑️ Files Safe to Delete

### SQL Debug Files (70+ files)
These are development/debugging files that are no longer needed:

#### Debug Files
- `debug_auth_uid.sql`
- `debug_board_creation.sql`
- `debug_boards.js`
- `debug_realtime.sql`
- `debug_user_profiles.sql`
- `check_new_board.sql`
- `check_realtime_status.sql`
- `check_table_structure.sql`
- `check_users.sql`
- `check_user_and_fix.sql`

#### Fix Files
- `fix_admin_profile.sql`
- `fix_board_creation.sql`
- `fix_board_members.sql`
- `fix_board_owner.sql`
- `fix_both_issues.sql`
- `fix_card_activities_complete.sql`
- `fix_card_activities_rls.sql`
- `fix_card_positions.sql`
- `fix_comment_and_tag_policies.sql`
- `fix_data_isolation.sql`
- `fix_existing_boards.sql`
- `fix_invitation_policies.sql`
- `fix_list_movement.sql`
- `fix_missing_emails.sql`
- `fix_null_created_by.sql`
- `fix_policies.sql`
- `fix_public_boards_policy.sql`
- `fix_tag_policies.sql`
- `fix_trigger_recursion.sql`
- `fix_user_mismatch.sql`
- `fix_user_profiles.sql`

#### Working/Temporary Files
- `working_board_fix.sql`
- `working_fix.sql`
- `working_isolation_fix.sql`
- `temporary_permissive_fix.sql`
- `simple_board_fix.sql`
- `simple_fix.sql`
- `simple_isolation_fix.sql`
- `simple_permissive_fix.sql`
- `simple_policies.sql`
- `simple_working_fix.sql`
- `simple_working_policies.sql`
- `alternative_fix.sql`
- `emergency_fix.sql`
- `emergency_simple_policies.sql`
- `permissive_fix.sql`
- `proper_fix.sql`
- `quick_fix.sql`

#### Setup/Profile Files
- `add_checklist_column.sql`
- `add_completed_field.sql`
- `add_email_to_user_profiles.sql`
- `add_missing_user_profile.sql`
- `add_starred_field.sql`
- `add_user_email_column.sql`
- `add_user_email_to_assignees.sql`
- `auto_create_user_profile.sql`
- `auto_owner_trigger.sql`
- `create_user_email_function.sql`
- `create_user_profile_function.sql`
- `create_user_profiles.sql`
- `get_real_user_emails.sql`
- `run_all_fixes.sql`
- `run_fixed_trigger.sql`
- `run_fixes.sql`
- `run_fix_user_profiles.sql`
- `run_profile_setup.sql`
- `run_trigger.sql`
- `safe_invitation_fix.sql`
- `safe_user_profiles_diagnostic.sql`
- `safe_user_profiles_fix.sql`
- `setup_real_user_profiles.sql`
- `setup_user_profiles.sql`

#### Duplicate Schema Files
- `missing_tables.sql`
- `missing_tables_final.sql`
- `missing_tables_safe.sql`
- `missing_tables_simple.sql`

#### Policy Files
- `app_level_isolation.sql`
- `clean_final_policies.sql`
- `comprehensive_rls_fix.sql`
- `final_board_policies.sql`
- `final_fix.sql`
- `final_working_policy.sql`
- `final_working_solution.sql`
- `implement_private_system.sql`
- `implement_private_system_fixed.sql`
- `remove_public_private.sql`

#### Test Files
- `test_after_reset.sql`
- `test_app_creation.sql`
- `test_app_creation_final.sql`
- `test_app_creation_simple.sql`
- `test_board_creation.sql`
- `test_data_isolation.sql`
- `test_rls.sql`
- `verify_clean_start.sql`

#### Realtime Files
- `enable_realtime.sql`
- `enable_realtime_now.sql`
- `enable_realtime_safe.sql`

#### Documentation Files (Development Notes)
- `UI_IMPROVEMENTS.md`
- `UI_IMPROVEMENTS_SUMMARY.md`
- `USER_FLOW_DIAGRAM.md`
- `IMPLEMENTATION_GUIDE.md`

### Unused Components
- `src/components/CardDetailModalImproved.tsx` (unused)

## ✅ Files to Keep

### Essential Files
- `tables.sql` - Main database schema
- `README.md` - Project documentation
- `package.json` - Dependencies
- `tsconfig.*.json` - TypeScript config
- `vite.config.ts` - Build config
- `tailwind.config.js` - Styling config
- `components.json` - shadcn config
- `.gitignore` - Git ignore rules
- `CODERABBIT_ANALYSIS.md` - Analysis request

### Application Files
- All files in `src/` (except unused components)
- `src/components/RealtimeTest.tsx` - Used in Board.tsx
- `src/components/PermissionTest.tsx` - Used in Board.tsx

## 📊 Impact Analysis

### Before Cleanup
- **Total Files**: ~120 files
- **SQL Files**: ~80 files (mostly debug)
- **Project Size**: Large due to debug files

### After Cleanup
- **Total Files**: ~50 files
- **SQL Files**: 1 main schema file
- **Project Size**: Significantly reduced
- **Maintainability**: Much improved

## 🚀 Benefits of Cleanup

1. **Reduced Repository Size**: Remove ~70 unnecessary files
2. **Improved Maintainability**: Clear project structure
3. **Better Documentation**: Keep only essential docs
4. **Faster Cloning**: Smaller repository
5. **Cleaner History**: Remove development artifacts

## ⚠️ Safety Measures

1. **Keep `tables.sql`**: Main database schema
2. **Keep all `src/` files**: Application code
3. **Keep config files**: Build and development configs
4. **Keep documentation**: README and essential docs
5. **Test after cleanup**: Ensure functionality remains

## 🎯 Next Steps

1. Create backup branch
2. Delete identified files
3. Test application functionality
4. Commit cleanup changes
5. Update documentation if needed 