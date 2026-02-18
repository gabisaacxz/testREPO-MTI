-- prisma/seed.sql

-- 1. Create Head Office Site (Required for Issue #3 and #6)
INSERT INTO "sites" ("id", "siteIdCode", "siteName", "locationAddress", "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(), 
  'MTI-HQ', 
  'Main Head Office', 
  'Las Piñas, Metro Manila', 
  true, 
  NOW(), 
  NOW()
)
ON CONFLICT ("siteIdCode") DO NOTHING;

-- 2. Create Core Users (Required for Authentication #5 and Employee Lists #7)
INSERT INTO "users" (
  "id", "email", "passwordHash", "firstName", "lastName", 
  "category", "department", "position", "role", "status", 
  "createdAt", "updatedAt"
)
VALUES 
  -- Michael (Admin for Milestone 2 HR tasks #7, #9)
  (gen_random_uuid(), 'cto@martindaletech.com', 'dummy_hash', 'Michael', 'Technical', 'HEAD_OFFICE', 'Operations', 'Chief Technical Officer', 'ADMIN', 'ACTIVE', NOW(), NOW()),
  
  -- Sarah (User for Milestone 1 Attendance Log #3)
  (gen_random_uuid(), 'bdm@martindaletech.com', 'dummy_hash', 'Sarah', 'Sales', 'HEAD_OFFICE', 'Sales and SAQ', 'Business Development Manager', 'USER', 'ACTIVE', NOW(), NOW()),
  
  -- Juan (Site Manager for Milestone 1 Team Submission #6)
  (gen_random_uuid(), 'tl1@martindaletech.com', 'dummy_hash', 'Juan', 'Dela Cruz', 'FIELD', 'Telecom Enterprise', 'Team Leader', 'USER', 'ACTIVE', NOW(), NOW())

ON CONFLICT ("email") DO NOTHING;