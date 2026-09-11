# ShopNest User / Customer / Admin Refactor Skill

## Objective

Refactor ShopNest ASP.NET Core 8 E-Commerce API from the current model where `Customers` contains a `Role` (`Admin` / `Customer`) into a proper **table-per-type (TPT) inheritance / relational subtyping** model:

```text
                         Users
                           |
              +------------+------------+
              |                         |
          Customers                   Admins
```

Target domain model:

```text
User (abstract)
 ├── Customer
 └── Admin
```

- `Users` contains common authentication/account data.
- `Customers` contains customer-specific business data.
- `Admins` contains admin-specific data.
- There must be **NO `Role` column in `Customers`**.
- There must be **NO discriminator column** because the database must use TPT, not TPH.
- `Customers.Id` and `Admins.Id` are both PK/FK to `Users.Id`.

---

# 1. NON-NEGOTIABLE RULES

Before changing code:

1. Inspect the complete existing backend.
2. Inspect entities, relationships, DTOs, repositories, services, controllers, EF Core configuration, migrations, authentication, JWT, authorization, and frontend dependencies.
3. Search the entire codebase for:
   - `Customer.Role`
   - `customer.Role`
   - `.Role`
   - `IsAdmin`
   - `CustomerId`
   - JWT role claims
   - JWT customer claims
   - authentication fields currently stored in `Customer`
4. Do not guess existing implementations.
5. Do not rewrite unrelated code.
6. Preserve the existing layered architecture.
7. Preserve existing data.
8. Preserve existing `Customer.Id` values whenever practical.
9. Do not break historical orders or customer-related records.
10. Do not remove authorization.
11. Do not trust frontend role/customer information for security.
12. Do not expose passwords or password hashes.
13. Do not create duplicate authentication systems.
14. Do not introduce a second JWT/token architecture.
15. Do not delete `Customer.Role` until the replacement model is working.
16. Do not generate a destructive migration without explicitly identifying the risk.

---

# 2. TARGET DOMAIN MODEL

Use inheritance:

```csharp
public abstract class User
{
    public int Id { get; set; }

    // Existing authentication/account properties
}
```

```csharp
public class Customer : User
{
    // Customer-specific properties
}
```

```csharp
public class Admin : User
{
    // Admin-specific properties
}
```

Do not blindly copy properties.

Inspect the current `Customer` entity and classify every property into:

- Common User/account property
- Customer-specific property
- Obsolete property
- Admin-specific property

Move only appropriate common properties to `User`.

---

# 3. TABLE-PER-TYPE / TPT REQUIREMENT

The database MUST use TPT inheritance.

Target schema:

```text
Users
--------------------------------
Id PK
Email
PasswordHash
IsEmailVerified
...
```

```text
Customers
--------------------------------
Id PK, FK -> Users.Id
Customer-specific columns
...
```

```text
Admins
--------------------------------
Id PK, FK -> Users.Id
Admin-specific columns
...
```

The subtype table primary key is also the foreign key to the base table.

Conceptually:

```text
Users.Id
   |
   +------ Customers.Id
   |
   +------ Admins.Id
```

Do NOT implement this as separate `UserId` foreign keys if the goal is TPT.

Do NOT use TPH.

Do NOT create a discriminator column.

Final database must NOT contain:

```text
Users.Discriminator
Customers.Role
```

---

# 4. EF CORE TPT CONFIGURATION

Use EF Core TPT mapping.

Prefer:

```csharp
modelBuilder.Entity<User>()
    .UseTptMappingStrategy();

modelBuilder.Entity<Customer>()
    .ToTable("Customers");

modelBuilder.Entity<Admin>()
    .ToTable("Admins");
```

Adapt this to the project's actual EF Core version and configuration style.

Verify the generated schema has:

```text
Users
Customers
Admins
```

with:

```text
Customers.Id -> Users.Id
Admins.Id -> Users.Id
```

---

# 5. USER ENTITY

Create the base `User` entity using the project's existing authentication model.

Possible common fields include:

- Id
- Email
- PasswordHash
- Email verification state
- Account status
- CreatedAt
- UpdatedAt
- Existing account-level properties

Do not invent fields unnecessarily.

Move authentication/account fields from the current Customer entity into User.

`User` becomes the central authentication identity.

---

# 6. CUSTOMER ENTITY

Customer inherits from User:

```csharp
public class Customer : User
{
    // Existing customer-specific properties
}
```

Preserve customer relationships:

- Orders
- CustomerAddresses
- Cart
- Wishlist
- Reviews
- CouponUsage
- Any other customer-owned domain data

Do NOT change every `CustomerId` to `UserId`.

Customer business data belongs to Customer.

---

# 7. ADMIN ENTITY

Create:

```csharp
public class Admin : User
{
    // Only admin-specific properties
}
```

If no admin-specific fields currently exist, keep it minimal.

Do not add a redundant `Role = Admin` property.

Do not add `Customer.Role`.

The subtype represents the domain type.

---

# 8. ROLE / AUTHORIZATION

Removing `Customer.Role` MUST NOT remove authorization.

Inspect the existing:

- JWT Authentication
- Role-Based Authorization
- Policy-Based Authorization
- Ownership-Based Authorization
- Authorization Handlers

Refactor them to work with the User hierarchy.

Authorization must remain backend-enforced.

Do not rely on:

- frontend role
- localStorage role
- React state
- hidden admin links

for security.

---

# 9. JWT / TOKEN SYSTEM

Refactor JWT/token generation so the authenticated identity is based on:

```text
User.Id
```

Prefer:

```csharp
ClaimTypes.NameIdentifier
```

unless the existing architecture has a justified alternative.

Inspect current claims before changing them.

Do not leave stale assumptions such as:

```text
Customer.Role
Customer.Id as authentication identity
```

If CustomerId is included as a convenience claim, it must be derived from the authenticated User and never trusted from client input.

Document the final JWT claim structure.

---

# 10. REGISTRATION

Refactor registration to create a Customer subtype.

Conceptually:

```text
Register
   |
Create Customer
   |
Customer inherits User
   |
EF creates:
   Users row
   Customers row
   |
OTP / Email Verification
```

Preserve:

- OTP verification
- email verification
- password hashing
- validation
- existing registration behavior

Use a transaction if appropriate.

Do not leave partially-created authentication accounts.

---

# 11. LOGIN

Login should authenticate through User.

Conceptually:

```text
Email
Password
   |
Find User
   |
Verify password
   |
Check verification/account state
   |
Generate JWT
```

Do not depend on `Customer.Role`.

If the application needs to determine whether the account is a Customer or Admin, use the subtype/domain/authorization model.

---

# 12. ADMIN CREATION

Do NOT allow normal customers to promote themselves.

Do not expose an unsafe public:

```text
POST /admins
```

unless protected by an appropriate privileged policy.

Inspect existing admin seed/bootstrap logic and preserve it.

Admin creation must be securely restricted.

---

# 13. AUTHORIZATION POLICIES / OWNERSHIP

Refactor existing policies and handlers.

Admin access:

```text
Authenticated User
       |
Admin subtype / authorized admin identity
       |
Admin endpoint
```

Customer ownership:

```text
JWT User.Id
       |
Customer identity
       |
Customer-owned resource
```

For Orders:

```text
User
 |
Customer
 |
Order.CustomerId
```

Do not authorize using a CustomerId supplied by the frontend.

---

# 14. ORDERS

Keep:

```csharp
Order.CustomerId
```

because Orders are customer-owned business records.

Do NOT replace it with UserId merely because User is now the authentication base class.

Preserve:

- OrderItems
- Payment
- Shipment
- CouponUsage
- ShippingAddress snapshot
- OrderStatus
- existing relationships

Historical orders must remain valid.

---

# 15. CUSTOMER ADDRESSES

Keep addresses associated with Customer:

```text
Customer
   |
CustomerAddresses
```

Do not move them to User unless the existing domain explicitly requires it.

Preserve the existing immutable Order shipping-address snapshot architecture.

---

# 16. OTHER CUSTOMER RELATIONSHIPS

Audit all entities referencing Customer, including:

- CustomerAddress
- Cart
- Wishlist
- Review
- CouponUsage
- Order
- Any other customer-owned entity

Do not blindly replace CustomerId with UserId.

Ask:

> Is this authentication/account data or customer business data?

Customer business data should continue referencing Customer.

---

# 17. PAYMENT / SHIPMENT / COUPONS

Do not break:

```text
Order
 ├── Payment
 ├── Shipment
 ├── CouponUsage
 └── ShippingAddress
```

Historical records must remain intact.

---

# 18. REPOSITORIES

Inspect:

- Generic Repository
- Customer Repository
- Repository interfaces
- Assembly Scanning
- Dependency Injection

Determine whether a User Repository is actually needed.

Do not create unnecessary repository duplication.

Ensure repository expressions/includes work correctly with TPT inheritance.

---

# 19. SERVICES

Inspect and refactor:

- AuthService
- CustomerService
- AdminService
- TokenService
- OTP service
- password hashing
- OrderService
- CouponService
- any service using Customer.Role

Remove assumptions like:

```csharp
customer.Role == "Admin"
```

Replace them with the new domain/authorization model.

Keep business rules in the Service/Authorization layers.

Keep controllers thin.

---

# 20. DTOs

Audit all DTOs.

Remove/refactor fields related to:

- Role
- PasswordHash
- authentication internals

Never expose PasswordHash.

Do not expose EF entities directly.

Do not rename DTOs unnecessarily.

Preserve existing DTO naming/folder conventions.

---

# 21. CONTROLLERS

Audit all controllers for:

- Customer.Role
- role checks
- CustomerId from requests
- authentication assumptions
- ownership checks
- admin checks

Refactor them to use User-based authentication and policies.

Do not move business logic into controllers.

---

# 22. EF CORE RELATIONSHIPS

Explicitly inspect/configure:

```text
User
Customer
Admin
```

and all Customer-owned relationships.

Verify:

- PK/FK
- required/optional relationships
- DeleteBehavior
- indexes
- constraints
- navigation properties

Be careful with cascade deletes.

Do not accidentally cause deletion of historical orders when an account/profile is removed.

---

# 23. DATABASE INDEXES

Inspect existing indexes and constraints.

At minimum verify:

```text
Users.Email
```

and all existing business indexes.

Email uniqueness should follow the current business rule.

For TPT:

```text
Customers.Id
Admins.Id
```

are PK/FK keys to Users.

---

# 24. MIGRATION STRATEGY

This is critical.

Current conceptual database:

```text
Customers
    Id
    authentication fields
    Role
    customer fields
```

Target:

```text
Users
Customers
Admins
```

using TPT.

Do NOT simply drop the existing Customer.Role column and recreate the database.

Preserve existing data.

Migration should conceptually:

1. Create Users.
2. Create Admins.
3. Prepare Customers for TPT inheritance.
4. Move common authentication/account data into Users.
5. Preserve existing Customer IDs whenever practical.
6. Make Customer primary key correspond to User primary key for TPT.
7. Create Admin subtype rows for existing admin accounts.
8. Preserve customer business data.
9. Preserve all CustomerId foreign keys.
10. Validate relationships.
11. Remove obsolete authentication columns from Customers.
12. Remove Customer.Role.
13. Ensure there is no discriminator.
14. Verify no orphaned records.

If direct ID preservation is unsafe or incompatible with the existing schema, STOP and explain the safest migration strategy before generating destructive migration code.

---

# 25. EXISTING ADMIN ACCOUNTS

If the current data contains:

```text
Customer
Id = 25
Role = Admin
```

do not delete the account.

Convert the account into:

```text
Users
Id = 25
...

Admins
Id = 25
...
```

If the business rules require the same account to also have a Customer subtype, determine that from the existing requirements.

Do not create duplicate authentication accounts.

---

# 26. TPT ID STRATEGY

The final inheritance keys should be:

```text
Users.Id = 25
Customers.Id = 25
```

or:

```text
Users.Id = 25
Admins.Id = 25
```

The subtype PK is simultaneously its FK to Users.

This is NOT:

```text
Users.Id = 100
Customers.UserId = 25
```

for the TPT relationship.

---

# 27. MULTIPLE SUBTYPES

The TPT model technically allows:

```text
User
 ├── Customer
 └── Admin
```

A User may potentially have both subtype rows if business rules permit.

Do NOT force exclusivity with a Role column.

If ShopNest requires exclusive account types, enforce that through business/authorization rules and database constraints where appropriate.

Do not invent an exclusivity rule without inspecting current requirements.

---

# 28. SERIALIZATION

Avoid returning EF entities directly.

Use DTOs.

Watch for inheritance/navigation cycles:

```text
User -> Customer -> User
User -> Admin -> User
```

Avoid circular JSON payloads.

---

# 29. SECURITY

The refactor must not introduce:

- IDOR
- BOLA
- privilege escalation
- self-admin promotion
- JWT identity confusion
- trusting frontend CustomerId
- trusting frontend role
- password exposure
- duplicate credentials
- authorization bypass

Backend authorization remains authoritative.

---

# 30. FRONTEND COMPATIBILITY

Inspect the React frontend for dependencies on:

- CustomerId
- Role
- current user
- JWT claims
- authentication response
- admin detection

Do not rewrite the frontend unnecessarily.

Identify exactly what must change.

The Admin UI should eventually use:

```text
/admin/*
```

with a dedicated Admin layout and protected routes.

Frontend protection is UX/security-in-depth only.

Backend authorization remains mandatory.

---

# 31. EXISTING SHOPNEST ARCHITECTURE

Preserve:

```text
Repository
    ↓
Services
    ↓
REST API
```

and:

- Generic Repository
- Repository Pattern
- Service Pattern
- DTOs
- Interfaces
- Dependency Injection
- Assembly Scanning
- Global Exception Handling
- Serilog / Seq
- JWT
- Rate Limiting
- Audit Interceptors
- Authorization Policies
- Ownership Authorization
- Security Helpers
- Argon2 Password Hashing
- Validation Helpers
- Data Masking

Do not introduce an unrelated architecture.

Do not move classes between layers without necessity.

---

# 32. PHASE 1 — ANALYSIS

Before changing code, produce:

1. Current Customer entity.
2. Current authentication fields.
3. Every Customer.Role usage.
4. Current JWT claims.
5. TokenService.
6. AuthService.
7. Authorization policies.
8. Authorization handlers.
9. All Customer relationships.
10. DTOs involving Customer/Role.
11. Controllers involving Customer/Role.
12. EF configurations.
13. Existing migrations.
14. Database structure if available.
15. Existing Admin functionality.
16. Frontend dependencies.
17. Migration risks.
18. Exact files requiring modification.

Do NOT modify code during this phase.

---

# 33. PHASE 2 — DESIGN

Before implementation, present:

## Entity model

```text
User (abstract)
 ├── Customer
 └── Admin
```

## Database model

```text
Users
  PK Id

Customers
  PK/FK Id -> Users.Id

Admins
  PK/FK Id -> Users.Id
```

## Authentication

```text
Login
 ↓
User
 ↓
JWT(User.Id)
```

## Customer ownership

```text
JWT User.Id
 ↓
Customer subtype
 ↓
Customer-owned resource
```

## Admin authorization

```text
JWT User.Id
 ↓
Admin subtype / Admin policy
 ↓
Admin endpoint
```

Explain deviations before implementation.

---

# 34. PHASE 3 — IMPLEMENTATION

Implement only after the analysis/design is internally consistent.

Modify only required files.

Do not rewrite unrelated functionality.

---

# 35. PHASE 4 — MIGRATION

Create the EF Core migration carefully.

Before applying:

- inspect generated migration
- verify data movement
- verify FK changes
- verify PK changes
- verify DeleteBehavior
- verify indexes
- verify no unintended DROP TABLE
- verify no unintended data loss

If unsafe, STOP and explain the problem.

---

# 36. PHASE 5 — CODEBASE AUDIT

Search the entire codebase for:

```text
Customer.Role
customer.Role
.Role
IsAdmin
CustomerId
UserId
```

Also search for:

```text
Role claims
Customer claims
JWT CustomerId
```

Every remaining occurrence must be intentional.

---

# 37. PHASE 6 — TESTING

Verify:

## Registration

- Customer registration
- User + Customer TPT rows created
- Password hashing works
- OTP works
- Email verification works

## Login

- Login works
- JWT contains correct User.Id
- Refresh token works
- Invalid credentials rejected

## Admin

- Existing admin account migrated
- Admin can authenticate
- Admin endpoints work
- Customer cannot access Admin endpoints
- Customer cannot self-promote

## Customer

- Profile
- Addresses
- Cart
- Wishlist
- Reviews
- Coupon usage
- Orders

## Ownership

- Customer can access own order
- Customer cannot access another customer's order
- Customer cannot manipulate another customer's resources
- Admin can access authorized resources

## Orders

- Existing orders remain intact
- Order.CustomerId remains valid
- ShippingAddress snapshots remain intact
- Payment remains intact
- Shipment remains intact
- CouponUsage remains intact
- OrderStatus remains intact

## Database

Verify:

```text
Users
Customers
Admins
```

and:

```text
Customers.Id -> Users.Id
Admins.Id -> Users.Id
```

Verify:

- No Customer.Role
- No discriminator
- No orphaned records
- No duplicated authentication data
- Existing Customer IDs preserved where practical
- Existing Orders preserved

---

# 38. FINAL REPORT

At the end provide:

1. Files created.
2. Files modified.
3. Files deleted.
4. Final entity hierarchy.
5. Final database schema.
6. TPT configuration.
7. Migration details.
8. Authentication changes.
9. JWT claim changes.
10. Authorization changes.
11. Repository changes.
12. Service changes.
13. DTO changes.
14. Controller changes.
15. Frontend changes.
16. Security improvements.
17. Potential risks.
18. Exact migration commands.
19. Exact build/test commands.
20. Manual testing checklist.

---

# FINAL ACCEPTANCE CRITERIA

The refactor is complete only when:

```text
                User (abstract)
                    |
           +--------+--------+
           |                 |
       Customer            Admin
```

is represented as **EF Core TPT**.

Database:

```text
Users
Customers
Admins
```

with:

```text
Customers.Id = Users.Id
Admins.Id = Users.Id
```

and:

```text
NO Customers.Role
NO Users.Discriminator
```

Authentication uses:

```text
User.Id
```

Customer business data continues using:

```text
Customer.Id
```

Admin authorization is enforced server-side.

Customer ownership is enforced server-side.

Existing Orders, Addresses, Cart, Wishlist, Reviews, CouponUsage, Payments, Shipments, ShippingAddress snapshots, and other historical business data are preserved.

The existing ShopNest layered architecture and security mechanisms remain intact.
