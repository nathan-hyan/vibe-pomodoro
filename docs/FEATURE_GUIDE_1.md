# 🍅 Vibe Pomodoro - Development Plan

> **Created:** December 3, 2025  
> **Status:** Planning Phase  
> **Priority:** High Impact Features + Technical Debt Resolution

## 📋 Overview

This document outlines the comprehensive development plan for Vibe Pomodoro, including both new feature requests and existing technical debt (TODOs) that need to be addressed.

## 🎯 New Feature Requests (User Priority)

### **High Priority Features**

#### 1. **Fix Focus Tasks Drag & Drop on Desktop** 🔧

- **Status:** Broken
- **Impact:** High - Core functionality not working
- **Files:** [src/components/TodoList.tsx](cci:7://file:///Users/exequielmleziva/Development/1-current/vibe-pomodoro/src/components/TodoList.tsx:0:0-0:0), [src/hooks/useTodos.ts](cci:7://file:///Users/exequielmleziva/Development/1-current/vibe-pomodoro/src/Users/exequielmleziva/Development/1-current/vibe-pomodoro/src/hooks/useTodos.ts:0:0-0:0)
- **Description:** Drag and drop functionality is completely broken on desktop
- **Technical Notes:** Current implementation has basic handlers but lacks proper desktop event handling

#### 2. **Breathe In/Out Modal Before Timer** 🧘

- **Status:** New Feature
- **Impact:** High - User experience enhancement
- **Files:** `src/components/BreathingModal.tsx` (new), [src/hooks/usePomodoro.ts](cci:7://file:///Users/exequielmleziva/Development/1-current/vibe-pomodoro/src/hooks/usePomodoro.ts:0:0-0:0), [src/components/Controls.tsx](cci:7://file:///Users/exequielmleziva/Development/1-current/vibe-pomodoro/src/components/Controls.tsx:0:0-0:0)
- **Description:** Add a breathing exercise modal that appears before starting each pomodoro session
- **Requirements:**
  - Animated breathing guide (inhale/exhale)
  - Skip option for experienced users
  - Mobile-responsive design

#### 3. **"Currently Working On" Todo Section** ⭐

- **Status:** New Feature
- **Impact:** High - Productivity enhancement
- **Files:** [src/types/index.ts](cci:7://file:///Users/exequielmleziva/Development/1-current/vibe-pomodoro/src/Users/exequielmleziva/Development/1-current/vibe-pomodoro/src/types/index.ts:0:0-0:0), [src/components/TodoList.tsx](cci:7://file:///Users/exequielmleziva/Development/1-current/vibe-pomodoro/src/components/TodoList.tsx:0:0-0:0), [src/hooks/useTodos.ts](cci:7://file:///Users/exequielmleziva/Development/1-current/vibe-pomodoro/src/Users/exequielmleziva/Development/1-current/vibe-pomodoro/src/hooks/useTodos.ts:0:0-0:0)
- **Description:** Add a dedicated section at the top for the current active task
- **Requirements:**
  - Always visible at top of todo list
  - Drag-to-promote functionality
  - Only one task can be "currently working on"
  - Persist across sessions

### **Medium Priority Features**

#### 4. **Disable Add Button When Input Empty** 🚫

- **Status:** UX Improvement
- **Impact:** Medium - Prevents user errors
- **Files:** [src/components/TodoList.tsx](cci:7://file:///Users/exequielmleziva/Development/1-current/vibe-pomodoro/src/components/TodoList.tsx:0:0-0:0)
- **Description:** Add button should be disabled when "What are you working on?" input is empty
- **Implementation:** Simple conditional disable based on `inputValue.trim().length === 0`

#### 5. **Fix Mobile Scrolling in Focus Tasks** 📱

- **Status:** Bug Fix
- **Impact:** Medium - Mobile usability
- **Files:** [src/components/TodoList.tsx](cci:7://file:///Users/exequielmleziva/Development/1-current/vibe-pomodoro/src/components/TodoList.tsx:0:0-0:0)
- **Description:** Todo list is not scrollable on mobile devices
- **Current Issue:** Uses `overflow-y-visible max-h-48` which prevents proper scrolling
- **Solution:** Implement proper mobile-responsive scrolling with touch-friendly interactions

## 🔧 Existing Technical Debt (TODOs)

### **App.tsx TODOs**

- **Line 26:** Consider extracting glow effect logic to custom hook or container component
- **Line 47:** Move TodoProvider to root level (main.tsx)
- **Line 48:** Nice to have i18n support
- **Line 49:** Create reusable button components
- **Line 50:** Create reusable modal component for CompletionModal and SettingsModal
- **Line 134:** Move providers to main.tsx

### **Component TODOs**

**TodoList.tsx:**

- **Line 50:** Replace deprecated `onKeyPress` with `onKeyDown`

**Timer.tsx:**

- **Line 15:** Move `formatTime` function to utils.ts
- **Line 165:** Replace deprecated `onKeyPress` with `onKeyDown`
- **Line 176:** Use classNames utility for conditional classes

**Statistics.tsx:**

- **Line 5:** Research if forwardRef is still needed in modern React
- **Line 73:** Evaluate if displayName is necessary

### **Hook & Context TODOs**

**usePomodoro.ts:**

- **Line 23:** Extract timer logic to separate utility function
- **Line 50:** Create reusable modal hook with show/toggle methods

**useStats.ts:**

- **Line 4:** Consider renaming from `useStats` to `useStatistics` for readability

**TodoContext.tsx:**

- **Line 16:** Implement proper UUID generation instead of Date.now().toString()
- **Line 17:** Implement proper text capitalization
- **Line 18:** Add Zod validation for backend items and frontend forms

## 📅 Implementation Roadmap

### **Phase 1: Quick Wins (Week 1)**

1. ✅ **Disable Add Button When Empty** - 30 minutes
2. ✅ **Fix Mobile Scrolling** - 1 hour
3. ✅ **Replace Deprecated onKeyPress** - 30 minutes
4. ✅ **Move formatTime to utils** - 15 minutes

### **Phase 2: Core Features (Week 2)**

1. 🔄 **Fix Desktop Drag & Drop** - 4-6 hours
   - Debug current implementation
   - Add proper event handling
   - Test across different browsers
2. 🔄 **Implement Breathing Modal** - 6-8 hours
   - Create component with animations
   - Integrate with timer start flow
   - Add user preferences for skipping

### **Phase 3: Advanced Features (Week 3)**

1. 🔄 **"Currently Working On" Section** - 8-10 hours
   - Extend data model
   - Update UI components
   - Implement drag-to-promote
   - Add persistence

### **Phase 4: Architecture & Quality (Week 4)**

1. 🔄 **Provider Reorganization** - 2-3 hours
2. 🔄 **Reusable Components** - 4-6 hours
   - Modal component
   - Button components
3. 🔄 **Validation & UUID** - 2-3 hours
4. 🔄 **Custom Hooks Extraction** - 3-4 hours

## 🛠️ Technical Considerations

### **Dependencies**

- **Current Stack:** React 19.2.0, TailwindCSS 4.1.17, TanStack Query 5.62.7
- **New Dependencies Needed:**
  - `uuid` for proper ID generation
  - `zod` for validation
  - `clsx` or `classnames` for conditional styling

### **Browser Compatibility**

- Ensure drag & drop works across Chrome, Firefox, Safari
- Test touch interactions on mobile devices
- Verify breathing modal animations perform well

### **Performance Considerations**

- Lazy load breathing modal component
- Optimize drag & drop event handlers
- Consider virtualization for large todo lists

## 🧪 Testing Strategy

### **Manual Testing Checklist**

- [ ] Drag & drop on desktop (Chrome, Firefox, Safari)
- [ ] Touch interactions on mobile
- [ ] Breathing modal animations
- [ ] Todo list scrolling on various screen sizes
- [ ] Add button disable/enable states
- [ ] "Currently working on" functionality

## 📊 Success Metrics

### **Functional Metrics**

- ✅ Drag & drop works smoothly on desktop
- ✅ Mobile scrolling is fluid and responsive
- ✅ Breathing modal enhances user experience
- ✅ "Currently working on" increases task focus
- ✅ No console errors or warnings

### **Code Quality Metrics**

- ✅ All TODOs resolved or documented
- ✅ No deprecated API usage
- ✅ Consistent code patterns
- ✅ Proper TypeScript typing
- ✅ Reusable components extracted

## 🚀 Next Steps

1. **Immediate:** Start with Phase 1 quick wins
2. **This Week:** Focus on core functionality fixes
3. **Next Week:** Implement new features
4. **Following Week:** Address technical debt

---

**Last Updated:** December 3, 2025  
**Estimated Total Effort:** 25-35 hours  
**Target Completion:** End of December 2025
