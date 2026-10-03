-- Double H Consultation Platform — SQL Server schema (NVARCHAR throughout)
CREATE DATABASE DoubleH; GO
USE DoubleH; GO

CREATE TABLE Admins(AdminID INT IDENTITY PRIMARY KEY, Name NVARCHAR(200) NOT NULL, Email NVARCHAR(320) NOT NULL UNIQUE, PasswordHash NVARCHAR(500) NOT NULL, Status NVARCHAR(20) NOT NULL DEFAULT 'Active', CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), LastLoginAt DATETIME2 NULL);
CREATE TABLE ConsultationCategories(CategoryID INT IDENTITY PRIMARY KEY, Icon NVARCHAR(50) NULL, DisplayOrder INT NOT NULL DEFAULT 0, Status NVARCHAR(20) NOT NULL DEFAULT 'Active');
CREATE TABLE CategoryTranslations(CategoryID INT NOT NULL REFERENCES ConsultationCategories(CategoryID) ON DELETE CASCADE, LanguageCode NCHAR(2) NOT NULL CHECK(LanguageCode IN ('ar','tr','en','fr')), Name NVARCHAR(300) NOT NULL, Description NVARCHAR(2000) NOT NULL, PRIMARY KEY(CategoryID,LanguageCode));
CREATE TABLE ConsultationRequests(RequestID INT IDENTITY PRIMARY KEY, CategoryID INT NOT NULL REFERENCES ConsultationCategories(CategoryID), FullName NVARCHAR(300) NOT NULL, Email NVARCHAR(320) NOT NULL, Phone NVARCHAR(50) NOT NULL, Note NVARCHAR(2000) NOT NULL, LanguageCode NCHAR(2) NOT NULL DEFAULT 'en', IsFirstFree BIT NOT NULL DEFAULT 1, Status NVARCHAR(20) NOT NULL DEFAULT 'New' CHECK(Status IN ('New','Contacted','Scheduled','Completed','Cancelled','Rejected')), AdminNotes NVARCHAR(2000) NULL, CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), ScheduledAt DATETIME2 NULL);
CREATE INDEX IX_Requests_Email ON ConsultationRequests(Email);
CREATE INDEX IX_Requests_Phone ON ConsultationRequests(Phone);
CREATE INDEX IX_Requests_Status ON ConsultationRequests(Status);
CREATE TABLE Messages(MessageID INT IDENTITY PRIMARY KEY, Name NVARCHAR(300) NOT NULL, Email NVARCHAR(320) NOT NULL, Subject NVARCHAR(500) NOT NULL, Message NVARCHAR(3000) NOT NULL, LanguageCode NCHAR(2) NOT NULL DEFAULT 'en', Status NVARCHAR(20) NOT NULL DEFAULT 'New', CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME());
CREATE TABLE Consultants(ConsultantID INT IDENTITY PRIMARY KEY, Photo NVARCHAR(1000) NULL, YearsOfExperience INT NOT NULL DEFAULT 0, DisplayOrder INT NOT NULL DEFAULT 0, Status NVARCHAR(20) NOT NULL DEFAULT 'Active');
CREATE TABLE ConsultantTranslations(ConsultantID INT NOT NULL REFERENCES Consultants(ConsultantID) ON DELETE CASCADE, LanguageCode NCHAR(2) NOT NULL CHECK(LanguageCode IN ('ar','tr','en','fr')), FullName NVARCHAR(300) NOT NULL, Title NVARCHAR(300) NOT NULL, Specialty NVARCHAR(300) NOT NULL, Bio NVARCHAR(3000) NOT NULL, PRIMARY KEY(ConsultantID,LanguageCode));
CREATE TABLE Certifications(CertificationID INT IDENTITY PRIMARY KEY, ConsultantID INT NOT NULL REFERENCES Consultants(ConsultantID) ON DELETE CASCADE, Name NVARCHAR(500) NOT NULL, IssuingBody NVARCHAR(500) NOT NULL, YearObtained INT NOT NULL, VerificationURL NVARCHAR(1000) NULL, DisplayOrder INT NOT NULL DEFAULT 0);
CREATE TABLE SiteContent(ContentKey NVARCHAR(200) NOT NULL, LanguageCode NCHAR(2) NOT NULL CHECK(LanguageCode IN ('ar','tr','en','fr')), Value NVARCHAR(MAX) NOT NULL, PRIMARY KEY(ContentKey,LanguageCode));
CREATE TABLE Settings([Key] NVARCHAR(200) PRIMARY KEY, Value NVARCHAR(MAX) NOT NULL);
CREATE TABLE AuditLogs(LogID BIGINT IDENTITY PRIMARY KEY, AdminID INT NULL REFERENCES Admins(AdminID), Action NVARCHAR(200) NOT NULL, Entity NVARCHAR(200) NOT NULL, EntityID NVARCHAR(200) NULL, Timestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME());
-- NOTE: No Clients table by design (business rule).

-- Seed: 7 Double H consultation categories
INSERT INTO ConsultationCategories(Icon,DisplayOrder) VALUES
 (N'🏛️',1),(N'🌉',2),(N'⚕️',3),(N'⚖️',4),(N'⚡',5),(N'📊',6),(N'📐',7);
-- Category slugs by DisplayOrder: 1 arch, 2 civil, 3 medical, 4 law, 5 elec, 6 mgmt, 7 bd
INSERT INTO CategoryTranslations(CategoryID,LanguageCode,Name,Description) VALUES
 (1,'en',N'Architecture',N'Architectural design, planning and supervision.'),
 (1,'ar',N'العمارة',N'تصميم وتخطيط وإشراف معماري.'),
 (1,'tr',N'Mimarlık',N'Tasarım, planlama ve mimari süpervizyon.'),
 (1,'fr',N'Architecture',N'Conception, planification et suivi architectural.'),
 (2,'en',N'Civil Engineering',N'Structures, infrastructure and site engineering.'),
 (2,'ar',N'الهندسة المدنية',N'إنشاءات وبنية تحتية وهندسة مواقع.'),
 (2,'tr',N'İnşaat Mühendisliği',N'Yapılar, altyapı ve saha mühendisliği.'),
 (2,'fr',N'Génie civil',N'Structures, infrastructures et chantier.'),
 (3,'en',N'Medical',N'Healthcare facilities and medical planning consult.'),
 (3,'ar',N'الطب',N'استشارات المنشآت الصحية والتخطيط الطبي.'),
 (3,'tr',N'Tıp',N'Sağlık tesisleri ve tıbbi planlama danışmanlığı.'),
 (3,'fr',N'Médical',N'Conseil en établissements de santé.'),
 (4,'en',N'Law',N'Legal consulting for engineering and contracts.'),
 (4,'ar',N'القانون',N'استشارات قانونية للهندسة والعقود.'),
 (4,'tr',N'Hukuk',N'Mühendislik ve sözleşmeler için hukuk danışmanlığı.'),
 (4,'fr',N'Droit',N'Conseil juridique, ingénierie et contrats.'),
 (5,'en',N'Electricity',N'Electrical systems, power and installations.'),
 (5,'ar',N'الكهرباء',N'أنظمة كهربائية وطاقة وتمديدات.'),
 (5,'tr',N'Elektrik',N'Elektrik sistemleri, enerji ve tesisatlar.'),
 (5,'fr',N'Électricité',N'Systèmes électriques et installations.'),
 (6,'en',N'Management',N'Project management and business leadership.'),
 (6,'ar',N'الإدارة',N'إدارة المشاريع والقيادة.'),
 (6,'tr',N'Yönetim',N'Proje yönetimi ve liderlik.'),
 (6,'fr',N'Management',N'Gestion de projets et leadership.'),
 (7,'en',N'BD',N'Specialized BD consulting and project support.'),
 (7,'ar',N'BD',N'استشارات BD متخصصة ودعم المشاريع.'),
 (7,'tr',N'BD',N'Özel BD danışmanlığı ve proje desteği.'),
 (7,'fr',N'BD',N'Conseil BD spécialisé et soutien.');
-- (translations + consultants + content + default admin with PasswordHash for 'Admin123!' must be seeded by backend hasher; placeholder below)
INSERT INTO Settings([Key],Value) VALUES ('DefaultLanguage','en'),('FreeConsultationText','First consultation free — once per client'),('FreeOncePer','client'),('NotificationEmails','admin@doubleh.com'),('CompanyName','Double H Consulting');
