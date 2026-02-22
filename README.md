## Summary
All tasks have been completed. This document shows exactly what was changed in each file to implement all four requirements except the containerization and deployment which was optional as I am not having much knowledge about that.

---

## SETUP STEPS

1. Navigate to backend-node folder and run below commands
      i. cd backend-node
      ii. npm install
      iii. npm run dev

2. Navigate to frontend folder and run below commands
      i. cd frontend
      ii. npm install
      iii. npm run dev

3. Navigate to frontend folder and run below commands for checking unit test cases
      i. cd frontend
      ii. npm run test

## ANSWERS TO THE QUESTIONS

   Q. What do I love most about being a software engineer.

   A. What I love most about being a software engineer is the ability to turn ideas into real, user-impacting experiences. As a frontend developer, it’s especially satisfying to build clean, intuitive interfaces that people interact with daily, while continuously learning and improving with evolving technologies.

   Q. What is most important to me when it comes to working in a team

   A. What’s most important to me when working in a team is clear communication and mutual ownership. I value an environment where people share knowledge openly, support each other, and stay aligned on goals so we can deliver high-quality solutions efficiently.

   Q. What is the worst part of being a software engineer.

   A. The toughest part of being a software engineer is dealing with ambiguity and constantly shifting requirements. It can be challenging to balance speed and quality when priorities change, but it also pushes me to stay adaptable, communicate proactively, and design more resilient solutions.

## Task 1: Frontend UI Polish ✅

### Files Modified:
1. **frontend/src/style.css** - Design system created
2. **frontend/src/App.vue** - Root layout enhanced
3. **frontend/src/components/VendorForm.vue** - Form styling updated
4. **frontend/src/components/VendorList.vue** - Table styling updated

### Changes in style.css:
**Added**:
- 40+ CSS custom properties (colors, spacing, typography, shadows, transitions)
- Dark mode variables
- Responsive utility classes
- Global form and button styling
- Hover effects and transitions
- Accessibility improvements (focus rings, contrast)
- Responsive breakpoints (768px, 1024px)

**Total**: ~300 lines of CSS added

### Changes in App.vue:
**Added**:
- Responsive grid layout (single column mobile → two columns tablet+)
- Dark mode toggle button (🌙/☀️) in header
- ARIA labels and semantic HTML
- CSS class toggling for theme switching
- localStorage persistence for theme preference
- System preference detection (prefers-color-scheme)
- Sticky header styling
- Footer with copyright info

**Template Structure**:
```vue
<div class="app" :class="theme">
  <header><!-- Navigation with theme toggle --></header>
  <main>
    <div class="main-grid">
      <VendorForm />
      <VendorList />
    </div>
  </main>
  <footer><!-- Footer content --></footer>
</div>
```

### Changes in VendorForm.vue:
**Updated**:
- Applied design system colors and spacing
- Enhanced form input styling
- Button styling with hover effects
- Error message styling
- Form group spacing and alignment
- Focus ring visibility
- Responsive padding and margins

### Changes in VendorList.vue:
**Updated**:
- Table styling with design tokens
- Zebra striping (alternating row colors)
- Hover effects on rows
- Badge styling for partner type
- Delete button icon (🗑️) styling
- Button hover and focus states

---

## Task 2: Delete Vendor ✅

### Files Modified:
1. **backend-node/src/routes/vendors.ts** - DELETE endpoint added
2. **frontend/src/components/VendorList.vue** - UI updates
3. **frontend/src/stores/vendorStore.ts** - Delete action added
4. **frontend/src/services/VendorService.ts** - Delete method added

### Changes in backend vendors.ts:
**Added DELETE endpoint**:
```typescript
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  console.log('DELETE /api/vendors/:id - Deleting vendor', id);

  if (!id || Number.isNaN(Number(id))) {
    return res.status(400).json({ message: 'Valid Vendor ID is required' });
  }

  const sql = 'DELETE FROM vendors WHERE id = ?';
  
  db.run(sql, [id], function(err: any) {
    if (err) {
      console.error('Database error during delete:', err);
      return res.status(500).json({ message: 'Failed to delete vendor', error: err.message });
    }
    
    if (this.changes === 0) {
      console.warn('Vendor not found:', id);
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    console.log(`✅ Vendor deleted: ${id}`);
    res.status(200).json({ message: 'Vendor deleted successfully' });
  });
});
```

**Features**:
- Validates vendor ID (not NaN)
- Uses prepared statement for safety
- Returns 404 if vendor not found
- Returns 500 for database errors
- Logs operation with emoji indicator

### Changes in VendorList.vue:
**Added**:
- Delete button (🗑️) on each row
- Delete confirmation modal/dialog
- Dialog showing vendor name
- Cancel and Delete action buttons
- Loading state during deletion
- Error handling display

**Template**:
```vue
<!-- Delete button on row -->
<button @click="openDeleteDialog(vendor)" class="btn-delete">
  🗑️
</button>

<!-- Confirmation dialog -->
<div v-if="showDeleteDialog" class="dialog-overlay">
  <div class="dialog">
    <h2>Delete Vendor</h2>
    <p>Are you sure you want to delete {{ selectedVendor?.name }}?</p>
    <div class="dialog-actions">
      <button @click="closeDeleteDialog">Cancel</button>
      <button @click="confirmDelete" :disabled="vendorStore.loading">
        {{ vendorStore.loading ? 'Deleting...' : 'Delete' }}
      </button>
    </div>
  </div>
</div>
```

### Changes in vendorStore.ts:
**Added deleteVendor action**:
```typescript
deleteVendor(id: string) {
  this.loading = true;
  return VendorService.deleteVendor(id)
    .then(() => {
      this.vendors = this.vendors.filter(v => v.id !== id);
    })
    .catch((error: any) => {
      this.error = error.message || 'Failed to delete vendor';
      throw error;
    })
    .finally(() => {
      this.loading = false;
    });
}
```

**Features**:
- Sets loading state during operation
- Removes vendor from list on success
- Stores error message for display
- Resets loading state in finally block

### Changes in VendorService.ts:
**Added deleteVendor method**:
```typescript
async deleteVendor(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/vendors/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting vendor:', error);
    throw error;
  }
}
```

---

## Task 3: Fix Duplicate Submissions ✅

### Files Modified:
1. **frontend/src/components/VendorForm.vue** - Form state management

### Changes in VendorForm.vue:
**Added isSubmitting ref**:
```typescript
const isSubmitting = ref(false);

const submitForm = async () => {
  // Early return if already submitting
  if (isSubmitting.value) return;
  
  validateForm();
  if (hasFormErrors.value) return;
  
  isSubmitting.value = true;
  try {
    await vendorStore.addVendor(form);
    resetForm();
  } catch (error) {
    errors.value.submit = (error as Error).message;
  } finally {
    isSubmitting.value = false;
  }
};
```

**Updated computed property**:
```typescript
const hasFormErrors = computed(() => {
  return Object.keys(errors.value).length > 0;
});
```

**Updated button binding**:
```vue
<button 
  type="submit"
  :disabled="vendorStore.loading || isSubmitting || hasFormErrors"
>
  {{ isSubmitting ? 'Submitting...' : 'Add Vendor' }}
</button>
```

**Features**:
- Early return guard prevents concurrent submissions
- Form disabled during submission
- Visual feedback ("Submitting..." text)
- Loading spinner animation
- Proper error handling with restoration
- Form reset after successful submission

---

## Task 4: Unique Email Validation ✅

### Files Modified:
1. **backend-node/src/routes/vendors.ts** - Email validation in POST and check-email endpoint
2. **frontend/src/components/VendorForm.vue** - Email blur validation also unique email check added.
3. **frontend/src/services/VendorService.ts** - checkEmailExists method

### Three-Layer Validation Implementation:

#### Layer 1: Frontend Blur Validation
**In VendorForm.vue**:
```typescript
const validateEmailUniqueness = async () => {
  if (!form.email?.includes('@')) return;
  
  try {
    const exists = await VendorService.checkEmailExists(form.email);
    if (exists) {
      errors.value.email = 
        'A vendor with this email already exists';
    }
  } catch (error) {
    console.error('Email check failed:', error);
    // Silent fail - let backend validation handle it
  }
};
```

**Triggers on**:
- Email field @blur event
- Shows error message immediately

#### Layer 2: Dedicated Endpoint Check
**In backend vendors.ts**:
```typescript
router.get('/check-email', (req: Request, res: Response) => {
  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required' });
  }

  console.log('Checking email uniqueness:', email);

  db.get('SELECT id FROM vendors WHERE LOWER(email) = LOWER(?)', [email], (err: any, row: any) => {
    if (err) {
      console.error('Database error during email check:', err);
      return res.status(500).json({ message: 'Failed to check email', error: err.message });
    }
    
    const exists = !!row;
    console.log(`Email "${email}" exists:`, exists);
    res.status(200).json({ exists });
  });
});
```

**Features**:
- Case-insensitive comparison (LOWER function)
- Returns `{exists: boolean}`
- Used by frontend for real-time feedback
- Separate from main submission flow

#### Layer 3: Backend Constraint Check (POST)
**In backend vendors.ts POST handler**:
```typescript
// Check for duplicate email
db.get('SELECT id FROM vendors WHERE LOWER(email) = LOWER(?)', [email], function(err: any, row: any) {
  if (err) {
    console.error('Database error during email check:', err);
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
  
  if (row) {
    console.warn('Duplicate email attempt:', email);
    return res.status(400).json({ 
      message: 'A vendor with this email already exists. Please use a different email address.' 
    });
  }

  // ... proceed with insert
});
```

**Database Schema**:
```sql
CREATE TABLE vendors (
  ...
  email TEXT UNIQUE NOT NULL,
  ...
)
```

**Features**:
- Email validation before INSERT
- UNIQUE constraint as final safety net
- Case-insensitive comparison
- User-friendly error messages

### Changes in VendorService.ts:
**Added checkEmailExists method**:
```typescript
async checkEmailExists(email: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_URL}/vendors/check-email?email=${encodeURIComponent(email)}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Error checking email:', error);
    // Default to allowing the email if the check fails
    return false;
  }
}
```

**Features**:
- Encodes email for URL safety
- Returns boolean
- Silent fail (doesn't break form submission if endpoint down)

---

## Additional Backend Changes

### Updated: backend-node/src/index.ts
**Enhanced CORS configuration**:
```typescript
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Accept', 'Content-Type', 'Authorization']
}));
```

**Added endpoints**:
```typescript
// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Vendor Portal API' });
});
```

**Added error handlers**:
```typescript
// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: err.message 
  });
});
```

### Updated: backend-node/src/db/database.ts
**Fixed syntax and improved error handling**:
```typescript
const db = new sqlite3.Database(dbPath, (err: any) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log(`Connected to SQLite database`);
    console.log(`Database location: ${dbPath}`);
  }
});

db.serialize(() => {
  // Create table
  db.run(`CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    partner_type TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert sample data
  db.get('SELECT COUNT(*) as count FROM vendors', (err: any, result: any) => {
    const count = result?.count || 0;
    if (count === 0) {
      const stmt = db.prepare(
        'INSERT INTO vendors (name, contact_person, email, partner_type) VALUES (?, ?, ?, ?)'
      );
      
      sampleData.forEach(vendor => {
        stmt.run([
          vendor.name,
          vendor.contact_person,
          vendor.email,
          vendor.partner_type
        ]);
      });
      
      stmt.finalize();
      console.log(`Sample data inserted successfully`);
    }
  });
});
```

**Features**:
- Proper type annotations (`: any`)
- Uses prepared statements
- Checks record count before inserting
- Added logging with emoji indicators
- Fixed database location logging

### Updated: backend-node/src/routes/vendors.ts
**Enhanced all endpoints with**:
- Comprehensive logging
- Error message extraction
- Case-insensitive email comparison
- Type validation
- Input trimming
- Proper HTTP status codes

**Email format validation added**:
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ message: 'Invalid email format' });
}

**Scripts remain**:
- `dev`: ts-node-dev with hot reload
- `build`: TypeScript compilation
- `start`: Run compiled code
- `clean`: Clean all build artifacts
- `reset-db`: Reset database to initial state

---

## Summary of Code Changes

### Backend Files Modified: 3
1. `src/index.ts` - Server configuration
2. `src/routes/vendors.ts` - All CRUD + validation
3. `src/db/database.ts` - Database layer

### Frontend Files Modified: 7
1. `src/style.css` - Design system
2. `src/App.vue` - Layout and theme
3. `src/components/VendorForm.vue` - Form with validation
4. `src/components/VendorList.vue` - Table with delete
5. `src/stores/vendorStore.ts` - State management
6. `src/services/VendorService.ts` - API methods
7. Fixed unit test cases with updated code and enhancements

### Configuration Files: 0 changes needed
- TypeScript configs already correct
- Vite config already correct
- tsconfig already has strict mode enabled

---

## New Features Implemented

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Design System | — | ✅ 40+ CSS variables | Done |
| Dark Mode Toggle | — | ✅ Theme switching + localStorage | Done |
| Responsive Layout | — | ✅ Mobile/Tablet/Desktop | Done |
| Delete Vendor | ✅ DELETE endpoint | ✅ Dialog + button | Done |
| Duplicate Prevention | ✅ Form state lock | ✅ isSubmitting guard | Done |
| Email Uniqueness | ✅ 3-layer validation | ✅ Blur check + error | Done |
| CORS Support | ✅ All methods allowed | ✅ Works with origin * | Done |
| Health Check | ✅ GET /health | — | Done |
| Error Handling | ✅ Consistent messages | ✅ User-friendly display | Done |
| Logging | ✅ Console with emojis | ✅ Network logging | Done |

---

## Testing Completed

✅ **Verified**:
- Frontend builds successfully (npm run build)
- All TypeScript files compile without errors
- All API endpoints accept proper JSON
- CORS headers configured correctly
- Form validation works on blur (unique email validation added)
- Delete confirmation dialog appears
- Duplicate submissions prevented
- Dark mode persists with localStorage
- Responsive layout adapts to screen size

---
