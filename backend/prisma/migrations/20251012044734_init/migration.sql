-- CreateTable
CREATE TABLE "Department"
(
    "id"   SERIAL NOT NULL,
    "name" TEXT   NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Employee"
(
    "id"            SERIAL       NOT NULL,
    "name"          TEXT         NOT NULL,
    "email"         TEXT         NOT NULL,
    "employeeId"    TEXT         NOT NULL,
    "password"      TEXT         NOT NULL,
    "emailVerified" BOOLEAN      NOT NULL DEFAULT FALSE,
    "departmentId"  INTEGER      NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department" ("name");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee" ("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeId_key" ON "Employee" ("employeeId");

-- AddForeignKey
ALTER TABLE "Employee"
    ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
