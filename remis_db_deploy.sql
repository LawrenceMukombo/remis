--
-- PostgreSQL database dump
--

\restrict ZNg9fOcWrgy4fpPDtNvFlmQFZ6Xs40OmpSWFRFgA8H64WN6SSo4r55UfuqyFdEN

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: remis; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA remis;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _PermissionToRole; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis."_PermissionToRole" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _UserToUserGroup; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis."_UserToUserGroup" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.audit_logs (
    id text NOT NULL,
    action text NOT NULL,
    resource text NOT NULL,
    resource_id text,
    details jsonb,
    ip_address text,
    user_agent text,
    user_id text,
    tenant_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: compliance_records; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.compliance_records (
    id text NOT NULL,
    property_id text NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    status text NOT NULL,
    authority text,
    issued_date timestamp(3) without time zone,
    expiry_date timestamp(3) without time zone,
    document_url text,
    notes text,
    tenant_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: contract_clause_usages; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.contract_clause_usages (
    id text NOT NULL,
    contract_id text NOT NULL,
    clause_id text NOT NULL
);


--
-- Name: contract_clauses; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.contract_clauses (
    id text NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    text text NOT NULL,
    is_mandatory boolean DEFAULT false NOT NULL,
    tenant_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: contract_obligations; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.contract_obligations (
    id text NOT NULL,
    contract_id text NOT NULL,
    title text NOT NULL,
    description text,
    due_date timestamp(3) without time zone,
    frequency text,
    status text NOT NULL,
    assigned_to text
);


--
-- Name: contract_templates; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.contract_templates (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    type text NOT NULL,
    content text NOT NULL,
    tenant_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: contracts; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.contracts (
    id text NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    status text NOT NULL,
    "partyName" text,
    "partyContact" text,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    "autoRenew" boolean DEFAULT false NOT NULL,
    "renewalNoticeDays" integer DEFAULT 30,
    value numeric(65,30),
    content text,
    "documentUrl" text,
    tenant_id text NOT NULL,
    created_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: documents; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.documents (
    id text NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    type text NOT NULL,
    "mimeType" text,
    size integer,
    "tenantId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: employees; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.employees (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text,
    phone text,
    title text,
    department text,
    "hireDate" timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "userId" text,
    "tenantId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: expressions_of_interest; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.expressions_of_interest (
    id text NOT NULL,
    "propertyId" text,
    "unitId" text,
    "userId" text,
    status text NOT NULL,
    message text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: field_devices; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.field_devices (
    id text NOT NULL,
    device_id text NOT NULL,
    name text,
    app_version text,
    platform text,
    last_sync_at timestamp(3) without time zone,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    tenant_id text NOT NULL,
    assigned_to text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: integration_connections; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.integration_connections (
    id text NOT NULL,
    provider text NOT NULL,
    api_key text,
    api_secret text,
    status text DEFAULT 'DISCONNECTED'::text NOT NULL,
    config jsonb,
    tenant_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: inventory_items; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.inventory_items (
    id text NOT NULL,
    sku text,
    name text NOT NULL,
    description text,
    category text,
    quantity integer DEFAULT 0 NOT NULL,
    min_quantity integer DEFAULT 5 NOT NULL,
    unit_price numeric(65,30),
    location text,
    status text DEFAULT 'IN_STOCK'::text NOT NULL,
    tenant_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: invoices; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.invoices (
    invoice_id text NOT NULL,
    invoice_no text,
    total numeric(65,30) NOT NULL,
    balance_due numeric(65,30) NOT NULL,
    due_date timestamp(3) without time zone NOT NULL,
    status text NOT NULL,
    bill_to_party_id text NOT NULL,
    lease_id text,
    tenant_id text NOT NULL,
    items jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: landlords; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.landlords (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text,
    phone text NOT NULL,
    address text,
    "idNumber" text,
    "bankName" text,
    "accountNumber" text,
    "accountName" text,
    notes text,
    "tenantId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: lease_signatures; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.lease_signatures (
    id text NOT NULL,
    lease_id text NOT NULL,
    user_id text,
    signature_type text,
    signature_data text,
    signed_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address text,
    user_agent text
);


--
-- Name: leases; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.leases (
    id text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "rentAmount" numeric(65,30) NOT NULL,
    frequency text NOT NULL,
    status text NOT NULL,
    "propertyId" text NOT NULL,
    "renterId" text NOT NULL,
    "tenantId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: locations; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.locations (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    "parentId" text,
    "tenantId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: maintenance_tickets; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.maintenance_tickets (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    priority text NOT NULL,
    status text NOT NULL,
    "propertyId" text,
    "tenantId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: message_threads; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.message_threads (
    id text NOT NULL,
    subject text,
    tenant_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    property_id text
);


--
-- Name: messages; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.messages (
    id text NOT NULL,
    thread_id text NOT NULL,
    sender_id text NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ownership_history; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.ownership_history (
    id text NOT NULL,
    property_id text NOT NULL,
    owner_id text,
    owner_type text,
    acquisition_date timestamp(3) without time zone,
    transfer_date timestamp(3) without time zone,
    transfer_reason text,
    document_reference text
);


--
-- Name: payments; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.payments (
    id text NOT NULL,
    amount numeric(65,30) NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    method text NOT NULL,
    reference text,
    status text NOT NULL,
    "renterId" text NOT NULL,
    "tenantId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: permissions; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.permissions (
    id text NOT NULL,
    action text NOT NULL,
    resource text NOT NULL,
    description text
);


--
-- Name: portal_configs; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.portal_configs (
    id text NOT NULL,
    tenant_id text NOT NULL,
    subdomain text,
    primary_color text,
    secondary_color text,
    logo_url text,
    welcome_message text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: properties; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.properties (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    status text NOT NULL,
    "locationId" text NOT NULL,
    "tenantId" text NOT NULL,
    address text,
    images text[],
    latitude double precision,
    longitude double precision,
    province text,
    district text,
    llg text,
    region text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    listing_type text DEFAULT 'LEASE'::text NOT NULL,
    sale_price numeric(65,30),
    description text,
    "yearBuilt" integer,
    "landArea" double precision,
    floor_count integer,
    parking_spaces integer,
    "landlordId" text
);


--
-- Name: property_features; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.property_features (
    id text NOT NULL,
    property_id text NOT NULL,
    feature text NOT NULL,
    description text,
    tenant_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: property_sales; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.property_sales (
    id text NOT NULL,
    property_id text NOT NULL,
    buyer_id text NOT NULL,
    seller_id text,
    agreed_price numeric(65,30),
    status text,
    contract_url text,
    settlement_date timestamp(3) without time zone,
    registry_reference text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: property_tags; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.property_tags (
    id text NOT NULL,
    property_id text NOT NULL,
    tag text NOT NULL,
    color text,
    tenant_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: property_valuations; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.property_valuations (
    id text NOT NULL,
    property_id text NOT NULL,
    valuation_date timestamp(3) without time zone NOT NULL,
    amount numeric(65,30) NOT NULL,
    valuation_type text NOT NULL,
    valued_by text,
    notes text,
    tenant_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: renters; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.renters (
    id text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    type text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "idNumber" text,
    "tenantId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.roles (
    role_id text NOT NULL,
    role_code text NOT NULL,
    role_name text NOT NULL,
    description text,
    tenant_id text
);


--
-- Name: sale_interests; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.sale_interests (
    id text NOT NULL,
    property_id text NOT NULL,
    user_id text NOT NULL,
    offered_price numeric(65,30),
    status text,
    terms text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sale_items; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.sale_items (
    id text NOT NULL,
    sale_id text NOT NULL,
    inventory_item_id text,
    name text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(65,30) NOT NULL,
    total_price numeric(65,30) NOT NULL
);


--
-- Name: sales_transactions; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.sales_transactions (
    id text NOT NULL,
    order_number text NOT NULL,
    customer_name text,
    total_amount numeric(65,30) NOT NULL,
    tax_amount numeric(65,30) DEFAULT 0 NOT NULL,
    payment_method text NOT NULL,
    status text DEFAULT 'COMPLETED'::text NOT NULL,
    tenant_id text NOT NULL,
    performed_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: scam_blacklist; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.scam_blacklist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_value character varying(255) NOT NULL,
    entity_display character varying(255) NOT NULL,
    severity character varying(50) DEFAULT 'CRITICAL_FRAUD'::character varying,
    incident_summary text NOT NULL,
    evidence_urls text[] DEFAULT ARRAY[]::text[],
    flagged_by character varying(255) DEFAULT 'SYSTEM_COMPLIANCE'::character varying,
    tenant_id character varying(255),
    appeal_status character varying(50) DEFAULT 'NONE'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: stock_transactions; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.stock_transactions (
    id text NOT NULL,
    inventory_item_id text NOT NULL,
    type text NOT NULL,
    quantity integer NOT NULL,
    reason text,
    performed_by text,
    tenant_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tasks; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.tasks (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    status text NOT NULL,
    priority text NOT NULL,
    due_date timestamp(3) without time zone,
    assigned_to text,
    related_to text,
    related_type text,
    tenant_id text NOT NULL,
    created_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: tenants; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.tenants (
    id text NOT NULL,
    name text NOT NULL,
    domain text,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    config jsonb,
    features jsonb
);


--
-- Name: units; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.units (
    id text NOT NULL,
    name text NOT NULL,
    code text,
    type text NOT NULL,
    "marketRent" numeric(65,30),
    area double precision,
    bedrooms integer,
    bathrooms double precision,
    status text DEFAULT 'AVAILABLE'::text NOT NULL,
    "propertyId" text NOT NULL,
    "tenantId" text NOT NULL,
    images text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: user_groups; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.user_groups (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    tenant_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: user_location_access; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.user_location_access (
    "userId" text NOT NULL,
    "locationId" text NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.users (
    user_id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    full_name text,
    tenant_id text NOT NULL,
    role_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: vendors; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.vendors (
    vendor_id text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    category text,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    tenant_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: work_orders; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.work_orders (
    id text NOT NULL,
    "ticketId" text NOT NULL,
    status text NOT NULL,
    description text,
    "assignedToPartyId" text,
    "scheduledDate" timestamp(3) without time zone,
    "completedDate" timestamp(3) without time zone,
    "costEstimate" numeric(65,30),
    "labourCost" numeric(65,30),
    "partsCost" numeric(65,30),
    "totalCost" numeric(65,30),
    "tenantId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: workflow_rules; Type: TABLE; Schema: remis; Owner: -
--

CREATE TABLE remis.workflow_rules (
    id text NOT NULL,
    name text NOT NULL,
    "triggerType" text NOT NULL,
    "triggerKey" text NOT NULL,
    "actionType" text NOT NULL,
    "actionData" jsonb,
    is_active boolean DEFAULT true NOT NULL,
    tenant_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: _PermissionToRole; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis."_PermissionToRole" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _UserToUserGroup; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis."_UserToUserGroup" ("A", "B") FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.audit_logs (id, action, resource, resource_id, details, ip_address, user_agent, user_id, tenant_id, created_at) FROM stdin;
\.


--
-- Data for Name: compliance_records; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.compliance_records (id, property_id, title, type, status, authority, issued_date, expiry_date, document_url, notes, tenant_id, created_at, updated_at) FROM stdin;
efd55eb6-4523-425c-8b9b-86041e90dffe	db75aa70-2d5f-42a8-8361-565f97a0b4b9	Proof of Ownership Verification (TITLE_DEED)	OWNERSHIP_TITLE_DEED	APPROVED	National Land Registry / Ministry of Lands	2026-10-11 07:21:35.164	\N	https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80	{"owner_name":"Dr. Mwape Chanda","owner_email":"dr.mwape@zambia-estates.com","owner_phone":"+260971234888","national_id":"182940/11/1","owner_type":"INDIVIDUAL","document_type":"TITLE_DEED","title_deed_number":"CT-LUS-2023-88492","deed_url":"https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80","id_doc_url":"https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80","verified_declaration":true,"submissionDate":"2026-10-11T07:21:35.164Z","reviewedBy":"COMPLIANCE_AUDITOR","reviewerNotes":"Ministry of Lands Title Deed Authenticated and Audited with Chief Registrar","reviewedAt":"2026-10-11T07:24:04.266Z"}	90675491-25d0-4129-8084-6a38a591be6f	2026-10-11 07:21:35.167	2026-10-11 07:24:04.268
9f0b06c4-5e23-4123-8e34-c4539fbb8d3b	496d46ac-eb1c-40c8-bf61-075383ea1825	Proof of Ownership Verification (TITLE_DEED)	OWNERSHIP_TITLE_DEED	FLAGGED_SCAM	National Land Registry / Ministry of Lands	2026-10-11 07:24:44.682	\N	https://example.com/fake-deed.pdf	{"owner_name":"Fraudster Actor","owner_phone":"+260977888777","national_id":"777888/11/1","owner_type":"INDIVIDUAL","document_type":"TITLE_DEED","title_deed_number":"CT-COUNTERFEIT-99","deed_url":"https://example.com/fake-deed.pdf","verified_declaration":true,"submissionDate":"2026-10-11T07:24:44.682Z","reviewedBy":"CHIEF_REGISTRAR_AUDITOR","reviewerNotes":"Ministry of Lands confirmed fake cadastral survey and forged registrar signature","reviewedAt":"2026-10-11T07:24:44.753Z"}	90675491-25d0-4129-8084-6a38a591be6f	2026-10-11 07:24:44.684	2026-10-11 07:24:44.755
06d702c2-4680-41ea-966c-4a251ed3fbc1	3303fce2-037e-42da-95c2-75a816c884c5	Proof of Ownership Verification (TITLE_DEED)	OWNERSHIP_TITLE_DEED	APPROVED	National Land Registry / Ministry of Lands	2026-10-12 04:48:10.398	\N	https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80	{"owner_name":"Lawrence Mukombo","owner_email":"lawrencemukombo2@gmail.com","owner_phone":"+260963328807","national_id":"219879/24/1","owner_type":"INDIVIDUAL","document_type":"TITLE_DEED","title_deed_number":"Sol-TITL-845794","deed_url":"https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80","id_doc_url":"https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80","rates_statement_url":"https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80","verified_declaration":true,"submissionDate":"2026-10-12T04:48:10.398Z","country":"Zambia","transaction_type":"SALE","property_category":"LAND","specifications":{"land_size":"1100","land_size_unit":"SQM","title_tenure":"99_YEAR_LEASEHOLD","zoning_use":"RESIDENTIAL","topography":"WATERFRONT","road_access":"DIRT","utilities":"UNDEVELOPED","fencing":"UNFENCED","soil_type":"RED_LOAM","lease_duration_years":null},"reviewedBy":"Chief Registrar / Lands Auditor","reviewerNotes":"Official Ministry of Lands verification complete. Title CT-Sol-TITL-845794 authenticated against Cadastre register.","reviewedAt":"2026-10-12T05:56:00.363Z"}	90675491-25d0-4129-8084-6a38a591be6f	2026-10-12 04:48:10.401	2026-10-12 05:56:00.365
\.


--
-- Data for Name: contract_clause_usages; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.contract_clause_usages (id, contract_id, clause_id) FROM stdin;
\.


--
-- Data for Name: contract_clauses; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.contract_clauses (id, name, category, text, is_mandatory, tenant_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: contract_obligations; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.contract_obligations (id, contract_id, title, description, due_date, frequency, status, assigned_to) FROM stdin;
\.


--
-- Data for Name: contract_templates; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.contract_templates (id, name, description, type, content, tenant_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.contracts (id, title, type, status, "partyName", "partyContact", "startDate", "endDate", "autoRenew", "renewalNoticeDays", value, content, "documentUrl", tenant_id, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.documents (id, name, url, type, "mimeType", size, "tenantId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.employees (id, "firstName", "lastName", email, phone, title, department, "hireDate", status, "userId", "tenantId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: expressions_of_interest; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.expressions_of_interest (id, "propertyId", "unitId", "userId", status, message, created_at) FROM stdin;
\.


--
-- Data for Name: field_devices; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.field_devices (id, device_id, name, app_version, platform, last_sync_at, status, tenant_id, assigned_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: integration_connections; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.integration_connections (id, provider, api_key, api_secret, status, config, tenant_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.inventory_items (id, sku, name, description, category, quantity, min_quantity, unit_price, location, status, tenant_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.invoices (invoice_id, invoice_no, total, balance_due, due_date, status, bill_to_party_id, lease_id, tenant_id, items, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: landlords; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.landlords (id, "firstName", "lastName", email, phone, address, "idNumber", "bankName", "accountNumber", "accountName", notes, "tenantId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: lease_signatures; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.lease_signatures (id, lease_id, user_id, signature_type, signature_data, signed_at, ip_address, user_agent) FROM stdin;
\.


--
-- Data for Name: leases; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.leases (id, "startDate", "endDate", "rentAmount", frequency, status, "propertyId", "renterId", "tenantId", "createdAt", "updatedAt") FROM stdin;
lease-telecom-01	2026-01-01 00:00:00	2027-12-31 00:00:00	4500.000000000000000000000000000000	MONTHLY	ACTIVE	prop-harbour-city-01	renter-telecom-01	90675491-25d0-4129-8084-6a38a591be6f	2026-10-11 04:14:17.444	2026-10-11 04:14:17.444
lease-oceanic-02	2025-06-01 00:00:00	2028-05-31 00:00:00	6000.000000000000000000000000000000	MONTHLY	ACTIVE	prop-lae-logistics-03	renter-oceanic-02	90675491-25d0-4129-8084-6a38a591be6f	2026-10-11 04:14:17.455	2026-10-11 04:14:17.455
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.locations (id, name, type, level, "parentId", "tenantId", "createdAt", "updatedAt") FROM stdin;
loc-pom-cbd-01	Port Moresby CBD & Waterfront	DISTRICT	2	\N	90675491-25d0-4129-8084-6a38a591be6f	2026-10-11 04:14:17.318	2026-10-11 04:14:17.318
loc-lae-ind-02	Lae Industrial & Maritime Zone	DISTRICT	2	\N	90675491-25d0-4129-8084-6a38a591be6f	2026-10-11 04:14:17.335	2026-10-11 04:14:17.335
loc-mth-comm-03	Mt Hagen Highlands Trade Hub	DISTRICT	2	\N	90675491-25d0-4129-8084-6a38a591be6f	2026-10-11 04:14:17.339	2026-10-11 04:14:17.339
loc-us-root-01	United States	COUNTRY	1	\N	90675491-25d0-4129-8084-6a38a591be6f	2026-10-11 04:28:51.599	2026-10-11 04:28:51.599
loc-us-ny-02	New York Metro & Tri-State	STATE	2	loc-us-root-01	90675491-25d0-4129-8084-6a38a591be6f	2026-10-11 04:28:51.612	2026-10-11 04:28:51.612
loc-us-manhattan-03	Manhattan Financial District	CITY	3	loc-us-ny-02	90675491-25d0-4129-8084-6a38a591be6f	2026-10-11 04:28:51.617	2026-10-11 04:28:51.617
loc-uk-root-01	United Kingdom	COUNTRY	1	\N	90675491-25d0-4129-8084-6a38a591be6f	2026-10-11 04:28:51.622	2026-10-11 04:28:51.622
loc-uk-london-02	Greater London Financial Center	CITY	2	loc-uk-root-01	90675491-25d0-4129-8084-6a38a591be6f	2026-10-11 04:28:51.628	2026-10-11 04:28:51.628
loc-sa-root-01	South Africa	COUNTRY	1	\N	tenant-apex-emea-02	2026-10-11 04:28:51.677	2026-10-11 04:28:51.677
loc-sa-jhb-02	Sandton Central, Johannesburg	CITY	2	loc-sa-root-01	tenant-apex-emea-02	2026-10-11 04:28:51.683	2026-10-11 04:28:51.683
loc-au-root-01	Australia	COUNTRY	1	\N	tenant-pacific-rim-03	2026-10-11 04:28:51.701	2026-10-11 04:28:51.701
loc-au-syd-02	Sydney CBD & Barangaroo	CITY	2	loc-au-root-01	tenant-pacific-rim-03	2026-10-11 04:28:51.707	2026-10-11 04:28:51.707
loc-zm-tenant-lusaka-dist	Lusaka District	DISTRICT	3	loc-zm-tenant-lusaka	tenant-zambia-realty-01	2026-10-11 05:03:52.384	2026-10-11 05:03:53.639
loc-zm-tena-lusaka-d-kabulonga	Kabulonga	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.388	2026-10-11 05:03:53.641
loc-zm-tena-lusaka-d-woodlands	Woodlands	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.392	2026-10-11 05:03:53.643
loc-zm-tena-lusaka-d-rhodes-park	Rhodes Park	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.395	2026-10-11 05:03:53.645
loc-zm-tena-lusaka-d-roma	Roma	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.399	2026-10-11 05:03:53.647
loc-zm-tena-lusaka-d-olympia-park	Olympia Park	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.404	2026-10-11 05:03:53.65
loc-zm-tena-lusaka-d-sunningdale	Sunningdale	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.408	2026-10-11 05:03:53.652
loc-zm-tena-lusaka-d-longacres	Longacres	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.412	2026-10-11 05:03:53.654
loc-zm-tena-lusaka-d-fairview	Fairview	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.415	2026-10-11 05:03:53.656
loc-zm-tena-lusaka-d-northmead	Northmead	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.418	2026-10-11 05:03:53.658
loc-zm-tena-lusaka-d-thorn-park	Thorn Park	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.422	2026-10-11 05:03:53.661
loc-zm-tena-lusaka-d-villa-elizabetha	Villa Elizabetha	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.426	2026-10-11 05:03:53.664
loc-zm-tena-lusaka-d-avondale	Avondale	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.429	2026-10-11 05:03:53.666
loc-zm-tena-lusaka-d-chelstone	Chelstone	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.432	2026-10-11 05:03:53.669
loc-zm-tena-lusaka-d-ibex-hill	Ibex Hill	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.435	2026-10-11 05:03:53.67
loc-zm-tena-lusaka-d-salama-park	Salama Park	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.438	2026-10-11 05:03:53.672
loc-zm-tena-lusaka-d-silverest	Silverest	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.442	2026-10-11 05:03:53.674
loc-zm-tena-lusaka-d-chilenje	Chilenje	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.446	2026-10-11 05:03:53.676
loc-zm-tena-lusaka-d-libala	Libala	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.449	2026-10-11 05:03:53.678
loc-zm-tena-lusaka-d-kabwata	Kabwata	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.453	2026-10-11 05:03:53.68
loc-zm-tena-lusaka-d-kamwala	Kamwala	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.457	2026-10-11 05:03:53.682
loc-zm-tena-lusaka-d-southgate	Southgate	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.46	2026-10-11 05:03:53.684
loc-zm-tena-lusaka-d-lilayi	Lilayi	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.464	2026-10-11 05:03:53.686
loc-zm-tena-lusaka-d-makeni	Makeni	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.467	2026-10-11 05:03:53.688
loc-zm-tena-lusaka-d-matero	Matero	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.471	2026-10-11 05:03:53.69
loc-zm-tena-lusaka-d-george-compound	George Compound	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.474	2026-10-11 05:03:53.692
loc-zm-tena-lusaka-d-kanyama	Kanyama	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.477	2026-10-11 05:03:53.694
loc-zm-tena-lusaka-d-chawama	Chawama	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.48	2026-10-11 05:03:53.696
loc-zm-tena-lusaka-d-garden-compound	Garden Compound	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.483	2026-10-11 05:03:53.698
loc-zm-tena-lusaka-d-mandevu	Mandevu	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.487	2026-10-11 05:03:53.7
loc-zm-tena-lusaka-d-chipata-compound	Chipata Compound	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.49	2026-10-11 05:03:53.702
loc-zm-tena-lusaka-d-kalingalinga	Kalingalinga	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.493	2026-10-11 05:03:53.704
loc-zm-tena-lusaka-d-mtendere	Mtendere	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.497	2026-10-11 05:03:53.706
loc-zm-tena-lusaka-d-bauleni	Bauleni	COMMUNITY	4	loc-zm-tenant-lusaka-dist	tenant-zambia-realty-01	2026-10-11 05:03:52.501	2026-10-11 05:03:53.708
loc-zm-tenant-chilanga	Chilanga District	DISTRICT	3	loc-zm-tenant-lusaka	tenant-zambia-realty-01	2026-10-11 05:03:52.504	2026-10-11 05:03:53.71
loc-zm-tena-chilanga-mount-makulu	Mount Makulu	COMMUNITY	4	loc-zm-tenant-chilanga	tenant-zambia-realty-01	2026-10-11 05:03:52.506	2026-10-11 05:03:53.712
loc-zm-tena-chilanga-chilanga-central	Chilanga Central	COMMUNITY	4	loc-zm-tenant-chilanga	tenant-zambia-realty-01	2026-10-11 05:03:52.509	2026-10-11 05:03:53.714
loc-zm-tena-chilanga-musamba	Musamba	COMMUNITY	4	loc-zm-tenant-chilanga	tenant-zambia-realty-01	2026-10-11 05:03:52.513	2026-10-11 05:03:53.716
loc-zm-tenant-z-root	Zambia	COUNTRY	1	\N	tenant-zambia-realty-01	2026-10-11 05:03:52.37	2026-10-11 05:30:51.017
loc-zm-tenant-kafue	Kafue District	DISTRICT	3	loc-zm-tenant-lusaka	tenant-zambia-realty-01	2026-10-11 05:03:52.521	2026-10-11 05:03:53.719
loc-zm-tena-kafue-shikoswe	Shikoswe	COMMUNITY	4	loc-zm-tenant-kafue	tenant-zambia-realty-01	2026-10-11 05:03:52.524	2026-10-11 05:03:53.721
loc-zm-tena-kafue-kafue-estates	Kafue Estates	COMMUNITY	4	loc-zm-tenant-kafue	tenant-zambia-realty-01	2026-10-11 05:03:52.527	2026-10-11 05:03:53.723
loc-zm-tena-kafue-zambia-compound-kafue	Zambia Compound Kafue	COMMUNITY	4	loc-zm-tenant-kafue	tenant-zambia-realty-01	2026-10-11 05:03:52.531	2026-10-11 05:03:53.725
loc-zm-tena-kafue-kasanya	Kasanya	COMMUNITY	4	loc-zm-tenant-kafue	tenant-zambia-realty-01	2026-10-11 05:03:52.533	2026-10-11 05:03:53.727
loc-zm-tenant-chongwe	Chongwe District	DISTRICT	3	loc-zm-tenant-lusaka	tenant-zambia-realty-01	2026-10-11 05:03:52.536	2026-10-11 05:03:53.729
loc-zm-tena-chongwe-silverest-east	Silverest East	COMMUNITY	4	loc-zm-tenant-chongwe	tenant-zambia-realty-01	2026-10-11 05:03:52.541	2026-10-11 05:03:53.733
loc-zm-tena-chongwe-chalimbana	Chalimbana	COMMUNITY	4	loc-zm-tenant-chongwe	tenant-zambia-realty-01	2026-10-11 05:03:52.544	2026-10-11 05:03:53.735
loc-zm-tena-chongwe-kanakantapa	Kanakantapa	COMMUNITY	4	loc-zm-tenant-chongwe	tenant-zambia-realty-01	2026-10-11 05:03:52.547	2026-10-11 05:03:53.737
loc-zm-tenant-luangwa	Luangwa District	DISTRICT	3	loc-zm-tenant-lusaka	tenant-zambia-realty-01	2026-10-11 05:03:52.549	2026-10-11 05:03:53.739
loc-zm-tena-luangwa-feira	Feira	COMMUNITY	4	loc-zm-tenant-luangwa	tenant-zambia-realty-01	2026-10-11 05:03:52.552	2026-10-11 05:03:53.741
loc-zm-tena-luangwa-luangwa-boma	Luangwa Boma	COMMUNITY	4	loc-zm-tenant-luangwa	tenant-zambia-realty-01	2026-10-11 05:03:52.554	2026-10-11 05:03:53.745
loc-zm-tena-luangwa-kaunga	Kaunga	COMMUNITY	4	loc-zm-tenant-luangwa	tenant-zambia-realty-01	2026-10-11 05:03:52.557	2026-10-11 05:03:53.747
loc-zm-tenant-chirundu	Chirundu District	DISTRICT	3	loc-zm-tenant-lusaka	tenant-zambia-realty-01	2026-10-11 05:03:52.56	2026-10-11 05:03:53.749
loc-zm-tena-chirundu-chirundu-border	Chirundu Border	COMMUNITY	4	loc-zm-tenant-chirundu	tenant-zambia-realty-01	2026-10-11 05:03:52.562	2026-10-11 05:03:53.751
loc-zm-tena-chirundu-highview-chirundu	Highview Chirundu	COMMUNITY	4	loc-zm-tenant-chirundu	tenant-zambia-realty-01	2026-10-11 05:03:52.565	2026-10-11 05:03:53.754
loc-zm-tena-chirundu-mission-area	Mission Area	COMMUNITY	4	loc-zm-tenant-chirundu	tenant-zambia-realty-01	2026-10-11 05:03:52.568	2026-10-11 05:03:53.756
loc-zm-tenant-rufunsa	Rufunsa District	DISTRICT	3	loc-zm-tenant-lusaka	tenant-zambia-realty-01	2026-10-11 05:03:52.571	2026-10-11 05:03:53.759
loc-zm-tena-rufunsa-rufunsa-boma	Rufunsa Boma	COMMUNITY	4	loc-zm-tenant-rufunsa	tenant-zambia-realty-01	2026-10-11 05:03:52.573	2026-10-11 05:03:53.761
loc-zm-tena-rufunsa-mpanshya	Mpanshya	COMMUNITY	4	loc-zm-tenant-rufunsa	tenant-zambia-realty-01	2026-10-11 05:03:52.576	2026-10-11 05:03:53.763
loc-zm-tena-rufunsa-chinyunyu-hot-springs	Chinyunyu Hot Springs	COMMUNITY	4	loc-zm-tenant-rufunsa	tenant-zambia-realty-01	2026-10-11 05:03:52.579	2026-10-11 05:03:53.765
loc-zm-tenant-shibuyunji-lus	Shibuyunji District	DISTRICT	3	loc-zm-tenant-lusaka	tenant-zambia-realty-01	2026-10-11 05:03:52.582	2026-10-11 05:03:53.767
loc-zm-tena-shibuyun-shibuyunji-boma	Shibuyunji Boma	COMMUNITY	4	loc-zm-tenant-shibuyunji-lus	tenant-zambia-realty-01	2026-10-11 05:03:52.584	2026-10-11 05:03:53.77
loc-zm-tena-shibuyun-nampundwe-mine-community	Nampundwe Mine Community	COMMUNITY	4	loc-zm-tenant-shibuyunji-lus	tenant-zambia-realty-01	2026-10-11 05:03:52.587	2026-10-11 05:03:53.772
loc-zm-tenant-kitwe	Kitwe District	DISTRICT	3	loc-zm-tenant-copperbelt	tenant-zambia-realty-01	2026-10-11 05:03:52.593	2026-10-11 05:03:53.777
loc-zm-tena-kitwe-riverside	Riverside	COMMUNITY	4	loc-zm-tenant-kitwe	tenant-zambia-realty-01	2026-10-11 05:03:52.596	2026-10-11 05:03:53.779
loc-zm-tena-kitwe-parklands	Parklands	COMMUNITY	4	loc-zm-tenant-kitwe	tenant-zambia-realty-01	2026-10-11 05:03:52.598	2026-10-11 05:03:53.781
loc-zm-tena-kitwe-nkana-east	Nkana East	COMMUNITY	4	loc-zm-tenant-kitwe	tenant-zambia-realty-01	2026-10-11 05:03:52.601	2026-10-11 05:03:53.782
loc-zm-tena-kitwe-nkana-west	Nkana West	COMMUNITY	4	loc-zm-tenant-kitwe	tenant-zambia-realty-01	2026-10-11 05:03:52.604	2026-10-11 05:03:53.784
loc-zm-tena-kitwe-chimwemwe	Chimwemwe	COMMUNITY	4	loc-zm-tenant-kitwe	tenant-zambia-realty-01	2026-10-11 05:03:52.607	2026-10-11 05:03:53.786
loc-zm-tena-kitwe-kwacha	Kwacha	COMMUNITY	4	loc-zm-tenant-kitwe	tenant-zambia-realty-01	2026-10-11 05:03:52.609	2026-10-11 05:03:53.789
loc-zm-tena-kitwe-garneton	Garneton	COMMUNITY	4	loc-zm-tenant-kitwe	tenant-zambia-realty-01	2026-10-11 05:03:52.612	2026-10-11 05:03:53.791
loc-zm-tena-kitwe-mindolo	Mindolo	COMMUNITY	4	loc-zm-tenant-kitwe	tenant-zambia-realty-01	2026-10-11 05:03:52.615	2026-10-11 05:03:53.793
loc-zm-tena-kitwe-wusakile	Wusakile	COMMUNITY	4	loc-zm-tenant-kitwe	tenant-zambia-realty-01	2026-10-11 05:03:52.618	2026-10-11 05:03:53.795
loc-zm-tena-kitwe-chamboli	Chamboli	COMMUNITY	4	loc-zm-tenant-kitwe	tenant-zambia-realty-01	2026-10-11 05:03:52.621	2026-10-11 05:03:53.797
loc-zm-tena-kitwe-buchi	Buchi	COMMUNITY	4	loc-zm-tenant-kitwe	tenant-zambia-realty-01	2026-10-11 05:03:52.623	2026-10-11 05:03:53.799
loc-zm-tena-kitwe-luangwa-kitwe	Luangwa Kitwe	COMMUNITY	4	loc-zm-tenant-kitwe	tenant-zambia-realty-01	2026-10-11 05:03:52.626	2026-10-11 05:03:53.801
loc-zm-tena-kitwe-bulangililo	Bulangililo	COMMUNITY	4	loc-zm-tenant-kitwe	tenant-zambia-realty-01	2026-10-11 05:03:52.629	2026-10-11 05:03:53.803
loc-zm-tena-kitwe-chachacha	Chachacha	COMMUNITY	4	loc-zm-tenant-kitwe	tenant-zambia-realty-01	2026-10-11 05:03:52.631	2026-10-11 05:03:53.805
loc-zm-tenant-ndola	Ndola District	DISTRICT	3	loc-zm-tenant-copperbelt	tenant-zambia-realty-01	2026-10-11 05:03:52.634	2026-10-11 05:03:53.807
loc-zm-tena-ndola-kansenshi	Kansenshi	COMMUNITY	4	loc-zm-tenant-ndola	tenant-zambia-realty-01	2026-10-11 05:03:52.637	2026-10-11 05:03:53.809
loc-zm-tena-ndola-northrise	Northrise	COMMUNITY	4	loc-zm-tenant-ndola	tenant-zambia-realty-01	2026-10-11 05:03:52.64	2026-10-11 05:03:53.811
loc-zm-tena-ndola-itawa	Itawa	COMMUNITY	4	loc-zm-tenant-ndola	tenant-zambia-realty-01	2026-10-11 05:03:52.642	2026-10-11 05:03:53.813
loc-zm-tena-ndola-hillcrest	Hillcrest	COMMUNITY	4	loc-zm-tenant-ndola	tenant-zambia-realty-01	2026-10-11 05:03:52.645	2026-10-11 05:03:53.815
loc-zm-tena-ndola-masala	Masala	COMMUNITY	4	loc-zm-tenant-ndola	tenant-zambia-realty-01	2026-10-11 05:03:52.647	2026-10-11 05:03:53.816
loc-zm-tena-ndola-chifubu	Chifubu	COMMUNITY	4	loc-zm-tenant-ndola	tenant-zambia-realty-01	2026-10-11 05:03:52.65	2026-10-11 05:03:53.818
loc-zm-tena-ndola-lubuto	Lubuto	COMMUNITY	4	loc-zm-tenant-ndola	tenant-zambia-realty-01	2026-10-11 05:03:52.653	2026-10-11 05:03:53.82
loc-zm-tena-ndola-twapia	Twapia	COMMUNITY	4	loc-zm-tenant-ndola	tenant-zambia-realty-01	2026-10-11 05:03:52.655	2026-10-11 05:03:53.822
loc-zm-tena-ndola-mushili	Mushili	COMMUNITY	4	loc-zm-tenant-ndola	tenant-zambia-realty-01	2026-10-11 05:03:52.658	2026-10-11 05:03:53.824
loc-zm-tena-ndola-kabushi	Kabushi	COMMUNITY	4	loc-zm-tenant-ndola	tenant-zambia-realty-01	2026-10-11 05:03:52.661	2026-10-11 05:03:53.826
loc-zm-tenant-chingola	Chingola District	DISTRICT	3	loc-zm-tenant-copperbelt	tenant-zambia-realty-01	2026-10-11 05:03:52.666	2026-10-11 05:03:53.83
loc-zm-tenant-copperbelt	Copperbelt Province	PROVINCE	2	loc-zm-tenant-z-root	tenant-zambia-realty-01	2026-10-11 05:03:52.59	2026-10-11 19:51:11.208
loc-zm-tena-chingola-nchanga-south	Nchanga South	COMMUNITY	4	loc-zm-tenant-chingola	tenant-zambia-realty-01	2026-10-11 05:03:52.672	2026-10-11 05:03:53.834
loc-zm-tena-chingola-chiwempala	Chiwempala	COMMUNITY	4	loc-zm-tenant-chingola	tenant-zambia-realty-01	2026-10-11 05:03:52.677	2026-10-11 05:03:53.838
loc-zm-tena-chingola-kabundi	Kabundi	COMMUNITY	4	loc-zm-tenant-chingola	tenant-zambia-realty-01	2026-10-11 05:03:52.68	2026-10-11 05:03:53.84
loc-zm-tena-chingola-kasompe	Kasompe	COMMUNITY	4	loc-zm-tenant-chingola	tenant-zambia-realty-01	2026-10-11 05:03:52.683	2026-10-11 05:03:53.842
loc-zm-tenant-mufulira	Mufulira District	DISTRICT	3	loc-zm-tenant-copperbelt	tenant-zambia-realty-01	2026-10-11 05:03:52.685	2026-10-11 05:03:53.844
loc-zm-tena-mufulira-kantanshi	Kantanshi	COMMUNITY	4	loc-zm-tenant-mufulira	tenant-zambia-realty-01	2026-10-11 05:03:52.688	2026-10-11 05:03:53.847
loc-zm-tena-mufulira-kamuchanga	Kamuchanga	COMMUNITY	4	loc-zm-tenant-mufulira	tenant-zambia-realty-01	2026-10-11 05:03:52.69	2026-10-11 05:03:53.849
loc-zm-tena-mufulira-fairview-mufulira	Fairview Mufulira	COMMUNITY	4	loc-zm-tenant-mufulira	tenant-zambia-realty-01	2026-10-11 05:03:52.693	2026-10-11 05:03:53.852
loc-zm-tena-mufulira-kansuswa	Kansuswa	COMMUNITY	4	loc-zm-tenant-mufulira	tenant-zambia-realty-01	2026-10-11 05:03:52.696	2026-10-11 05:03:53.854
loc-zm-tena-mufulira-eastlea	Eastlea	COMMUNITY	4	loc-zm-tenant-mufulira	tenant-zambia-realty-01	2026-10-11 05:03:52.699	2026-10-11 05:03:53.856
loc-zm-tenant-luanshya	Luanshya District	DISTRICT	3	loc-zm-tenant-copperbelt	tenant-zambia-realty-01	2026-10-11 05:03:52.702	2026-10-11 05:03:53.858
loc-zm-tena-luanshya-mikomfwa	Mikomfwa	COMMUNITY	4	loc-zm-tenant-luanshya	tenant-zambia-realty-01	2026-10-11 05:03:52.704	2026-10-11 05:03:53.86
loc-zm-tena-luanshya-roan	Roan	COMMUNITY	4	loc-zm-tenant-luanshya	tenant-zambia-realty-01	2026-10-11 05:03:52.707	2026-10-11 05:03:53.862
loc-zm-tena-luanshya-mpatamatu	Mpatamatu	COMMUNITY	4	loc-zm-tenant-luanshya	tenant-zambia-realty-01	2026-10-11 05:03:52.709	2026-10-11 05:03:53.864
loc-zm-tena-luanshya-new-town-luanshya	New Town Luanshya	COMMUNITY	4	loc-zm-tenant-luanshya	tenant-zambia-realty-01	2026-10-11 05:03:52.712	2026-10-11 05:03:53.866
loc-zm-tena-luanshya-town-centre-luanshya	Town Centre Luanshya	COMMUNITY	4	loc-zm-tenant-luanshya	tenant-zambia-realty-01	2026-10-11 05:03:52.715	2026-10-11 05:03:53.868
loc-zm-tenant-kalulushi	Kalulushi District	DISTRICT	3	loc-zm-tenant-copperbelt	tenant-zambia-realty-01	2026-10-11 05:03:52.718	2026-10-11 05:03:53.87
loc-zm-tena-kalulush-chibuluma	Chibuluma	COMMUNITY	4	loc-zm-tenant-kalulushi	tenant-zambia-realty-01	2026-10-11 05:03:52.72	2026-10-11 05:03:53.872
loc-zm-tena-kalulush-kalulushi-central	Kalulushi Central	COMMUNITY	4	loc-zm-tenant-kalulushi	tenant-zambia-realty-01	2026-10-11 05:03:52.724	2026-10-11 05:03:53.874
loc-zm-tena-kalulush-southdowns	Southdowns	COMMUNITY	4	loc-zm-tenant-kalulushi	tenant-zambia-realty-01	2026-10-11 05:03:52.726	2026-10-11 05:03:53.876
loc-zm-tena-kalulush-chambishi-township	Chambishi Township	COMMUNITY	4	loc-zm-tenant-kalulushi	tenant-zambia-realty-01	2026-10-11 05:03:52.729	2026-10-11 05:03:53.878
loc-zm-tenant-chililabombwe	Chililabombwe District	DISTRICT	3	loc-zm-tenant-copperbelt	tenant-zambia-realty-01	2026-10-11 05:03:52.732	2026-10-11 05:03:53.881
loc-zm-tena-chililab-konkola	Konkola	COMMUNITY	4	loc-zm-tenant-chililabombwe	tenant-zambia-realty-01	2026-10-11 05:03:52.734	2026-10-11 05:03:53.883
loc-zm-tena-chililab-kamenza	Kamenza	COMMUNITY	4	loc-zm-tenant-chililabombwe	tenant-zambia-realty-01	2026-10-11 05:03:52.737	2026-10-11 05:03:53.885
loc-zm-tena-chililab-lubengele	Lubengele	COMMUNITY	4	loc-zm-tenant-chililabombwe	tenant-zambia-realty-01	2026-10-11 05:03:52.739	2026-10-11 05:03:53.887
loc-zm-tena-chililab-kakoso	Kakoso	COMMUNITY	4	loc-zm-tenant-chililabombwe	tenant-zambia-realty-01	2026-10-11 05:03:52.742	2026-10-11 05:03:53.89
loc-zm-tena-chililab-kasumbalesa-border	Kasumbalesa Border	COMMUNITY	4	loc-zm-tenant-chililabombwe	tenant-zambia-realty-01	2026-10-11 05:03:52.745	2026-10-11 05:03:53.892
loc-zm-tenant-lufwanyama	Lufwanyama District	DISTRICT	3	loc-zm-tenant-copperbelt	tenant-zambia-realty-01	2026-10-11 05:03:52.748	2026-10-11 05:03:53.894
loc-zm-tena-lufwanya-lufwanyama-boma	Lufwanyama Boma	COMMUNITY	4	loc-zm-tenant-lufwanyama	tenant-zambia-realty-01	2026-10-11 05:03:52.751	2026-10-11 05:03:53.896
loc-zm-tena-lufwanya-kagem-emerald-belt	Kagem Emerald Belt	COMMUNITY	4	loc-zm-tenant-lufwanyama	tenant-zambia-realty-01	2026-10-11 05:03:52.753	2026-10-11 05:03:53.898
loc-zm-tena-lufwanya-chantete	Chantete	COMMUNITY	4	loc-zm-tenant-lufwanyama	tenant-zambia-realty-01	2026-10-11 05:03:52.755	2026-10-11 05:03:53.9
loc-zm-tenant-masaiti	Masaiti District	DISTRICT	3	loc-zm-tenant-copperbelt	tenant-zambia-realty-01	2026-10-11 05:03:52.758	2026-10-11 05:03:53.902
loc-zm-tena-masaiti-masaiti-boma	Masaiti Boma	COMMUNITY	4	loc-zm-tenant-masaiti	tenant-zambia-realty-01	2026-10-11 05:03:52.76	2026-10-11 05:03:53.904
loc-zm-tena-masaiti-kafulafuta	Kafulafuta	COMMUNITY	4	loc-zm-tenant-masaiti	tenant-zambia-realty-01	2026-10-11 05:03:52.763	2026-10-11 05:03:53.906
loc-zm-tena-masaiti-mishikishi	Mishikishi	COMMUNITY	4	loc-zm-tenant-masaiti	tenant-zambia-realty-01	2026-10-11 05:03:52.765	2026-10-11 05:03:53.908
loc-zm-tenant-mpongwe	Mpongwe District	DISTRICT	3	loc-zm-tenant-copperbelt	tenant-zambia-realty-01	2026-10-11 05:03:52.768	2026-10-11 05:03:53.91
loc-zm-tena-mpongwe-mpongwe-central	Mpongwe Central	COMMUNITY	4	loc-zm-tenant-mpongwe	tenant-zambia-realty-01	2026-10-11 05:03:52.77	2026-10-11 05:03:53.913
loc-zm-tena-mpongwe-ibenga-mission	Ibenga Mission	COMMUNITY	4	loc-zm-tenant-mpongwe	tenant-zambia-realty-01	2026-10-11 05:03:52.773	2026-10-11 05:03:53.915
loc-zm-tena-mpongwe-mpongwe-farming-block	Mpongwe Farming Block	COMMUNITY	4	loc-zm-tenant-mpongwe	tenant-zambia-realty-01	2026-10-11 05:03:52.776	2026-10-11 05:03:53.917
loc-zm-tenant-kabwe	Kabwe District	DISTRICT	3	loc-zm-tenant-central	tenant-zambia-realty-01	2026-10-11 05:03:52.781	2026-10-11 05:03:53.921
loc-zm-tena-kabwe-bwacha	Bwacha	COMMUNITY	4	loc-zm-tenant-kabwe	tenant-zambia-realty-01	2026-10-11 05:03:52.783	2026-10-11 05:03:53.923
loc-zm-tena-kabwe-highridge	Highridge	COMMUNITY	4	loc-zm-tenant-kabwe	tenant-zambia-realty-01	2026-10-11 05:03:52.786	2026-10-11 05:03:53.925
loc-zm-tena-kabwe-makululu	Makululu	COMMUNITY	4	loc-zm-tenant-kabwe	tenant-zambia-realty-01	2026-10-11 05:03:52.788	2026-10-11 05:03:53.927
loc-zm-tena-kabwe-chowa	Chowa	COMMUNITY	4	loc-zm-tenant-kabwe	tenant-zambia-realty-01	2026-10-11 05:03:52.79	2026-10-11 05:03:53.929
loc-zm-tena-kabwe-lukanga	Lukanga	COMMUNITY	4	loc-zm-tenant-kabwe	tenant-zambia-realty-01	2026-10-11 05:03:52.793	2026-10-11 05:03:53.932
loc-zm-tena-kabwe-ngungu	Ngungu	COMMUNITY	4	loc-zm-tenant-kabwe	tenant-zambia-realty-01	2026-10-11 05:03:52.795	2026-10-11 05:03:53.934
loc-zm-tenant-kapiri	Kapiri Mposhi District	DISTRICT	3	loc-zm-tenant-central	tenant-zambia-realty-01	2026-10-11 05:03:52.8	2026-10-11 05:03:53.938
loc-zm-tena-kapiri-tazara-township	Tazara Township	COMMUNITY	4	loc-zm-tenant-kapiri	tenant-zambia-realty-01	2026-10-11 05:03:52.802	2026-10-11 05:03:53.94
loc-zm-tena-kapiri-nkolonga	Nkolonga	COMMUNITY	4	loc-zm-tenant-kapiri	tenant-zambia-realty-01	2026-10-11 05:03:52.805	2026-10-11 05:03:53.942
loc-zm-tenant-central	Central Province	PROVINCE	2	loc-zm-tenant-z-root	tenant-zambia-realty-01	2026-10-11 05:03:52.778	2026-10-11 19:51:11.208
loc-zm-tena-kapiri-riverside-kapiri	Riverside Kapiri	COMMUNITY	4	loc-zm-tenant-kapiri	tenant-zambia-realty-01	2026-10-11 05:03:52.809	2026-10-11 05:03:53.946
loc-zm-tenant-serenje	Serenje District	DISTRICT	3	loc-zm-tenant-central	tenant-zambia-realty-01	2026-10-11 05:03:52.812	2026-10-11 05:03:53.948
loc-zm-tena-serenje-serenje-boma	Serenje Boma	COMMUNITY	4	loc-zm-tenant-serenje	tenant-zambia-realty-01	2026-10-11 05:03:52.814	2026-10-11 05:03:53.95
loc-zm-tena-serenje-kanona	Kanona	COMMUNITY	4	loc-zm-tenant-serenje	tenant-zambia-realty-01	2026-10-11 05:03:52.816	2026-10-11 05:03:53.963
loc-zm-tena-serenje-mulembo	Mulembo	COMMUNITY	4	loc-zm-tenant-serenje	tenant-zambia-realty-01	2026-10-11 05:03:52.819	2026-10-11 05:03:53.971
loc-zm-tena-serenje-kundalila-falls-communit	Kundalila Falls Community	COMMUNITY	4	loc-zm-tenant-serenje	tenant-zambia-realty-01	2026-10-11 05:03:52.822	2026-10-11 05:03:53.975
loc-zm-tenant-mkushi	Mkushi District	DISTRICT	3	loc-zm-tenant-central	tenant-zambia-realty-01	2026-10-11 05:03:52.824	2026-10-11 05:03:53.977
loc-zm-tena-mkushi-mkushi-farming-block	Mkushi Farming Block	COMMUNITY	4	loc-zm-tenant-mkushi	tenant-zambia-realty-01	2026-10-11 05:03:52.826	2026-10-11 05:03:53.981
loc-zm-tena-mkushi-mkushi-central	Mkushi Central	COMMUNITY	4	loc-zm-tenant-mkushi	tenant-zambia-realty-01	2026-10-11 05:03:52.829	2026-10-11 05:03:53.984
loc-zm-tena-mkushi-chalata	Chalata	COMMUNITY	4	loc-zm-tenant-mkushi	tenant-zambia-realty-01	2026-10-11 05:03:52.831	2026-10-11 05:03:53.986
loc-zm-tena-mkushi-upper-lunsemfwa	Upper Lunsemfwa	COMMUNITY	4	loc-zm-tenant-mkushi	tenant-zambia-realty-01	2026-10-11 05:03:52.834	2026-10-11 05:03:53.988
loc-zm-tenant-chibombo	Chibombo District	DISTRICT	3	loc-zm-tenant-central	tenant-zambia-realty-01	2026-10-11 05:03:52.837	2026-10-11 05:03:53.99
loc-zm-tena-chibombo-liteta	Liteta	COMMUNITY	4	loc-zm-tenant-chibombo	tenant-zambia-realty-01	2026-10-11 05:03:52.842	2026-10-11 05:03:53.994
loc-zm-tena-chibombo-keembe	Keembe	COMMUNITY	4	loc-zm-tenant-chibombo	tenant-zambia-realty-01	2026-10-11 05:03:52.845	2026-10-11 05:03:53.996
loc-zm-tena-chibombo-ipongo	Ipongo	COMMUNITY	4	loc-zm-tenant-chibombo	tenant-zambia-realty-01	2026-10-11 05:03:52.848	2026-10-11 05:03:53.999
loc-zm-tenant-chisamba	Chisamba District	DISTRICT	3	loc-zm-tenant-central	tenant-zambia-realty-01	2026-10-11 05:03:52.852	2026-10-11 05:03:54.001
loc-zm-tena-chisamba-chisamba-town	Chisamba Town	COMMUNITY	4	loc-zm-tenant-chisamba	tenant-zambia-realty-01	2026-10-11 05:03:52.855	2026-10-11 05:03:54.003
loc-zm-tena-chisamba-golden-valley-agricultur	Golden Valley Agricultural Hub	COMMUNITY	4	loc-zm-tenant-chisamba	tenant-zambia-realty-01	2026-10-11 05:03:52.858	2026-10-11 05:03:54.005
loc-zm-tena-chisamba-chamuka	Chamuka	COMMUNITY	4	loc-zm-tenant-chisamba	tenant-zambia-realty-01	2026-10-11 05:03:52.861	2026-10-11 05:03:54.007
loc-zm-tenant-luano	Luano District	DISTRICT	3	loc-zm-tenant-central	tenant-zambia-realty-01	2026-10-11 05:03:52.864	2026-10-11 05:03:54.009
loc-zm-tena-luano-old-mkushi	Old Mkushi	COMMUNITY	4	loc-zm-tenant-luano	tenant-zambia-realty-01	2026-10-11 05:03:52.867	2026-10-11 05:03:54.011
loc-zm-tena-luano-luano-valley-center	Luano Valley Center	COMMUNITY	4	loc-zm-tenant-luano	tenant-zambia-realty-01	2026-10-11 05:03:52.871	2026-10-11 05:03:54.013
loc-zm-tena-luano-mboroma	Mboroma	COMMUNITY	4	loc-zm-tenant-luano	tenant-zambia-realty-01	2026-10-11 05:03:52.874	2026-10-11 05:03:54.015
loc-zm-tenant-ngabwe	Ngabwe District	DISTRICT	3	loc-zm-tenant-central	tenant-zambia-realty-01	2026-10-11 05:03:52.877	2026-10-11 05:03:54.017
loc-zm-tena-ngabwe-ngabwe-boma	Ngabwe Boma	COMMUNITY	4	loc-zm-tenant-ngabwe	tenant-zambia-realty-01	2026-10-11 05:03:52.879	2026-10-11 05:03:54.019
loc-zm-tena-ngabwe-kafue-flats-north	Kafue Flats North	COMMUNITY	4	loc-zm-tenant-ngabwe	tenant-zambia-realty-01	2026-10-11 05:03:52.882	2026-10-11 05:03:54.022
loc-zm-tena-ngabwe-munyeke	Munyeke	COMMUNITY	4	loc-zm-tenant-ngabwe	tenant-zambia-realty-01	2026-10-11 05:03:52.885	2026-10-11 05:03:54.024
loc-zm-tenant-itezhi-tezhi	Itezhi-Tezhi District	DISTRICT	3	loc-zm-tenant-central	tenant-zambia-realty-01	2026-10-11 05:03:52.888	2026-10-11 05:03:54.026
loc-zm-tena-itezhi-t-itezhi-tezhi-town	Itezhi-Tezhi Town	COMMUNITY	4	loc-zm-tenant-itezhi-tezhi	tenant-zambia-realty-01	2026-10-11 05:03:52.891	2026-10-11 05:03:54.028
loc-zm-tena-itezhi-t-dam-view-community	Dam View Community	COMMUNITY	4	loc-zm-tenant-itezhi-tezhi	tenant-zambia-realty-01	2026-10-11 05:03:52.893	2026-10-11 05:03:54.03
loc-zm-tena-itezhi-t-kaanzwa	Kaanzwa	COMMUNITY	4	loc-zm-tenant-itezhi-tezhi	tenant-zambia-realty-01	2026-10-11 05:03:52.896	2026-10-11 05:03:54.032
loc-zm-tenant-livingstone	Livingstone District	DISTRICT	3	loc-zm-tenant-southern	tenant-zambia-realty-01	2026-10-11 05:03:52.903	2026-10-11 05:03:54.036
loc-zm-tena-livingst-dambwa-north	Dambwa North	COMMUNITY	4	loc-zm-tenant-livingstone	tenant-zambia-realty-01	2026-10-11 05:03:52.905	2026-10-11 05:03:54.038
loc-zm-tena-livingst-dambwa-south	Dambwa South	COMMUNITY	4	loc-zm-tenant-livingstone	tenant-zambia-realty-01	2026-10-11 05:03:52.908	2026-10-11 05:03:54.04
loc-zm-tena-livingst-maramba	Maramba	COMMUNITY	4	loc-zm-tenant-livingstone	tenant-zambia-realty-01	2026-10-11 05:03:52.91	2026-10-11 05:03:54.042
loc-zm-tena-livingst-highlands-livingstone	Highlands Livingstone	COMMUNITY	4	loc-zm-tenant-livingstone	tenant-zambia-realty-01	2026-10-11 05:03:52.912	2026-10-11 05:03:54.044
loc-zm-tena-livingst-linda	Linda	COMMUNITY	4	loc-zm-tenant-livingstone	tenant-zambia-realty-01	2026-10-11 05:03:52.915	2026-10-11 05:03:54.046
loc-zm-tena-livingst-falls-view	Falls View	COMMUNITY	4	loc-zm-tenant-livingstone	tenant-zambia-realty-01	2026-10-11 05:03:52.918	2026-10-11 05:03:54.049
loc-zm-tena-livingst-airport-area	Airport Area	COMMUNITY	4	loc-zm-tenant-livingstone	tenant-zambia-realty-01	2026-10-11 05:03:52.92	2026-10-11 05:03:54.051
loc-zm-tena-livingst-town-centre-livingstone	Town Centre Livingstone	COMMUNITY	4	loc-zm-tenant-livingstone	tenant-zambia-realty-01	2026-10-11 05:03:52.923	2026-10-11 05:03:54.053
loc-zm-tenant-choma	Choma District	DISTRICT	3	loc-zm-tenant-southern	tenant-zambia-realty-01	2026-10-11 05:03:52.925	2026-10-11 05:03:54.055
loc-zm-tena-choma-shampande	Shampande	COMMUNITY	4	loc-zm-tenant-choma	tenant-zambia-realty-01	2026-10-11 05:03:52.927	2026-10-11 05:03:54.057
loc-zm-tena-choma-macha-road	Macha Road	COMMUNITY	4	loc-zm-tenant-choma	tenant-zambia-realty-01	2026-10-11 05:03:52.93	2026-10-11 05:03:54.06
loc-zm-tena-choma-town-centre-choma	Town Centre Choma	COMMUNITY	4	loc-zm-tenant-choma	tenant-zambia-realty-01	2026-10-11 05:03:52.933	2026-10-11 05:03:54.062
loc-zm-tena-choma-riverside-choma	Riverside Choma	COMMUNITY	4	loc-zm-tenant-choma	tenant-zambia-realty-01	2026-10-11 05:03:52.935	2026-10-11 05:03:54.064
loc-zm-tena-choma-batoka	Batoka	COMMUNITY	4	loc-zm-tenant-choma	tenant-zambia-realty-01	2026-10-11 05:03:52.938	2026-10-11 05:03:54.066
loc-zm-tenant-mazabuka	Mazabuka District	DISTRICT	3	loc-zm-tenant-southern	tenant-zambia-realty-01	2026-10-11 05:03:52.94	2026-10-11 05:03:54.069
loc-zm-tena-mazabuka-hillside-mazabuka	Hillside Mazabuka	COMMUNITY	4	loc-zm-tenant-mazabuka	tenant-zambia-realty-01	2026-10-11 05:03:52.945	2026-10-11 05:03:54.073
loc-zm-tenant-southern	Southern Province	PROVINCE	2	loc-zm-tenant-z-root	tenant-zambia-realty-01	2026-10-11 05:03:52.899	2026-10-11 19:51:11.208
loc-zm-tena-mazabuka-kabobola	Kabobola	COMMUNITY	4	loc-zm-tenant-mazabuka	tenant-zambia-realty-01	2026-10-11 05:03:52.951	2026-10-11 05:03:54.077
loc-zm-tena-mazabuka-nega-nega	Nega Nega	COMMUNITY	4	loc-zm-tenant-mazabuka	tenant-zambia-realty-01	2026-10-11 05:03:52.954	2026-10-11 05:03:54.079
loc-zm-tenant-monze	Monze District	DISTRICT	3	loc-zm-tenant-southern	tenant-zambia-realty-01	2026-10-11 05:03:52.956	2026-10-11 05:03:54.081
loc-zm-tena-monze-monze-urban	Monze Urban	COMMUNITY	4	loc-zm-tenant-monze	tenant-zambia-realty-01	2026-10-11 05:03:52.959	2026-10-11 05:03:54.083
loc-zm-tena-monze-manunka	Manunka	COMMUNITY	4	loc-zm-tenant-monze	tenant-zambia-realty-01	2026-10-11 05:03:52.961	2026-10-11 05:03:54.085
loc-zm-tena-monze-bwingi	Bwingi	COMMUNITY	4	loc-zm-tenant-monze	tenant-zambia-realty-01	2026-10-11 05:03:52.963	2026-10-11 05:03:54.087
loc-zm-tenant-kalomo	Kalomo District	DISTRICT	3	loc-zm-tenant-southern	tenant-zambia-realty-01	2026-10-11 05:03:52.969	2026-10-11 05:03:54.091
loc-zm-tena-kalomo-kalomo-central	Kalomo Central	COMMUNITY	4	loc-zm-tenant-kalomo	tenant-zambia-realty-01	2026-10-11 05:03:52.971	2026-10-11 05:03:54.093
loc-zm-tena-kalomo-mawaya	Mawaya	COMMUNITY	4	loc-zm-tenant-kalomo	tenant-zambia-realty-01	2026-10-11 05:03:52.974	2026-10-11 05:03:54.095
loc-zm-tena-kalomo-dundumwezi	Dundumwezi	COMMUNITY	4	loc-zm-tenant-kalomo	tenant-zambia-realty-01	2026-10-11 05:03:52.976	2026-10-11 05:03:54.097
loc-zm-tena-kalomo-siachitembo	Siachitembo	COMMUNITY	4	loc-zm-tenant-kalomo	tenant-zambia-realty-01	2026-10-11 05:03:52.979	2026-10-11 05:03:54.099
loc-zm-tenant-sinazongwe	Sinazongwe District	DISTRICT	3	loc-zm-tenant-southern	tenant-zambia-realty-01	2026-10-11 05:03:52.981	2026-10-11 05:03:54.101
loc-zm-tena-sinazong-sinazongwe-boma	Sinazongwe Boma	COMMUNITY	4	loc-zm-tenant-sinazongwe	tenant-zambia-realty-01	2026-10-11 05:03:52.984	2026-10-11 05:03:54.103
loc-zm-tena-sinazong-maamba-coal-mining-town	Maamba Coal Mining Town	COMMUNITY	4	loc-zm-tenant-sinazongwe	tenant-zambia-realty-01	2026-10-11 05:03:52.987	2026-10-11 05:03:54.105
loc-zm-tena-sinazong-sinazeze	Sinazeze	COMMUNITY	4	loc-zm-tenant-sinazongwe	tenant-zambia-realty-01	2026-10-11 05:03:52.99	2026-10-11 05:03:54.107
loc-zm-tenant-siavonga	Siavonga District	DISTRICT	3	loc-zm-tenant-southern	tenant-zambia-realty-01	2026-10-11 05:03:52.992	2026-10-11 05:03:54.109
loc-zm-tena-siavonga-kariba-lakeside	Kariba Lakeside	COMMUNITY	4	loc-zm-tenant-siavonga	tenant-zambia-realty-01	2026-10-11 05:03:52.995	2026-10-11 05:03:54.111
loc-zm-tena-siavonga-siavonga-boma	Siavonga Boma	COMMUNITY	4	loc-zm-tenant-siavonga	tenant-zambia-realty-01	2026-10-11 05:03:52.998	2026-10-11 05:03:54.113
loc-zm-tena-siavonga-high-view-siavonga	High View Siavonga	COMMUNITY	4	loc-zm-tenant-siavonga	tenant-zambia-realty-01	2026-10-11 05:03:53	2026-10-11 05:03:54.115
loc-zm-tena-siavonga-kalyangile	Kalyangile	COMMUNITY	4	loc-zm-tenant-siavonga	tenant-zambia-realty-01	2026-10-11 05:03:53.003	2026-10-11 05:03:54.117
loc-zm-tenant-kazungula	Kazungula District	DISTRICT	3	loc-zm-tenant-southern	tenant-zambia-realty-01	2026-10-11 05:03:53.005	2026-10-11 05:03:54.119
loc-zm-tena-kazungul-kazungula-border-village	Kazungula Border Village	COMMUNITY	4	loc-zm-tenant-kazungula	tenant-zambia-realty-01	2026-10-11 05:03:53.007	2026-10-11 05:03:54.121
loc-zm-tena-kazungul-lumbo	Lumbo	COMMUNITY	4	loc-zm-tenant-kazungula	tenant-zambia-realty-01	2026-10-11 05:03:53.01	2026-10-11 05:03:54.123
loc-zm-tena-kazungul-simungoma	Simungoma	COMMUNITY	4	loc-zm-tenant-kazungula	tenant-zambia-realty-01	2026-10-11 05:03:53.012	2026-10-11 05:03:54.125
loc-zm-tenant-zimba	Zimba District	DISTRICT	3	loc-zm-tenant-southern	tenant-zambia-realty-01	2026-10-11 05:03:53.014	2026-10-11 05:03:54.127
loc-zm-tena-zimba-zimba-mission-community	Zimba Mission Community	COMMUNITY	4	loc-zm-tenant-zimba	tenant-zambia-realty-01	2026-10-11 05:03:53.016	2026-10-11 05:03:54.129
loc-zm-tena-zimba-town-centre-zimba	Town Centre Zimba	COMMUNITY	4	loc-zm-tenant-zimba	tenant-zambia-realty-01	2026-10-11 05:03:53.019	2026-10-11 05:03:54.136
loc-zm-tenant-chikankata	Chikankata District	DISTRICT	3	loc-zm-tenant-southern	tenant-zambia-realty-01	2026-10-11 05:03:53.021	2026-10-11 05:03:54.141
loc-zm-tena-chikanka-chikankata-mission	Chikankata Mission	COMMUNITY	4	loc-zm-tenant-chikankata	tenant-zambia-realty-01	2026-10-11 05:03:53.023	2026-10-11 05:03:54.144
loc-zm-tena-chikanka-turnpike-junction	Turnpike Junction	COMMUNITY	4	loc-zm-tenant-chikankata	tenant-zambia-realty-01	2026-10-11 05:03:53.025	2026-10-11 05:03:54.149
loc-zm-tena-chikanka-kafue-gorge-upper	Kafue Gorge Upper	COMMUNITY	4	loc-zm-tenant-chikankata	tenant-zambia-realty-01	2026-10-11 05:03:53.028	2026-10-11 05:03:54.151
loc-zm-tenant-gwembe	Gwembe District	DISTRICT	3	loc-zm-tenant-southern	tenant-zambia-realty-01	2026-10-11 05:03:53.031	2026-10-11 05:03:54.154
loc-zm-tena-gwembe-gwembe-boma	Gwembe Boma	COMMUNITY	4	loc-zm-tenant-gwembe	tenant-zambia-realty-01	2026-10-11 05:03:53.033	2026-10-11 05:03:54.156
loc-zm-tena-gwembe-chipepo-port	Chipepo Port	COMMUNITY	4	loc-zm-tenant-gwembe	tenant-zambia-realty-01	2026-10-11 05:03:53.036	2026-10-11 05:03:54.158
loc-zm-tena-gwembe-munsi-hot-springs	Munsi Hot Springs	COMMUNITY	4	loc-zm-tenant-gwembe	tenant-zambia-realty-01	2026-10-11 05:03:53.038	2026-10-11 05:03:54.16
loc-zm-tenant-namwala	Namwala District	DISTRICT	3	loc-zm-tenant-southern	tenant-zambia-realty-01	2026-10-11 05:03:53.04	2026-10-11 05:03:54.162
loc-zm-tena-namwala-namwala-central	Namwala Central	COMMUNITY	4	loc-zm-tenant-namwala	tenant-zambia-realty-01	2026-10-11 05:03:53.042	2026-10-11 05:03:54.164
loc-zm-tena-namwala-baambwe	Baambwe	COMMUNITY	4	loc-zm-tenant-namwala	tenant-zambia-realty-01	2026-10-11 05:03:53.045	2026-10-11 05:03:54.166
loc-zm-tena-namwala-maala	Maala	COMMUNITY	4	loc-zm-tenant-namwala	tenant-zambia-realty-01	2026-10-11 05:03:53.048	2026-10-11 05:03:54.168
loc-zm-tenant-pemba	Pemba District	DISTRICT	3	loc-zm-tenant-southern	tenant-zambia-realty-01	2026-10-11 05:03:53.05	2026-10-11 05:03:54.17
loc-zm-tena-pemba-pemba-boma	Pemba Boma	COMMUNITY	4	loc-zm-tenant-pemba	tenant-zambia-realty-01	2026-10-11 05:03:53.052	2026-10-11 05:03:54.172
loc-zm-tenant-chipata	Chipata District	DISTRICT	3	loc-zm-tenant-eastern	tenant-zambia-realty-01	2026-10-11 05:03:53.058	2026-10-11 05:03:54.178
loc-zm-tena-chipata-kapata	Kapata	COMMUNITY	4	loc-zm-tenant-chipata	tenant-zambia-realty-01	2026-10-11 05:03:53.061	2026-10-11 05:03:54.18
loc-zm-tena-chipata-kalongwezi	Kalongwezi	COMMUNITY	4	loc-zm-tenant-chipata	tenant-zambia-realty-01	2026-10-11 05:03:53.063	2026-10-11 05:03:54.182
loc-zm-tena-chipata-moth-chipata	Moth Chipata	COMMUNITY	4	loc-zm-tenant-chipata	tenant-zambia-realty-01	2026-10-11 05:03:53.065	2026-10-11 05:03:54.184
loc-zm-tena-chipata-mchini	Mchini	COMMUNITY	4	loc-zm-tenant-chipata	tenant-zambia-realty-01	2026-10-11 05:03:53.068	2026-10-11 05:03:54.186
loc-zm-tena-chipata-umodzi	Umodzi	COMMUNITY	4	loc-zm-tenant-chipata	tenant-zambia-realty-01	2026-10-11 05:03:53.07	2026-10-11 05:03:54.188
loc-zm-tena-chipata-little-bombay	Little Bombay	COMMUNITY	4	loc-zm-tenant-chipata	tenant-zambia-realty-01	2026-10-11 05:03:53.072	2026-10-11 05:03:54.19
loc-zm-tena-chipata-nabvutika	Nabvutika	COMMUNITY	4	loc-zm-tenant-chipata	tenant-zambia-realty-01	2026-10-11 05:03:53.074	2026-10-11 05:03:54.192
loc-zm-tenant-eastern	Eastern Province	PROVINCE	2	loc-zm-tenant-z-root	tenant-zambia-realty-01	2026-10-11 05:03:53.057	2026-10-11 19:51:11.208
loc-zm-tenant-petauke	Petauke District	DISTRICT	3	loc-zm-tenant-eastern	tenant-zambia-realty-01	2026-10-11 05:03:53.079	2026-10-11 05:03:54.197
loc-zm-tena-petauke-petauke-urban	Petauke Urban	COMMUNITY	4	loc-zm-tenant-petauke	tenant-zambia-realty-01	2026-10-11 05:03:53.082	2026-10-11 05:03:54.199
loc-zm-tena-petauke-showgrounds-petauke	Showgrounds Petauke	COMMUNITY	4	loc-zm-tenant-petauke	tenant-zambia-realty-01	2026-10-11 05:03:53.084	2026-10-11 05:03:54.201
loc-zm-tena-petauke-nyika	Nyika	COMMUNITY	4	loc-zm-tenant-petauke	tenant-zambia-realty-01	2026-10-11 05:03:53.086	2026-10-11 05:03:54.203
loc-zm-tena-petauke-mingwe	Mingwe	COMMUNITY	4	loc-zm-tenant-petauke	tenant-zambia-realty-01	2026-10-11 05:03:53.088	2026-10-11 05:03:54.205
loc-zm-tenant-katete	Katete District	DISTRICT	3	loc-zm-tenant-eastern	tenant-zambia-realty-01	2026-10-11 05:03:53.09	2026-10-11 05:03:54.207
loc-zm-tena-katete-st--francis-mission-area	St. Francis Mission Area	COMMUNITY	4	loc-zm-tenant-katete	tenant-zambia-realty-01	2026-10-11 05:03:53.093	2026-10-11 05:03:54.209
loc-zm-tena-katete-katete-boma	Katete Boma	COMMUNITY	4	loc-zm-tenant-katete	tenant-zambia-realty-01	2026-10-11 05:03:53.095	2026-10-11 05:03:54.211
loc-zm-tena-katete-chindwale	Chindwale	COMMUNITY	4	loc-zm-tenant-katete	tenant-zambia-realty-01	2026-10-11 05:03:53.097	2026-10-11 05:03:54.213
loc-zm-tenant-lundazi	Lundazi District	DISTRICT	3	loc-zm-tenant-eastern	tenant-zambia-realty-01	2026-10-11 05:03:53.099	2026-10-11 05:03:54.216
loc-zm-tena-lundazi-castle-area-lundazi	Castle Area Lundazi	COMMUNITY	4	loc-zm-tenant-lundazi	tenant-zambia-realty-01	2026-10-11 05:03:53.101	2026-10-11 05:03:54.218
loc-zm-tena-lundazi-lundazi-urban	Lundazi Urban	COMMUNITY	4	loc-zm-tenant-lundazi	tenant-zambia-realty-01	2026-10-11 05:03:53.103	2026-10-11 05:03:54.22
loc-zm-tena-lundazi-chigoma	Chigoma	COMMUNITY	4	loc-zm-tenant-lundazi	tenant-zambia-realty-01	2026-10-11 05:03:53.105	2026-10-11 05:03:54.222
loc-zm-tenant-nyimba	Nyimba District	DISTRICT	3	loc-zm-tenant-eastern	tenant-zambia-realty-01	2026-10-11 05:03:53.107	2026-10-11 05:03:54.224
loc-zm-tena-nyimba-nyimba-boma	Nyimba Boma	COMMUNITY	4	loc-zm-tenant-nyimba	tenant-zambia-realty-01	2026-10-11 05:03:53.11	2026-10-11 05:03:54.226
loc-zm-tena-nyimba-kacholola	Kacholola	COMMUNITY	4	loc-zm-tenant-nyimba	tenant-zambia-realty-01	2026-10-11 05:03:53.112	2026-10-11 05:03:54.228
loc-zm-tena-nyimba-vizimumba	Vizimumba	COMMUNITY	4	loc-zm-tenant-nyimba	tenant-zambia-realty-01	2026-10-11 05:03:53.115	2026-10-11 05:03:54.231
loc-zm-tenant-mambwe	Mambwe District	DISTRICT	3	loc-zm-tenant-eastern	tenant-zambia-realty-01	2026-10-11 05:03:53.117	2026-10-11 05:03:54.233
loc-zm-tena-mambwe-south-luangwa-national-g	South Luangwa National Gate	COMMUNITY	4	loc-zm-tenant-mambwe	tenant-zambia-realty-01	2026-10-11 05:03:53.119	2026-10-11 05:03:54.235
loc-zm-tena-mambwe-mfuwe-airport-community	Mfuwe Airport Community	COMMUNITY	4	loc-zm-tenant-mambwe	tenant-zambia-realty-01	2026-10-11 05:03:53.122	2026-10-11 05:03:54.237
loc-zm-tena-mambwe-masumba	Masumba	COMMUNITY	4	loc-zm-tenant-mambwe	tenant-zambia-realty-01	2026-10-11 05:03:53.124	2026-10-11 05:03:54.239
loc-zm-tenant-chadiza	Chadiza District	DISTRICT	3	loc-zm-tenant-eastern	tenant-zambia-realty-01	2026-10-11 05:03:53.126	2026-10-11 05:03:54.241
loc-zm-tena-chadiza-chadiza-central	Chadiza Central	COMMUNITY	4	loc-zm-tenant-chadiza	tenant-zambia-realty-01	2026-10-11 05:03:53.129	2026-10-11 05:03:54.243
loc-zm-tena-chadiza-naviruli	Naviruli	COMMUNITY	4	loc-zm-tenant-chadiza	tenant-zambia-realty-01	2026-10-11 05:03:53.131	2026-10-11 05:03:54.245
loc-zm-tena-chadiza-zingalume	Zingalume	COMMUNITY	4	loc-zm-tenant-chadiza	tenant-zambia-realty-01	2026-10-11 05:03:53.134	2026-10-11 05:03:54.247
loc-zm-tenant-sinda	Sinda District	DISTRICT	3	loc-zm-tenant-eastern	tenant-zambia-realty-01	2026-10-11 05:03:53.136	2026-10-11 05:03:54.249
loc-zm-tena-sinda-sinda-boma	Sinda Boma	COMMUNITY	4	loc-zm-tenant-sinda	tenant-zambia-realty-01	2026-10-11 05:03:53.138	2026-10-11 05:03:54.251
loc-zm-tena-sinda-ngalowe	Ngalowe	COMMUNITY	4	loc-zm-tenant-sinda	tenant-zambia-realty-01	2026-10-11 05:03:53.142	2026-10-11 05:03:54.255
loc-zm-tenant-vubwi	Vubwi District	DISTRICT	3	loc-zm-tenant-eastern	tenant-zambia-realty-01	2026-10-11 05:03:53.144	2026-10-11 05:03:54.258
loc-zm-tena-vubwi-vubwi-boma	Vubwi Boma	COMMUNITY	4	loc-zm-tenant-vubwi	tenant-zambia-realty-01	2026-10-11 05:03:53.147	2026-10-11 05:03:54.26
loc-zm-tena-vubwi-mbozi	Mbozi	COMMUNITY	4	loc-zm-tenant-vubwi	tenant-zambia-realty-01	2026-10-11 05:03:53.149	2026-10-11 05:03:54.261
loc-zm-tenant-chasefu	Chasefu District	DISTRICT	3	loc-zm-tenant-eastern	tenant-zambia-realty-01	2026-10-11 05:03:53.152	2026-10-11 05:03:54.263
loc-zm-tena-chasefu-chasefu-center	Chasefu Center	COMMUNITY	4	loc-zm-tenant-chasefu	tenant-zambia-realty-01	2026-10-11 05:03:53.154	2026-10-11 05:03:54.265
loc-zm-tena-chasefu-emusa	Emusa	COMMUNITY	4	loc-zm-tenant-chasefu	tenant-zambia-realty-01	2026-10-11 05:03:53.157	2026-10-11 05:03:54.267
loc-zm-tenant-lumezi	Lumezi District	DISTRICT	3	loc-zm-tenant-eastern	tenant-zambia-realty-01	2026-10-11 05:03:53.159	2026-10-11 05:03:54.269
loc-zm-tena-lumezi-lumezi-mission	Lumezi Mission	COMMUNITY	4	loc-zm-tenant-lumezi	tenant-zambia-realty-01	2026-10-11 05:03:53.161	2026-10-11 05:03:54.271
loc-zm-tena-lumezi-mwanya	Mwanya	COMMUNITY	4	loc-zm-tenant-lumezi	tenant-zambia-realty-01	2026-10-11 05:03:53.164	2026-10-11 05:03:54.273
loc-zm-tenant-lusangazi	Lusangazi District	DISTRICT	3	loc-zm-tenant-eastern	tenant-zambia-realty-01	2026-10-11 05:03:53.167	2026-10-11 05:03:54.275
loc-zm-tena-lusangaz-lusangazi-boma	Lusangazi Boma	COMMUNITY	4	loc-zm-tenant-lusangazi	tenant-zambia-realty-01	2026-10-11 05:03:53.169	2026-10-11 05:03:54.277
loc-zm-tena-lusangaz-ukwimi-community	Ukwimi Community	COMMUNITY	4	loc-zm-tenant-lusangazi	tenant-zambia-realty-01	2026-10-11 05:03:53.172	2026-10-11 05:03:54.279
loc-zm-tenant-mansa	Mansa District	DISTRICT	3	loc-zm-tenant-luapula	tenant-zambia-realty-01	2026-10-11 05:03:53.177	2026-10-11 05:03:54.292
loc-zm-tena-mansa-kabunda	Kabunda	COMMUNITY	4	loc-zm-tenant-mansa	tenant-zambia-realty-01	2026-10-11 05:03:53.18	2026-10-11 05:03:54.299
loc-zm-tena-mansa-spark	Spark	COMMUNITY	4	loc-zm-tenant-mansa	tenant-zambia-realty-01	2026-10-11 05:03:53.182	2026-10-11 05:03:54.302
loc-zm-tena-mansa-senama	Senama	COMMUNITY	4	loc-zm-tenant-mansa	tenant-zambia-realty-01	2026-10-11 05:03:53.185	2026-10-11 05:03:54.304
loc-zm-tena-mansa-mansa-central	Mansa Central	COMMUNITY	4	loc-zm-tenant-mansa	tenant-zambia-realty-01	2026-10-11 05:03:53.187	2026-10-11 05:03:54.307
loc-zm-tena-mansa-chilly-mansa	Chilly Mansa	COMMUNITY	4	loc-zm-tenant-mansa	tenant-zambia-realty-01	2026-10-11 05:03:53.19	2026-10-11 05:03:54.309
loc-zm-tenant-kawambwa	Kawambwa District	DISTRICT	3	loc-zm-tenant-luapula	tenant-zambia-realty-01	2026-10-11 05:03:53.192	2026-10-11 05:03:54.311
loc-zm-tena-kawambwa-kawambwa-tea-estate	Kawambwa Tea Estate	COMMUNITY	4	loc-zm-tenant-kawambwa	tenant-zambia-realty-01	2026-10-11 05:03:53.196	2026-10-11 05:03:54.313
loc-zm-tena-kawambwa-kawambwa-central	Kawambwa Central	COMMUNITY	4	loc-zm-tenant-kawambwa	tenant-zambia-realty-01	2026-10-11 05:03:53.198	2026-10-11 05:03:54.316
loc-zm-tena-kawambwa-ntumbachushi-falls-area	Ntumbachushi Falls Area	COMMUNITY	4	loc-zm-tenant-kawambwa	tenant-zambia-realty-01	2026-10-11 05:03:53.201	2026-10-11 05:03:54.318
loc-zm-tenant-luapula	Luapula Province	PROVINCE	2	loc-zm-tenant-z-root	tenant-zambia-realty-01	2026-10-11 05:03:53.174	2026-10-11 19:51:11.208
loc-zm-tena-ncheleng-lake-mweru-harbour	Lake Mweru Harbour	COMMUNITY	4	loc-zm-tenant-nchelenge	tenant-zambia-realty-01	2026-10-11 05:03:53.206	2026-10-11 05:03:54.322
loc-zm-tena-ncheleng-kashikishi-market-town	Kashikishi Market Town	COMMUNITY	4	loc-zm-tenant-nchelenge	tenant-zambia-realty-01	2026-10-11 05:03:53.209	2026-10-11 05:03:54.324
loc-zm-tena-ncheleng-nchelenge-urban	Nchelenge Urban	COMMUNITY	4	loc-zm-tenant-nchelenge	tenant-zambia-realty-01	2026-10-11 05:03:53.211	2026-10-11 05:03:54.326
loc-zm-tenant-samfya	Samfya District	DISTRICT	3	loc-zm-tenant-luapula	tenant-zambia-realty-01	2026-10-11 05:03:53.214	2026-10-11 05:03:54.328
loc-zm-tena-samfya-lake-bangweulu-beachfron	Lake Bangweulu Beachfront	COMMUNITY	4	loc-zm-tenant-samfya	tenant-zambia-realty-01	2026-10-11 05:03:53.216	2026-10-11 05:03:54.33
loc-zm-tena-samfya-samfya-urban	Samfya Urban	COMMUNITY	4	loc-zm-tenant-samfya	tenant-zambia-realty-01	2026-10-11 05:03:53.219	2026-10-11 05:03:54.332
loc-zm-tena-samfya-chifunabuli-bay	Chifunabuli Bay	COMMUNITY	4	loc-zm-tenant-samfya	tenant-zambia-realty-01	2026-10-11 05:03:53.221	2026-10-11 05:03:54.334
loc-zm-tenant-mwense	Mwense District	DISTRICT	3	loc-zm-tenant-luapula	tenant-zambia-realty-01	2026-10-11 05:03:53.223	2026-10-11 05:03:54.336
loc-zm-tena-mwense-mwense-boma	Mwense Boma	COMMUNITY	4	loc-zm-tenant-mwense	tenant-zambia-realty-01	2026-10-11 05:03:53.225	2026-10-11 05:03:54.338
loc-zm-tena-mwense-musonda-falls-area	Musonda Falls Area	COMMUNITY	4	loc-zm-tenant-mwense	tenant-zambia-realty-01	2026-10-11 05:03:53.227	2026-10-11 05:03:54.34
loc-zm-tena-mwense-mambilima-mission	Mambilima Mission	COMMUNITY	4	loc-zm-tenant-mwense	tenant-zambia-realty-01	2026-10-11 05:03:53.23	2026-10-11 05:03:54.342
loc-zm-tenant-chienge	Chienge District	DISTRICT	3	loc-zm-tenant-luapula	tenant-zambia-realty-01	2026-10-11 05:03:53.232	2026-10-11 05:03:54.344
loc-zm-tena-chienge-chienge-border	Chienge Border	COMMUNITY	4	loc-zm-tenant-chienge	tenant-zambia-realty-01	2026-10-11 05:03:53.234	2026-10-11 05:03:54.346
loc-zm-tena-chienge-puta-central	Puta Central	COMMUNITY	4	loc-zm-tenant-chienge	tenant-zambia-realty-01	2026-10-11 05:03:53.236	2026-10-11 05:03:54.348
loc-zm-tena-chienge-luchinda	Luchinda	COMMUNITY	4	loc-zm-tenant-chienge	tenant-zambia-realty-01	2026-10-11 05:03:53.238	2026-10-11 05:03:54.35
loc-zm-tenant-milenge	Milenge District	DISTRICT	3	loc-zm-tenant-luapula	tenant-zambia-realty-01	2026-10-11 05:03:53.24	2026-10-11 05:03:54.352
loc-zm-tena-milenge-milenge-boma	Milenge Boma	COMMUNITY	4	loc-zm-tenant-milenge	tenant-zambia-realty-01	2026-10-11 05:03:53.243	2026-10-11 05:03:54.355
loc-zm-tena-milenge-sokontwe	Sokontwe	COMMUNITY	4	loc-zm-tenant-milenge	tenant-zambia-realty-01	2026-10-11 05:03:53.245	2026-10-11 05:03:54.357
loc-zm-tenant-chipili	Chipili District	DISTRICT	3	loc-zm-tenant-luapula	tenant-zambia-realty-01	2026-10-11 05:03:53.248	2026-10-11 05:03:54.359
loc-zm-tena-chipili-mwenda	Mwenda	COMMUNITY	4	loc-zm-tenant-chipili	tenant-zambia-realty-01	2026-10-11 05:03:53.253	2026-10-11 05:03:54.363
loc-zm-tenant-chembe	Chembe District	DISTRICT	3	loc-zm-tenant-luapula	tenant-zambia-realty-01	2026-10-11 05:03:53.255	2026-10-11 05:03:54.365
loc-zm-tena-chembe-chembe-bridge-border-hub	Chembe Bridge Border Hub	COMMUNITY	4	loc-zm-tenant-chembe	tenant-zambia-realty-01	2026-10-11 05:03:53.257	2026-10-11 05:03:54.367
loc-zm-tena-chembe-kundamfumu	Kundamfumu	COMMUNITY	4	loc-zm-tenant-chembe	tenant-zambia-realty-01	2026-10-11 05:03:53.259	2026-10-11 05:03:54.369
loc-zm-tenant-chifunabuli	Chifunabuli District	DISTRICT	3	loc-zm-tenant-luapula	tenant-zambia-realty-01	2026-10-11 05:03:53.262	2026-10-11 05:03:54.371
loc-zm-tena-chifunab-chifunabuli-coast	Chifunabuli Coast	COMMUNITY	4	loc-zm-tenant-chifunabuli	tenant-zambia-realty-01	2026-10-11 05:03:53.264	2026-10-11 05:03:54.373
loc-zm-tena-chifunab-lubwe-mission	Lubwe Mission	COMMUNITY	4	loc-zm-tenant-chifunabuli	tenant-zambia-realty-01	2026-10-11 05:03:53.266	2026-10-11 05:03:54.375
loc-zm-tenant-mwansabombwe	Mwansabombwe District	DISTRICT	3	loc-zm-tenant-luapula	tenant-zambia-realty-01	2026-10-11 05:03:53.268	2026-10-11 05:03:54.377
loc-zm-tena-mwansabo-kazembe-royal-capital	Kazembe Royal Capital	COMMUNITY	4	loc-zm-tenant-mwansabombwe	tenant-zambia-realty-01	2026-10-11 05:03:53.271	2026-10-11 05:03:54.379
loc-zm-tena-mwansabo-lwena	Lwena	COMMUNITY	4	loc-zm-tenant-mwansabombwe	tenant-zambia-realty-01	2026-10-11 05:03:53.273	2026-10-11 05:03:54.381
loc-zm-tenant-lunga	Lunga District	DISTRICT	3	loc-zm-tenant-luapula	tenant-zambia-realty-01	2026-10-11 05:03:53.275	2026-10-11 05:03:54.383
loc-zm-tena-lunga-bangweulu-swamps-island-	Bangweulu Swamps Island Hub	COMMUNITY	4	loc-zm-tenant-lunga	tenant-zambia-realty-01	2026-10-11 05:03:53.278	2026-10-11 05:03:54.385
loc-zm-tena-lunga-nsalushi-island	Nsalushi Island	COMMUNITY	4	loc-zm-tenant-lunga	tenant-zambia-realty-01	2026-10-11 05:03:53.28	2026-10-11 05:03:54.387
loc-zm-tenant-kasama	Kasama District	DISTRICT	3	loc-zm-tenant-northern	tenant-zambia-realty-01	2026-10-11 05:03:53.285	2026-10-11 05:03:54.391
loc-zm-tena-kasama-kasama-location	Kasama Location	COMMUNITY	4	loc-zm-tenant-kasama	tenant-zambia-realty-01	2026-10-11 05:03:53.287	2026-10-11 05:03:54.393
loc-zm-tena-kasama-newtown-kasama	Newtown Kasama	COMMUNITY	4	loc-zm-tenant-kasama	tenant-zambia-realty-01	2026-10-11 05:03:53.289	2026-10-11 05:03:54.395
loc-zm-tena-kasama-mulenga-hills	Mulenga Hills	COMMUNITY	4	loc-zm-tenant-kasama	tenant-zambia-realty-01	2026-10-11 05:03:53.292	2026-10-11 05:03:54.397
loc-zm-tena-kasama-tazara-kasama	Tazara Kasama	COMMUNITY	4	loc-zm-tenant-kasama	tenant-zambia-realty-01	2026-10-11 05:03:53.294	2026-10-11 05:03:54.399
loc-zm-tena-kasama-chitimukulu-palace-area	Chitimukulu Palace Area	COMMUNITY	4	loc-zm-tenant-kasama	tenant-zambia-realty-01	2026-10-11 05:03:53.296	2026-10-11 05:03:54.405
loc-zm-tenant-mbala	Mbala District	DISTRICT	3	loc-zm-tenant-northern	tenant-zambia-realty-01	2026-10-11 05:03:53.298	2026-10-11 05:03:54.415
loc-zm-tena-mbala-lake-chila-area	Lake Chila Area	COMMUNITY	4	loc-zm-tenant-mbala	tenant-zambia-realty-01	2026-10-11 05:03:53.3	2026-10-11 05:03:54.42
loc-zm-tena-mbala-mbala-central	Mbala Central	COMMUNITY	4	loc-zm-tenant-mbala	tenant-zambia-realty-01	2026-10-11 05:03:53.302	2026-10-11 05:03:54.424
loc-zm-tena-mbala-moto-moto-museum-area	Moto Moto Museum Area	COMMUNITY	4	loc-zm-tenant-mbala	tenant-zambia-realty-01	2026-10-11 05:03:53.305	2026-10-11 05:03:54.428
loc-zm-tenant-mpulungu	Mpulungu District	DISTRICT	3	loc-zm-tenant-northern	tenant-zambia-realty-01	2026-10-11 05:03:53.307	2026-10-11 05:03:54.432
loc-zm-tena-mpulungu-lake-tanganyika-internat	Lake Tanganyika International Port	COMMUNITY	4	loc-zm-tenant-mpulungu	tenant-zambia-realty-01	2026-10-11 05:03:53.309	2026-10-11 05:03:54.434
loc-zm-tena-mpulungu-harbour-view	Harbour View	COMMUNITY	4	loc-zm-tenant-mpulungu	tenant-zambia-realty-01	2026-10-11 05:03:53.311	2026-10-11 05:03:54.436
loc-zm-tena-mpulungu-mpulungu-urban	Mpulungu Urban	COMMUNITY	4	loc-zm-tenant-mpulungu	tenant-zambia-realty-01	2026-10-11 05:03:53.313	2026-10-11 05:03:54.438
loc-zm-tena-mpulungu-kalambo-falls-gateway	Kalambo Falls Gateway	COMMUNITY	4	loc-zm-tenant-mpulungu	tenant-zambia-realty-01	2026-10-11 05:03:53.315	2026-10-11 05:03:54.441
loc-zm-tenant-mporokoso	Mporokoso District	DISTRICT	3	loc-zm-tenant-northern	tenant-zambia-realty-01	2026-10-11 05:03:53.318	2026-10-11 05:03:54.443
loc-zm-tenant-northern	Northern Province	PROVINCE	2	loc-zm-tenant-z-root	tenant-zambia-realty-01	2026-10-11 05:03:53.283	2026-10-11 19:51:11.208
loc-zm-tena-mporokos-lumangwe-falls-community	Lumangwe Falls Community	COMMUNITY	4	loc-zm-tenant-mporokoso	tenant-zambia-realty-01	2026-10-11 05:03:53.322	2026-10-11 05:03:54.447
loc-zm-tenant-luwingu	Luwingu District	DISTRICT	3	loc-zm-tenant-northern	tenant-zambia-realty-01	2026-10-11 05:03:53.324	2026-10-11 05:03:54.449
loc-zm-tena-luwingu-luwingu-central	Luwingu Central	COMMUNITY	4	loc-zm-tenant-luwingu	tenant-zambia-realty-01	2026-10-11 05:03:53.326	2026-10-11 05:03:54.451
loc-zm-tena-luwingu-chaba-lake-point	Chaba Lake Point	COMMUNITY	4	loc-zm-tenant-luwingu	tenant-zambia-realty-01	2026-10-11 05:03:53.329	2026-10-11 05:03:54.453
loc-zm-tenant-kaputa	Kaputa District	DISTRICT	3	loc-zm-tenant-northern	tenant-zambia-realty-01	2026-10-11 05:03:53.331	2026-10-11 05:03:54.455
loc-zm-tena-kaputa-lake-mweru-wantipa-shore	Lake Mweru Wantipa Shore	COMMUNITY	4	loc-zm-tenant-kaputa	tenant-zambia-realty-01	2026-10-11 05:03:53.333	2026-10-11 05:03:54.457
loc-zm-tena-kaputa-kaputa-boma	Kaputa Boma	COMMUNITY	4	loc-zm-tenant-kaputa	tenant-zambia-realty-01	2026-10-11 05:03:53.336	2026-10-11 05:03:54.459
loc-zm-tenant-chilubi	Chilubi District	DISTRICT	3	loc-zm-tenant-northern	tenant-zambia-realty-01	2026-10-11 05:03:53.338	2026-10-11 05:03:54.461
loc-zm-tena-chilubi-chilubi-island-hub	Chilubi Island Hub	COMMUNITY	4	loc-zm-tenant-chilubi	tenant-zambia-realty-01	2026-10-11 05:03:53.34	2026-10-11 05:03:54.463
loc-zm-tena-chilubi-santa-maria-mission	Santa Maria Mission	COMMUNITY	4	loc-zm-tenant-chilubi	tenant-zambia-realty-01	2026-10-11 05:03:53.342	2026-10-11 05:03:54.465
loc-zm-tenant-mungwi	Mungwi District	DISTRICT	3	loc-zm-tenant-northern	tenant-zambia-realty-01	2026-10-11 05:03:53.344	2026-10-11 05:03:54.467
loc-zm-tena-mungwi-mungwi-boma	Mungwi Boma	COMMUNITY	4	loc-zm-tenant-mungwi	tenant-zambia-realty-01	2026-10-11 05:03:53.347	2026-10-11 05:03:54.469
loc-zm-tena-mungwi-malole-mission	Malole Mission	COMMUNITY	4	loc-zm-tenant-mungwi	tenant-zambia-realty-01	2026-10-11 05:03:53.349	2026-10-11 05:03:54.471
loc-zm-tenant-senga-hill	Senga Hill District	DISTRICT	3	loc-zm-tenant-northern	tenant-zambia-realty-01	2026-10-11 05:03:53.352	2026-10-11 05:03:54.473
loc-zm-tena-senga-hi-senga-hill-boma	Senga Hill Boma	COMMUNITY	4	loc-zm-tenant-senga-hill	tenant-zambia-realty-01	2026-10-11 05:03:53.354	2026-10-11 05:03:54.475
loc-zm-tena-senga-hi-nondo	Nondo	COMMUNITY	4	loc-zm-tenant-senga-hill	tenant-zambia-realty-01	2026-10-11 05:03:53.356	2026-10-11 05:03:54.477
loc-zm-tenant-lunte	Lunte District	DISTRICT	3	loc-zm-tenant-northern	tenant-zambia-realty-01	2026-10-11 05:03:53.358	2026-10-11 05:03:54.479
loc-zm-tena-lunte-lunte-boma	Lunte Boma	COMMUNITY	4	loc-zm-tenant-lunte	tenant-zambia-realty-01	2026-10-11 05:03:53.36	2026-10-11 05:03:54.482
loc-zm-tena-lunte-kapatu-mission	Kapatu Mission	COMMUNITY	4	loc-zm-tenant-lunte	tenant-zambia-realty-01	2026-10-11 05:03:53.362	2026-10-11 05:03:54.484
loc-zm-tenant-solwezi	Solwezi District	DISTRICT	3	loc-zm-tenant-northwestern	tenant-zambia-realty-01	2026-10-11 05:03:53.367	2026-10-11 05:03:54.488
loc-zm-tena-solwezi-kansanshi-mine-town	Kansanshi Mine Town	COMMUNITY	4	loc-zm-tenant-solwezi	tenant-zambia-realty-01	2026-10-11 05:03:53.369	2026-10-11 05:03:54.49
loc-zm-tena-solwezi-kyawama	Kyawama	COMMUNITY	4	loc-zm-tenant-solwezi	tenant-zambia-realty-01	2026-10-11 05:03:53.371	2026-10-11 05:03:54.492
loc-zm-tena-solwezi-messenger-solwezi	Messenger Solwezi	COMMUNITY	4	loc-zm-tenant-solwezi	tenant-zambia-realty-01	2026-10-11 05:03:53.373	2026-10-11 05:03:54.494
loc-zm-tena-solwezi-kimasala	Kimasala	COMMUNITY	4	loc-zm-tenant-solwezi	tenant-zambia-realty-01	2026-10-11 05:03:53.375	2026-10-11 05:03:54.496
loc-zm-tena-solwezi-kazomba	Kazomba	COMMUNITY	4	loc-zm-tenant-solwezi	tenant-zambia-realty-01	2026-10-11 05:03:53.377	2026-10-11 05:03:54.499
loc-zm-tena-solwezi-rodger-chinense	Rodger Chinense	COMMUNITY	4	loc-zm-tenant-solwezi	tenant-zambia-realty-01	2026-10-11 05:03:53.379	2026-10-11 05:03:54.501
loc-zm-tenant-kalumbila	Kalumbila District	DISTRICT	3	loc-zm-tenant-northwestern	tenant-zambia-realty-01	2026-10-11 05:03:53.382	2026-10-11 05:03:54.503
loc-zm-tena-kalumbil-trident-mining-town	Trident Mining Town	COMMUNITY	4	loc-zm-tenant-kalumbila	tenant-zambia-realty-01	2026-10-11 05:03:53.385	2026-10-11 05:03:54.505
loc-zm-tena-kalumbil-sentinel-village	Sentinel Village	COMMUNITY	4	loc-zm-tenant-kalumbila	tenant-zambia-realty-01	2026-10-11 05:03:53.387	2026-10-11 05:03:54.507
loc-zm-tena-kalumbil-kisasa	Kisasa	COMMUNITY	4	loc-zm-tenant-kalumbila	tenant-zambia-realty-01	2026-10-11 05:03:53.389	2026-10-11 05:03:54.509
loc-zm-tenant-kasempa	Kasempa District	DISTRICT	3	loc-zm-tenant-northwestern	tenant-zambia-realty-01	2026-10-11 05:03:53.391	2026-10-11 05:03:54.511
loc-zm-tena-kasempa-kasempa-boma	Kasempa Boma	COMMUNITY	4	loc-zm-tenant-kasempa	tenant-zambia-realty-01	2026-10-11 05:03:53.393	2026-10-11 05:03:54.513
loc-zm-tena-kasempa-mukinge-mission-hospital	Mukinge Mission Hospital Area	COMMUNITY	4	loc-zm-tenant-kasempa	tenant-zambia-realty-01	2026-10-11 05:03:53.395	2026-10-11 05:03:54.516
loc-zm-tenant-mwinilunga	Mwinilunga District	DISTRICT	3	loc-zm-tenant-northwestern	tenant-zambia-realty-01	2026-10-11 05:03:53.397	2026-10-11 05:03:54.518
loc-zm-tena-mwinilun-source-of-the-zambezi-mo	Source of the Zambezi Monument Area	COMMUNITY	4	loc-zm-tenant-mwinilunga	tenant-zambia-realty-01	2026-10-11 05:03:53.4	2026-10-11 05:03:54.52
loc-zm-tena-mwinilun-mwinilunga-urban	Mwinilunga Urban	COMMUNITY	4	loc-zm-tenant-mwinilunga	tenant-zambia-realty-01	2026-10-11 05:03:53.402	2026-10-11 05:03:54.522
loc-zm-tena-mwinilun-kakoma	Kakoma	COMMUNITY	4	loc-zm-tenant-mwinilunga	tenant-zambia-realty-01	2026-10-11 05:03:53.404	2026-10-11 05:03:54.524
loc-zm-tenant-zambezi	Zambezi District	DISTRICT	3	loc-zm-tenant-northwestern	tenant-zambia-realty-01	2026-10-11 05:03:53.407	2026-10-11 05:03:54.526
loc-zm-tena-zambezi-zambezi-boma	Zambezi Boma	COMMUNITY	4	loc-zm-tenant-zambezi	tenant-zambia-realty-01	2026-10-11 05:03:53.409	2026-10-11 05:03:54.528
loc-zm-tena-zambezi-chitokoloki-mission	Chitokoloki Mission	COMMUNITY	4	loc-zm-tenant-zambezi	tenant-zambia-realty-01	2026-10-11 05:03:53.411	2026-10-11 05:03:54.53
loc-zm-tena-zambezi-dipalata	Dipalata	COMMUNITY	4	loc-zm-tenant-zambezi	tenant-zambia-realty-01	2026-10-11 05:03:53.414	2026-10-11 05:03:54.533
loc-zm-tenant-kabompo	Kabompo District	DISTRICT	3	loc-zm-tenant-northwestern	tenant-zambia-realty-01	2026-10-11 05:03:53.416	2026-10-11 05:03:54.535
loc-zm-tena-kabompo-kabompo-boma	Kabompo Boma	COMMUNITY	4	loc-zm-tenant-kabompo	tenant-zambia-realty-01	2026-10-11 05:03:53.418	2026-10-11 05:03:54.537
loc-zm-tena-kabompo-chikonkwelo	Chikonkwelo	COMMUNITY	4	loc-zm-tenant-kabompo	tenant-zambia-realty-01	2026-10-11 05:03:53.421	2026-10-11 05:03:54.539
loc-zm-tena-kabompo-kayombo	Kayombo	COMMUNITY	4	loc-zm-tenant-kabompo	tenant-zambia-realty-01	2026-10-11 05:03:53.423	2026-10-11 05:03:54.54
loc-zm-tenant-chavuma	Chavuma District	DISTRICT	3	loc-zm-tenant-northwestern	tenant-zambia-realty-01	2026-10-11 05:03:53.425	2026-10-11 05:03:54.542
loc-zm-tena-chavuma-chavuma-falls-community	Chavuma Falls Community	COMMUNITY	4	loc-zm-tenant-chavuma	tenant-zambia-realty-01	2026-10-11 05:03:53.427	2026-10-11 05:03:54.545
loc-zm-tena-chavuma-chavuma-border-post	Chavuma Border Post	COMMUNITY	4	loc-zm-tenant-chavuma	tenant-zambia-realty-01	2026-10-11 05:03:53.43	2026-10-11 05:03:54.547
loc-zm-tenant-mufumbwe	Mufumbwe District	DISTRICT	3	loc-zm-tenant-northwestern	tenant-zambia-realty-01	2026-10-11 05:03:53.432	2026-10-11 05:03:54.549
loc-zm-tena-mufumbwe-kamankundju	Kamankundju	COMMUNITY	4	loc-zm-tenant-mufumbwe	tenant-zambia-realty-01	2026-10-11 05:03:53.437	2026-10-11 05:03:54.553
loc-zm-tenant-ikelenge	Ikelenge District	DISTRICT	3	loc-zm-tenant-northwestern	tenant-zambia-realty-01	2026-10-11 05:03:53.44	2026-10-11 05:03:54.555
loc-zm-tena-ikelenge-ikelenge-pineapple-agric	Ikelenge Pineapple Agricultural Belt	COMMUNITY	4	loc-zm-tenant-ikelenge	tenant-zambia-realty-01	2026-10-11 05:03:53.442	2026-10-11 05:03:54.557
loc-zm-tena-ikelenge-zambezi-rapids	Zambezi Rapids	COMMUNITY	4	loc-zm-tenant-ikelenge	tenant-zambia-realty-01	2026-10-11 05:03:53.444	2026-10-11 05:03:54.559
loc-zm-tenant-mushindamo	Mushindamo District	DISTRICT	3	loc-zm-tenant-northwestern	tenant-zambia-realty-01	2026-10-11 05:03:53.447	2026-10-11 05:03:54.561
loc-zm-tena-mushinda-mushindamo-boma	Mushindamo Boma	COMMUNITY	4	loc-zm-tenant-mushindamo	tenant-zambia-realty-01	2026-10-11 05:03:53.449	2026-10-11 05:03:54.563
loc-zm-tena-mushinda-kipushi-border-hub	Kipushi Border Hub	COMMUNITY	4	loc-zm-tenant-mushindamo	tenant-zambia-realty-01	2026-10-11 05:03:53.452	2026-10-11 05:03:54.565
loc-zm-tenant-manyinga	Manyinga District	DISTRICT	3	loc-zm-tenant-northwestern	tenant-zambia-realty-01	2026-10-11 05:03:53.454	2026-10-11 05:03:54.567
loc-zm-tena-manyinga-manyinga-boma	Manyinga Boma	COMMUNITY	4	loc-zm-tenant-manyinga	tenant-zambia-realty-01	2026-10-11 05:03:53.456	2026-10-11 05:03:54.569
loc-zm-tena-manyinga-loloma-mission	Loloma Mission	COMMUNITY	4	loc-zm-tenant-manyinga	tenant-zambia-realty-01	2026-10-11 05:03:53.458	2026-10-11 05:03:54.572
loc-zm-tenant-chinsali	Chinsali District	DISTRICT	3	loc-zm-tenant-muchinga	tenant-zambia-realty-01	2026-10-11 05:03:53.463	2026-10-11 05:03:54.576
loc-zm-tena-chinsali-chinsali-boma	Chinsali Boma	COMMUNITY	4	loc-zm-tenant-chinsali	tenant-zambia-realty-01	2026-10-11 05:03:53.465	2026-10-11 05:03:54.578
loc-zm-tena-chinsali-lubwa-mission-historic-c	Lubwa Mission Historic Center	COMMUNITY	4	loc-zm-tenant-chinsali	tenant-zambia-realty-01	2026-10-11 05:03:53.467	2026-10-11 05:03:54.58
loc-zm-tenant-mpika	Mpika District	DISTRICT	3	loc-zm-tenant-muchinga	tenant-zambia-realty-01	2026-10-11 05:03:53.469	2026-10-11 05:03:54.582
loc-zm-tena-mpika-tazara-railway-workshops	Tazara Railway Workshops	COMMUNITY	4	loc-zm-tenant-mpika	tenant-zambia-realty-01	2026-10-11 05:03:53.471	2026-10-11 05:03:54.584
loc-zm-tena-mpika-chitulika	Chitulika	COMMUNITY	4	loc-zm-tenant-mpika	tenant-zambia-realty-01	2026-10-11 05:03:53.474	2026-10-11 05:03:54.586
loc-zm-tena-mpika-mpika-urban	Mpika Urban	COMMUNITY	4	loc-zm-tenant-mpika	tenant-zambia-realty-01	2026-10-11 05:03:53.476	2026-10-11 05:03:54.588
loc-zm-tena-mpika-danger-hill-corridor	Danger Hill Corridor	COMMUNITY	4	loc-zm-tenant-mpika	tenant-zambia-realty-01	2026-10-11 05:03:53.478	2026-10-11 05:03:54.59
loc-zm-tenant-nakonde	Nakonde District	DISTRICT	3	loc-zm-tenant-muchinga	tenant-zambia-realty-01	2026-10-11 05:03:53.481	2026-10-11 05:03:54.592
loc-zm-tena-nakonde-tanzania-border-one-stop	Tanzania Border One-Stop Post	COMMUNITY	4	loc-zm-tenant-nakonde	tenant-zambia-realty-01	2026-10-11 05:03:53.484	2026-10-11 05:03:54.594
loc-zm-tena-nakonde-nakonde-urban	Nakonde Urban	COMMUNITY	4	loc-zm-tenant-nakonde	tenant-zambia-realty-01	2026-10-11 05:03:53.486	2026-10-11 05:03:54.596
loc-zm-tena-nakonde-wulongo	Wulongo	COMMUNITY	4	loc-zm-tenant-nakonde	tenant-zambia-realty-01	2026-10-11 05:03:53.489	2026-10-11 05:03:54.598
loc-zm-tenant-isoka	Isoka District	DISTRICT	3	loc-zm-tenant-muchinga	tenant-zambia-realty-01	2026-10-11 05:03:53.491	2026-10-11 05:03:54.6
loc-zm-tena-isoka-isoka-urban	Isoka Urban	COMMUNITY	4	loc-zm-tenant-isoka	tenant-zambia-realty-01	2026-10-11 05:03:53.493	2026-10-11 05:03:54.602
loc-zm-tena-isoka-kapililonga	Kapililonga	COMMUNITY	4	loc-zm-tenant-isoka	tenant-zambia-realty-01	2026-10-11 05:03:53.496	2026-10-11 05:03:54.604
loc-zm-tena-isoka-mpundu	Mpundu	COMMUNITY	4	loc-zm-tenant-isoka	tenant-zambia-realty-01	2026-10-11 05:03:53.498	2026-10-11 05:03:54.606
loc-zm-tenant-mafinga	Mafinga District	DISTRICT	3	loc-zm-tenant-muchinga	tenant-zambia-realty-01	2026-10-11 05:03:53.5	2026-10-11 05:03:54.608
loc-zm-tena-mafinga-thendele-central	Thendele Central	COMMUNITY	4	loc-zm-tenant-mafinga	tenant-zambia-realty-01	2026-10-11 05:03:53.503	2026-10-11 05:03:54.61
loc-zm-tenant-shiwangandu	Shiwang'andu District	DISTRICT	3	loc-zm-tenant-muchinga	tenant-zambia-realty-01	2026-10-11 05:03:53.507	2026-10-11 05:03:54.617
loc-zm-tena-shiwanga-shiwa-ng-andu-historic-e	Shiwa Ng'andu Historic Estate	COMMUNITY	4	loc-zm-tenant-shiwangandu	tenant-zambia-realty-01	2026-10-11 05:03:53.51	2026-10-11 05:03:54.62
loc-zm-tena-shiwanga-kapishya-natural-hot-spr	Kapishya Natural Hot Springs	COMMUNITY	4	loc-zm-tenant-shiwangandu	tenant-zambia-realty-01	2026-10-11 05:03:53.512	2026-10-11 05:03:54.623
loc-zm-tenant-lavushimanda	Lavushimanda District	DISTRICT	3	loc-zm-tenant-muchinga	tenant-zambia-realty-01	2026-10-11 05:03:53.516	2026-10-11 05:03:54.625
loc-zm-tena-lavushim-lavushi-manda-national-p	Lavushi Manda National Park Entrance	COMMUNITY	4	loc-zm-tenant-lavushimanda	tenant-zambia-realty-01	2026-10-11 05:03:53.518	2026-10-11 05:03:54.627
loc-zm-tena-lavushim-lulimala	Lulimala	COMMUNITY	4	loc-zm-tenant-lavushimanda	tenant-zambia-realty-01	2026-10-11 05:03:53.52	2026-10-11 05:03:54.63
loc-zm-tenant-kanchibiya	Kanchibiya District	DISTRICT	3	loc-zm-tenant-muchinga	tenant-zambia-realty-01	2026-10-11 05:03:53.523	2026-10-11 05:03:54.632
loc-zm-tena-kanchibi-kanchibiya-boma	Kanchibiya Boma	COMMUNITY	4	loc-zm-tenant-kanchibiya	tenant-zambia-realty-01	2026-10-11 05:03:53.525	2026-10-11 05:03:54.635
loc-zm-tena-kanchibi-chalabesa-mission	Chalabesa Mission	COMMUNITY	4	loc-zm-tenant-kanchibiya	tenant-zambia-realty-01	2026-10-11 05:03:53.528	2026-10-11 05:03:54.637
loc-zm-tenant-mongu	Mongu District	DISTRICT	3	loc-zm-tenant-western	tenant-zambia-realty-01	2026-10-11 05:03:53.533	2026-10-11 05:03:54.642
loc-zm-tena-mongu-limulunga-royal-palace	Limulunga Royal Palace	COMMUNITY	4	loc-zm-tenant-mongu	tenant-zambia-realty-01	2026-10-11 05:03:53.535	2026-10-11 05:03:54.644
loc-zm-tena-mongu-mandanga	Mandanga	COMMUNITY	4	loc-zm-tenant-mongu	tenant-zambia-realty-01	2026-10-11 05:03:53.538	2026-10-11 05:03:54.646
loc-zm-tena-mongu-blue-sky-mongu	Blue Sky Mongu	COMMUNITY	4	loc-zm-tenant-mongu	tenant-zambia-realty-01	2026-10-11 05:03:53.54	2026-10-11 05:03:54.648
loc-zm-tena-mongu-mongu-central	Mongu Central	COMMUNITY	4	loc-zm-tenant-mongu	tenant-zambia-realty-01	2026-10-11 05:03:53.542	2026-10-11 05:03:54.65
loc-zm-tena-mongu-imwiko	Imwiko	COMMUNITY	4	loc-zm-tenant-mongu	tenant-zambia-realty-01	2026-10-11 05:03:53.544	2026-10-11 05:03:54.653
loc-zm-tena-mongu-malengwa	Malengwa	COMMUNITY	4	loc-zm-tenant-mongu	tenant-zambia-realty-01	2026-10-11 05:03:53.547	2026-10-11 05:03:54.655
loc-zm-tenant-kaoma	Kaoma District	DISTRICT	3	loc-zm-tenant-western	tenant-zambia-realty-01	2026-10-11 05:03:53.549	2026-10-11 05:03:54.657
loc-zm-tena-kaoma-kaoma-urban	Kaoma Urban	COMMUNITY	4	loc-zm-tenant-kaoma	tenant-zambia-realty-01	2026-10-11 05:03:53.551	2026-10-11 05:03:54.659
loc-zm-tena-kaoma-mulamatila	Mulamatila	COMMUNITY	4	loc-zm-tenant-kaoma	tenant-zambia-realty-01	2026-10-11 05:03:53.553	2026-10-11 05:03:54.661
loc-zm-tenant-muchinga	Muchinga Province	PROVINCE	2	loc-zm-tenant-z-root	tenant-zambia-realty-01	2026-10-11 05:03:53.46	2026-10-11 19:51:11.208
loc-zm-tenant-a-root	Zambia	COUNTRY	1	\N	tenant-apex-emea-02	2026-10-11 05:03:53.635	2026-10-11 05:03:53.635
loc-zm-tena-chilanga-parklands-chilanga	Parklands Chilanga	COMMUNITY	4	loc-zm-tenant-chilanga	tenant-zambia-realty-01	2026-10-11 05:03:52.516	2026-10-11 05:03:53.717
loc-zm-tena-chongwe-chongwe-central	Chongwe Central	COMMUNITY	4	loc-zm-tenant-chongwe	tenant-zambia-realty-01	2026-10-11 05:03:52.539	2026-10-11 05:03:53.731
loc-zm-tena-ndola-kaniki	Kaniki	COMMUNITY	4	loc-zm-tenant-ndola	tenant-zambia-realty-01	2026-10-11 05:03:52.663	2026-10-11 05:03:53.828
loc-zm-tena-chingola-nchanga-north	Nchanga North	COMMUNITY	4	loc-zm-tenant-chingola	tenant-zambia-realty-01	2026-10-11 05:03:52.669	2026-10-11 05:03:53.832
loc-zm-tena-chingola-riverside-chingola	Riverside Chingola	COMMUNITY	4	loc-zm-tenant-chingola	tenant-zambia-realty-01	2026-10-11 05:03:52.675	2026-10-11 05:03:53.836
loc-zm-tena-kabwe-mine-area-kabwe	Mine Area Kabwe	COMMUNITY	4	loc-zm-tenant-kabwe	tenant-zambia-realty-01	2026-10-11 05:03:52.798	2026-10-11 05:03:53.936
loc-zm-tena-kapiri-kapiri-town-centre	Kapiri Town Centre	COMMUNITY	4	loc-zm-tenant-kapiri	tenant-zambia-realty-01	2026-10-11 05:03:52.807	2026-10-11 05:03:53.944
loc-zm-tena-chibombo-chibombo-central	Chibombo Central	COMMUNITY	4	loc-zm-tenant-chibombo	tenant-zambia-realty-01	2026-10-11 05:03:52.84	2026-10-11 05:03:53.992
loc-zm-tena-mazabuka-nakambala-sugar-estate	Nakambala Sugar Estate	COMMUNITY	4	loc-zm-tenant-mazabuka	tenant-zambia-realty-01	2026-10-11 05:03:52.942	2026-10-11 05:03:54.071
loc-zm-tena-mazabuka-town-centre-mazabuka	Town Centre Mazabuka	COMMUNITY	4	loc-zm-tenant-mazabuka	tenant-zambia-realty-01	2026-10-11 05:03:52.949	2026-10-11 05:03:54.075
loc-zm-tena-monze-lochinvar-gate	Lochinvar Gate	COMMUNITY	4	loc-zm-tenant-monze	tenant-zambia-realty-01	2026-10-11 05:03:52.966	2026-10-11 05:03:54.089
loc-zm-tenant-senanga	Senanga District	DISTRICT	3	loc-zm-tenant-western	tenant-zambia-realty-01	2026-10-11 05:03:53.557	2026-10-11 05:03:54.665
loc-zm-tena-senanga-senanga-boma	Senanga Boma	COMMUNITY	4	loc-zm-tenant-senanga	tenant-zambia-realty-01	2026-10-11 05:03:53.559	2026-10-11 05:03:54.667
loc-zm-tena-senanga-zambezi-river-esplanade	Zambezi River Esplanade	COMMUNITY	4	loc-zm-tenant-senanga	tenant-zambia-realty-01	2026-10-11 05:03:53.561	2026-10-11 05:03:54.669
loc-zm-tena-senanga-litambwa	Litambwa	COMMUNITY	4	loc-zm-tenant-senanga	tenant-zambia-realty-01	2026-10-11 05:03:53.564	2026-10-11 05:03:54.671
loc-zm-tenant-sesheke	Sesheke District	DISTRICT	3	loc-zm-tenant-western	tenant-zambia-realty-01	2026-10-11 05:03:53.566	2026-10-11 05:03:54.673
loc-zm-tena-sesheke-katima-mulilo-internatio	Katima Mulilo International Border	COMMUNITY	4	loc-zm-tenant-sesheke	tenant-zambia-realty-01	2026-10-11 05:03:53.568	2026-10-11 05:03:54.676
loc-zm-tena-sesheke-sesheke-urban	Sesheke Urban	COMMUNITY	4	loc-zm-tenant-sesheke	tenant-zambia-realty-01	2026-10-11 05:03:53.57	2026-10-11 05:03:54.678
loc-zm-tena-sesheke-mwandi-junction	Mwandi Junction	COMMUNITY	4	loc-zm-tenant-sesheke	tenant-zambia-realty-01	2026-10-11 05:03:53.572	2026-10-11 05:03:54.68
loc-zm-tenant-kalabo	Kalabo District	DISTRICT	3	loc-zm-tenant-western	tenant-zambia-realty-01	2026-10-11 05:03:53.574	2026-10-11 05:03:54.682
loc-zm-tena-kalabo-liuwa-plain-national-par	Liuwa Plain National Park Gate	COMMUNITY	4	loc-zm-tenant-kalabo	tenant-zambia-realty-01	2026-10-11 05:03:53.576	2026-10-11 05:03:54.684
loc-zm-tena-kalabo-kalabo-urban	Kalabo Urban	COMMUNITY	4	loc-zm-tenant-kalabo	tenant-zambia-realty-01	2026-10-11 05:03:53.578	2026-10-11 05:03:54.686
loc-zm-tena-kalabo-tapalo	Tapalo	COMMUNITY	4	loc-zm-tenant-kalabo	tenant-zambia-realty-01	2026-10-11 05:03:53.58	2026-10-11 05:03:54.688
loc-zm-tenant-lukulu	Lukulu District	DISTRICT	3	loc-zm-tenant-western	tenant-zambia-realty-01	2026-10-11 05:03:53.583	2026-10-11 05:03:54.69
loc-zm-tena-lukulu-lukulu-boma	Lukulu Boma	COMMUNITY	4	loc-zm-tenant-lukulu	tenant-zambia-realty-01	2026-10-11 05:03:53.585	2026-10-11 05:03:54.692
loc-zm-tena-lukulu-sanctuary-point	Sanctuary Point	COMMUNITY	4	loc-zm-tenant-lukulu	tenant-zambia-realty-01	2026-10-11 05:03:53.587	2026-10-11 05:03:54.695
loc-zm-tenant-shangombo	Shangombo District	DISTRICT	3	loc-zm-tenant-western	tenant-zambia-realty-01	2026-10-11 05:03:53.589	2026-10-11 05:03:54.697
loc-zm-tena-shangomb-shangombo-boma	Shangombo Boma	COMMUNITY	4	loc-zm-tenant-shangombo	tenant-zambia-realty-01	2026-10-11 05:03:53.593	2026-10-11 05:03:54.701
loc-zm-tenant-nalolo	Nalolo District	DISTRICT	3	loc-zm-tenant-western	tenant-zambia-realty-01	2026-10-11 05:03:53.595	2026-10-11 05:03:54.703
loc-zm-tena-nalolo-muoyo-royal-sub-capital	Muoyo Royal Sub-Capital	COMMUNITY	4	loc-zm-tenant-nalolo	tenant-zambia-realty-01	2026-10-11 05:03:53.597	2026-10-11 05:03:54.705
loc-zm-tena-nalolo-nalolo-boma	Nalolo Boma	COMMUNITY	4	loc-zm-tenant-nalolo	tenant-zambia-realty-01	2026-10-11 05:03:53.599	2026-10-11 05:03:54.707
loc-zm-tenant-sioma	Sioma District	DISTRICT	3	loc-zm-tenant-western	tenant-zambia-realty-01	2026-10-11 05:03:53.601	2026-10-11 05:03:54.709
loc-zm-tena-sioma-ngonye-falls-community	Ngonye Falls Community	COMMUNITY	4	loc-zm-tenant-sioma	tenant-zambia-realty-01	2026-10-11 05:03:53.603	2026-10-11 05:03:54.712
loc-zm-tena-sioma-sioma-boma	Sioma Boma	COMMUNITY	4	loc-zm-tenant-sioma	tenant-zambia-realty-01	2026-10-11 05:03:53.605	2026-10-11 05:03:54.714
loc-zm-tenant-luampa	Luampa District	DISTRICT	3	loc-zm-tenant-western	tenant-zambia-realty-01	2026-10-11 05:03:53.607	2026-10-11 05:03:54.716
loc-zm-tena-luampa-luampa-mission-hospital-	Luampa Mission Hospital Community	COMMUNITY	4	loc-zm-tenant-luampa	tenant-zambia-realty-01	2026-10-11 05:03:53.609	2026-10-11 05:03:54.718
loc-zm-tenant-mitete	Mitete District	DISTRICT	3	loc-zm-tenant-western	tenant-zambia-realty-01	2026-10-11 05:03:53.611	2026-10-11 05:03:54.72
loc-zm-tena-mitete-mitete-boma	Mitete Boma	COMMUNITY	4	loc-zm-tenant-mitete	tenant-zambia-realty-01	2026-10-11 05:03:53.614	2026-10-11 05:03:54.722
loc-zm-tena-mitete-washishi	Washishi	COMMUNITY	4	loc-zm-tenant-mitete	tenant-zambia-realty-01	2026-10-11 05:03:53.616	2026-10-11 05:03:54.724
loc-zm-tenant-mwandi	Mwandi District	DISTRICT	3	loc-zm-tenant-western	tenant-zambia-realty-01	2026-10-11 05:03:53.618	2026-10-11 05:03:54.726
loc-zm-tena-mwandi-mwandi-royal-kuta	Mwandi Royal Kuta	COMMUNITY	4	loc-zm-tenant-mwandi	tenant-zambia-realty-01	2026-10-11 05:03:53.62	2026-10-11 05:03:54.728
loc-zm-tena-mwandi-mwandi-urban	Mwandi Urban	COMMUNITY	4	loc-zm-tenant-mwandi	tenant-zambia-realty-01	2026-10-11 05:03:53.622	2026-10-11 05:03:54.73
loc-zm-tenant-sikongo	Sikongo District	DISTRICT	3	loc-zm-tenant-western	tenant-zambia-realty-01	2026-10-11 05:03:53.624	2026-10-11 05:03:54.733
loc-zm-tena-sikongo-sikongo-border-town	Sikongo Border Town	COMMUNITY	4	loc-zm-tenant-sikongo	tenant-zambia-realty-01	2026-10-11 05:03:53.626	2026-10-11 05:03:54.735
loc-zm-tenant-nkeyema	Nkeyema District	DISTRICT	3	loc-zm-tenant-western	tenant-zambia-realty-01	2026-10-11 05:03:53.628	2026-10-11 05:03:54.737
loc-zm-tena-nkeyema-nkeyema-tobacco---commer	Nkeyema Tobacco & Commercial Farming Belt	COMMUNITY	4	loc-zm-tenant-nkeyema	tenant-zambia-realty-01	2026-10-11 05:03:53.63	2026-10-11 05:03:54.739
loc-zm-tena-nkeyema-tbz-scheme	TBZ Scheme	COMMUNITY	4	loc-zm-tenant-nkeyema	tenant-zambia-realty-01	2026-10-11 05:03:53.633	2026-10-11 05:03:54.741
loc-zm-tenant-lusaka	Lusaka Province	PROVINCE	2	loc-zm-tenant-z-root	tenant-zambia-realty-01	2026-10-11 05:03:52.377	2026-10-11 19:51:11.208
loc-zm-tena-pemba-kanchomba-agricultural-c	Kanchomba Agricultural Center	COMMUNITY	4	loc-zm-tenant-pemba	tenant-zambia-realty-01	2026-10-11 05:03:53.054	2026-10-11 05:03:54.174
loc-zm-tena-chipata-magazine	Magazine	COMMUNITY	4	loc-zm-tenant-chipata	tenant-zambia-realty-01	2026-10-11 05:03:53.077	2026-10-11 05:03:54.194
loc-zm-tena-sinda-chassa-mission	Chassa Mission	COMMUNITY	4	loc-zm-tenant-sinda	tenant-zambia-realty-01	2026-10-11 05:03:53.14	2026-10-11 05:03:54.253
loc-zm-tenant-nchelenge	Nchelenge District	DISTRICT	3	loc-zm-tenant-luapula	tenant-zambia-realty-01	2026-10-11 05:03:53.204	2026-10-11 05:03:54.32
loc-zm-tena-chipili-chipili-central	Chipili Central	COMMUNITY	4	loc-zm-tenant-chipili	tenant-zambia-realty-01	2026-10-11 05:03:53.25	2026-10-11 05:03:54.361
loc-zm-tena-mporokos-mporokoso-boma	Mporokoso Boma	COMMUNITY	4	loc-zm-tenant-mporokoso	tenant-zambia-realty-01	2026-10-11 05:03:53.32	2026-10-11 05:03:54.445
loc-zm-tena-mufumbwe-mufumbwe-boma	Mufumbwe Boma	COMMUNITY	4	loc-zm-tenant-mufumbwe	tenant-zambia-realty-01	2026-10-11 05:03:53.434	2026-10-11 05:03:54.551
loc-zm-tena-mafinga-mafinga-hills-base	Mafinga Hills Base	COMMUNITY	4	loc-zm-tenant-mafinga	tenant-zambia-realty-01	2026-10-11 05:03:53.505	2026-10-11 05:03:54.615
loc-zm-tena-kaoma-luampa-road-hub	Luampa Road Hub	COMMUNITY	4	loc-zm-tenant-kaoma	tenant-zambia-realty-01	2026-10-11 05:03:53.555	2026-10-11 05:03:54.663
loc-zm-tena-shangomb-angola-frontier-post	Angola Frontier Post	COMMUNITY	4	loc-zm-tenant-shangombo	tenant-zambia-realty-01	2026-10-11 05:03:53.591	2026-10-11 05:03:54.699
loc-zm-tenant-western	Western Province	PROVINCE	2	loc-zm-tenant-z-root	tenant-zambia-realty-01	2026-10-11 05:03:53.531	2026-10-11 19:51:11.208
loc-zm-tenant-northwestern	North-Western Province	PROVINCE	2	loc-zm-tenant-z-root	tenant-zambia-realty-01	2026-10-11 05:03:53.365	2026-10-11 19:51:11.208
\.


--
-- Data for Name: maintenance_tickets; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.maintenance_tickets (id, title, description, priority, status, "propertyId", "tenantId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: message_threads; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.message_threads (id, subject, tenant_id, created_at, updated_at, property_id) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.messages (id, thread_id, sender_id, content, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: ownership_history; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.ownership_history (id, property_id, owner_id, owner_type, acquisition_date, transfer_date, transfer_reason, document_reference) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.payments (id, amount, date, method, reference, status, "renterId", "tenantId", "createdAt", "updatedAt") FROM stdin;
pay-rcp-00101	4500.000000000000000000000000000000	2026-10-01 00:00:00	BANK_TRANSFER	RCP-2026-00101	COMPLETED	renter-telecom-01	90675491-25d0-4129-8084-6a38a591be6f	2026-10-11 04:14:17.461	2026-10-11 04:14:17.461
pay-rcp-00102	6000.000000000000000000000000000000	2026-10-05 00:00:00	ELECTRONIC_FUNDS	RCP-2026-00102	COMPLETED	renter-oceanic-02	90675491-25d0-4129-8084-6a38a591be6f	2026-10-11 04:14:17.471	2026-10-11 04:14:17.471
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.permissions (id, action, resource, description) FROM stdin;
\.


--
-- Data for Name: portal_configs; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.portal_configs (id, tenant_id, subdomain, primary_color, secondary_color, logo_url, welcome_message, is_active, created_at, updated_at) FROM stdin;
c5d06e83-2693-4efa-b136-e49ec4e0e223	90675491-25d0-4129-8084-6a38a591be6f		#08054d	#10b981	\N	Welcome to our resident portal.	t	2026-10-11 04:10:14.881	2026-10-11 04:10:19.016
\.


--
-- Data for Name: properties; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.properties (id, name, type, status, "locationId", "tenantId", address, images, latitude, longitude, province, district, llg, region, "createdAt", "updatedAt", listing_type, sale_price, description, "yearBuilt", "landArea", floor_count, parking_spaces, "landlordId") FROM stdin;
prop-harbour-city-01	Harbour City Commercial Plaza	COMMERCIAL	LEASED	loc-pom-cbd-01	90675491-25d0-4129-8084-6a38a591be6f	Poreporena Freeway, Port Moresby Waterfront	{https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80}	-9.4789	147.1494	\N	\N	\N	\N	2026-10-11 04:14:17.349	2026-10-11 04:14:17.349	LEASE	\N	Prime Grade-A commercial multi-tenant corporate hub with backup utilities and high-speed fiber.	\N	\N	8	60	\N
prop-apex-res-02	Apex Horizon Luxury Suites	RESIDENTIAL	AVAILABLE	loc-pom-cbd-01	90675491-25d0-4129-8084-6a38a591be6f	Touaguba Hill, Port Moresby	{https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80}	-9.482	147.145	\N	\N	\N	\N	2026-10-11 04:14:17.364	2026-10-11 04:14:17.364	LEASE	\N	Exclusive executive serviced residences with panoramic ocean views and 24/7 security.	\N	\N	5	24	\N
prop-lae-logistics-03	Lae Maritime Logistics Park	INDUSTRIAL	LEASED	loc-lae-ind-02	90675491-25d0-4129-8084-6a38a591be6f	Main Wharf Access Road, Lae Port	{https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80}	-6.7264	146.9972	\N	\N	\N	\N	2026-10-11 04:14:17.37	2026-10-11 04:14:17.37	LEASE	\N	Heavy industrial warehousing facility with high-cube clearances and container staging yard.	\N	\N	2	40	\N
prop-hagen-trade-04	Highlands Gateway Commerce Centre	COMMERCIAL	AVAILABLE	loc-mth-comm-03	90675491-25d0-4129-8084-6a38a591be6f	Okuk Highway Junction, Mt Hagen	{https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80}	-5.8601	144.2274	\N	\N	\N	\N	2026-10-11 04:14:17.378	2026-10-11 04:14:17.378	LEASE	\N	Strategic regional distribution and corporate retail centre serving the Highlands corridors.	\N	\N	3	50	\N
prop-us-wallst-01	One Manhattan Financial Tower	COMMERCIAL	LEASED	loc-us-manhattan-03	90675491-25d0-4129-8084-6a38a591be6f	140 Broadway, Financial District, New York, NY 10005	{https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80}	40.7081	-74.0113	\N	\N	\N	\N	2026-10-11 04:28:51.635	2026-10-11 04:28:51.635	LEASE	\N	Prestige corporate office tower with LEED Platinum certification and panoramic harbor views.	\N	\N	52	120	\N
prop-uk-canary-02	Canary Wharf Executive Plaza	COMMERCIAL	AVAILABLE	loc-uk-london-02	90675491-25d0-4129-8084-6a38a591be6f	25 Bank Street, Canary Wharf, London E14 5JP	{https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80}	51.5033	-0.0195	\N	\N	\N	\N	2026-10-11 04:28:51.651	2026-10-11 04:28:51.651	LEASE	\N	Grade-A headquarters building featuring column-free floor plates and high-capacity connectivity.	\N	\N	33	80	\N
prop-sa-sandton-01	Sandton Gateway Heights	COMMERCIAL	AVAILABLE	loc-sa-jhb-02	tenant-apex-emea-02	Rivonia Road, Sandton, Johannesburg	{https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80}	-26.1076	28.0567	\N	\N	\N	\N	2026-10-11 04:28:51.689	2026-10-11 04:28:51.689	LEASE	\N	Premier financial precinct development offering flexible floor arrangements and solar microgrid.	\N	\N	14	90	\N
prop-au-barangaroo-01	Barangaroo Harbourview Suites	COMMERCIAL	LEASED	loc-au-syd-02	tenant-pacific-rim-03	Hickson Road, Barangaroo South, Sydney NSW 2000	{https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80}	-33.8646	151.2014	\N	\N	\N	\N	2026-10-11 04:28:51.712	2026-10-11 04:28:51.712	LEASE	\N	World-class waterfront commercial asset with 6-star Green Star rating and ferry connectivity.	\N	\N	28	110	\N
prop-zm-kabulonga-01	Kabulonga Diplomatic Presidential Villa	RESIDENTIAL	AVAILABLE	loc-zm-tena-lusaka-d-kabulonga	tenant-zambia-realty-01	Plot 12, Kudu Road, Kabulonga, Lusaka	{https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80}	-15.4212	28.3415	Lusaka Province	Lusaka District	Kabulonga	Southern Central Africa	2026-10-11 05:03:54.754	2026-10-11 05:03:54.754	LEASE	\N	\N	\N	\N	\N	\N	\N
prop-zm-rhodespark-02	Rhodes Park Corporate Financial Plaza	COMMERCIAL	AVAILABLE	loc-zm-tena-lusaka-d-rhodes-park	tenant-zambia-realty-01	Corner of Addis Ababa Drive & Great East Road, Rhodes Park, Lusaka	{https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80}	-15.412	28.3005	Lusaka Province	Lusaka District	Rhodes Park	Southern Central Africa	2026-10-11 05:03:54.762	2026-10-11 05:03:54.762	LEASE	\N	\N	\N	\N	\N	\N	\N
prop-zm-woodlands-03	Woodlands Lifestyle Estate & Townhouses	RESIDENTIAL	OCCUPIED	loc-zm-tena-lusaka-d-woodlands	tenant-zambia-realty-01	Woodlands Chalala Boulevard, Lusaka	{https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80}	-15.441	28.332	Lusaka Province	Lusaka District	Woodlands	Southern Central Africa	2026-10-11 05:03:54.766	2026-10-11 05:03:54.766	LEASE	\N	\N	\N	\N	\N	\N	\N
prop-zm-kitwe-riverside-04	Copperbelt Riverside Executive Towers	COMMERCIAL	AVAILABLE	loc-zm-tena-kitwe-riverside	tenant-zambia-realty-01	Jambo Drive, Riverside, Kitwe	{https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80}	-12.791	28.231	Copperbelt Province	Kitwe District	Riverside	Southern Central Africa	2026-10-11 05:03:54.77	2026-10-11 05:03:54.77	LEASE	\N	\N	\N	\N	\N	\N	\N
prop-zm-ndola-kansenshi-05	Kansenshi Gated Residential Court	RESIDENTIAL	AVAILABLE	loc-zm-tena-ndola-kansenshi	tenant-zambia-realty-01	Broadway Way, Kansenshi, Ndola	{https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80}	-12.981	28.621	Copperbelt Province	Ndola District	Kansenshi	Southern Central Africa	2026-10-11 05:03:54.774	2026-10-11 05:03:54.774	LEASE	\N	\N	\N	\N	\N	\N	\N
prop-zm-livingstone-falls-06	Victoria Falls Royal Safari Lodge & Residences	HOSPITALITY	AVAILABLE	loc-zm-tena-livingst-falls-view	tenant-zambia-realty-01	Mosi-oa-Tunya Way, Falls View, Livingstone	{https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80}	-17.851	25.861	Southern Province	Livingstone District	Falls View	Southern Central Africa	2026-10-11 05:03:54.779	2026-10-11 05:03:54.779	LEASE	\N	\N	\N	\N	\N	\N	\N
496d46ac-eb1c-40c8-bf61-075383ea1825	Suspicious Plot Listing	RESIDENTIAL	REJECTED	loc-zm-tena-lusaka-d-sunningdale	tenant-zambia-realty-01	Fake Stand 12	{https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80}	-15.4167	28.2833	Lusaka Province	Lusaka District	Sunningdale	loc-zm-tenant-z-root	2026-10-11 07:24:44.677	2026-10-11 20:04:24.382	SALE	450000.000000000000000000000000000000	\N	\N	\N	\N	\N	\N
db75aa70-2d5f-42a8-8361-565f97a0b4b9	Sunningdale Presidential Executive Villa	RESIDENTIAL	AVAILABLE	loc-zm-tena-lusaka-d-sunningdale	tenant-zambia-realty-01	Plot 884, Independence Avenue, Sunningdale	{https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80}	-15.429	28.318	Lusaka Province	Lusaka District	Sunningdale	loc-zm-tenant-z-root	2026-10-11 07:21:35.151	2026-10-11 20:04:24.364	LEASE	28000.000000000000000000000000000000	\N	\N	\N	\N	\N	\N
3303fce2-037e-42da-95c2-75a816c884c5	Prime 1.1 Heactare on title on the banks of the Solwezi River, near Kafwaya Bridge	LAND	AVAILABLE	loc-pom-cbd-01	90675491-25d0-4129-8084-6a38a591be6f	Plot 43477, Mushitala-Golf Area	{https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80}	-12.115562	26.381031	North-Western Province	Solwezi District	Kansanshi Golf Estate	\N	2026-10-12 04:48:10.384	2026-10-12 05:56:00.345	SALE	2000000.000000000000000000000000000000	\N	\N	1100	\N	\N	\N
\.


--
-- Data for Name: property_features; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.property_features (id, property_id, feature, description, tenant_id, created_at) FROM stdin;
\.


--
-- Data for Name: property_sales; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.property_sales (id, property_id, buyer_id, seller_id, agreed_price, status, contract_url, settlement_date, registry_reference, created_at) FROM stdin;
\.


--
-- Data for Name: property_tags; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.property_tags (id, property_id, tag, color, tenant_id, created_at) FROM stdin;
\.


--
-- Data for Name: property_valuations; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.property_valuations (id, property_id, valuation_date, amount, valuation_type, valued_by, notes, tenant_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: renters; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.renters (id, name, email, phone, type, status, "idNumber", "tenantId", "createdAt", "updatedAt") FROM stdin;
renter-telecom-01	Pacific Telecom Global Corp	facilities@pacifictelecom.com	+675 7100 2345	CORPORATE	ACTIVE	CORP-PG-2024-883	90675491-25d0-4129-8084-6a38a591be6f	2026-10-11 04:14:17.42	2026-10-11 04:14:17.42
renter-oceanic-02	Oceanic Mining & Logistics Ltd	operations@oceanicmining.com	+675 7455 9901	CORPORATE	ACTIVE	CORP-AU-7761-09	90675491-25d0-4129-8084-6a38a591be6f	2026-10-11 04:14:17.43	2026-10-11 04:14:17.43
renter-henderson-03	Dr. Arthur Henderson	arthur.henderson@pacifichealth.org	+675 7234 5678	INDIVIDUAL	ACTIVE	NIC-9812-4412	90675491-25d0-4129-8084-6a38a591be6f	2026-10-11 04:14:17.435	2026-10-11 04:14:17.435
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.roles (role_id, role_code, role_name, description, tenant_id) FROM stdin;
f74d46f4-03de-44cb-8964-088ed8f7def3	ADMIN	System Administrator	Full access to all resources	90675491-25d0-4129-8084-6a38a591be6f
\.


--
-- Data for Name: sale_interests; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.sale_interests (id, property_id, user_id, offered_price, status, terms, created_at) FROM stdin;
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.sale_items (id, sale_id, inventory_item_id, name, quantity, unit_price, total_price) FROM stdin;
\.


--
-- Data for Name: sales_transactions; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.sales_transactions (id, order_number, customer_name, total_amount, tax_amount, payment_method, status, tenant_id, performed_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: scam_blacklist; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.scam_blacklist (id, entity_type, entity_value, entity_display, severity, incident_summary, evidence_urls, flagged_by, tenant_id, appeal_status, is_active, created_at, updated_at) FROM stdin;
59d26852-f71b-40ae-bdcb-284559135cbd	PHONE_NUMBER	+260977000999	+260 977 *** 999	CRITICAL_FRAUD	Repeatedly collected advance viewing fees via mobile money for non-existent Kabulonga apartments	{}	CHIEF_COMPLIANCE_OFFICER	\N	NONE	t	2026-10-11 08:51:06.330408+02	2026-10-11 08:51:06.330408+02
3ada06ba-098c-40a5-944c-92019df5d320	NATIONAL_ID	199823/11/1	NRC: 199823/**/1	IDENTITY_THEFT	Attempted to upload forged certificate of title deed with altered parcel numbers in Woodlands	{}	AUDIT_OFFICER	\N	NONE	t	2026-10-11 08:51:06.330408+02	2026-10-11 08:51:06.330408+02
666c45db-05d2-4ee1-bbf1-073d3504d9e0	PHONE_NUMBER	+260977888777	Phone: +260977888777	CRITICAL_FRAUD	Submitted forged/fake title deed for Suspicious Plot Listing. Notes: Ministry of Lands confirmed fake cadastral survey and forged registrar signature	{}	CHIEF_REGISTRAR_AUDITOR	\N	NONE	t	2026-10-11 09:24:44.759283+02	2026-10-11 09:24:44.759283+02
e439a16c-3cbe-4c1d-8454-21c9211b863e	NATIONAL_ID	777888/11/1	ID: 777888/11/1	IDENTITY_THEFT	Associated with fraudulent property listing Suspicious Plot Listing. Notes: Ministry of Lands confirmed fake cadastral survey and forged registrar signature	{}	CHIEF_REGISTRAR_AUDITOR	\N	NONE	t	2026-10-11 09:24:44.766353+02	2026-10-11 09:24:44.766353+02
\.


--
-- Data for Name: stock_transactions; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.stock_transactions (id, inventory_item_id, type, quantity, reason, performed_by, tenant_id, created_at) FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.tasks (id, title, description, status, priority, due_date, assigned_to, related_to, related_type, tenant_id, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.tenants (id, name, domain, status, "createdAt", "updatedAt", config, features) FROM stdin;
tenant-apex-emea-02	Apex African & EMEA Holdings	apex-emea	ACTIVE	2026-10-11 04:28:51.663	2026-10-11 04:28:51.663	{"locale": {"currency": "ZAR", "dateFormat": "YYYY-MM-DD", "timeFormat": "24h"}, "contact": {"email": "info@apexemea.com", "phone": "+27 11 982 4400", "address": "Sandton City Office Towers, Johannesburg, 2196"}, "country": "South Africa", "branding": {"logoUrl": "", "fontFamily": "Inter, sans-serif", "primaryColor": "#059669", "secondaryColor": "#d97706"}, "locationLabels": {"1": "Country", "2": "Province / County", "3": "Municipality / City", "4": "Township / Suburb"}}	{"sales": true, "leases": true, "analytics": true, "landlords": true, "locations": true, "properties": true, "maintenance": true}
tenant-pacific-rim-03	Pacific Rim Capital Properties	pacific-rim	ACTIVE	2026-10-11 04:28:51.697	2026-10-11 04:28:51.697	{"locale": {"currency": "AUD", "dateFormat": "DD/MM/YYYY", "timeFormat": "12h"}, "contact": {"email": "enquiries@pacificrimcap.com.au", "phone": "+61 2 9200 1122", "address": "Level 38, Australia Square, Sydney NSW 2000"}, "country": "Australia", "branding": {"logoUrl": "", "fontFamily": "Inter, sans-serif", "primaryColor": "#0284c7", "secondaryColor": "#f97316"}, "locationLabels": {"1": "Country", "2": "State / Territory", "3": "City / LGA", "4": "Suburb / Precinct"}}	{"sales": true, "leases": true, "analytics": true, "landlords": true, "locations": true, "properties": true, "maintenance": true}
90675491-25d0-4129-8084-6a38a591be6f	Remis Global Enterprise	remis-hq	ACTIVE	2026-07-24 17:14:19.072	2026-10-11 04:55:45.643	{"locale": {"currency": "USD", "dateFormat": "YYYY-MM-DD", "timeFormat": "12h"}, "contact": {"email": "contact@remisglobal.com", "phone": "+1 (555) 019-2834", "address": "742 Evergreen Terrace, New York, NY 10001"}, "country": "United States", "branding": {"logoUrl": "", "fontFamily": "Inter, sans-serif", "primaryColor": "#4f46e5", "secondaryColor": "#10b981"}, "locationLabels": {"1": "Country", "2": "State / Province", "3": "City / District", "4": "Locality / Area"}}	{"crm": true, "sales": true, "leases": true, "finance": true, "analytics": true, "documents": true, "landlords": true, "locations": true, "properties": true, "maintenance": true}
tenant-zambia-realty-01	Remis Zambia Holdings & Estates	remis-zambia	ACTIVE	2026-10-11 05:03:52.346	2026-10-12 05:23:28.134	{"locale": {"currency": "ZMW", "dateFormat": "DD/MM/YYYY", "timeFormat": "24h"}, "contact": {"email": "operations@remiszambia.co.zm", "phone": "+260 211 254 789", "address": "Plot 4821, Thabo Mbeki Road, Mass Media Commercial Park, Lusaka, Zambia"}, "country": "Zambia", "branding": {"logoUrl": "http://localhost:4000/file-1791782605237-246999543.png", "fontFamily": "Inter, sans-serif", "primaryColor": "#059669", "secondaryColor": "#d97706"}, "locationLabels": {"1": "Country", "2": "Province", "3": "District", "4": "Settlement / Community"}}	{"hr": true, "crm": true, "map": true, "pos": true, "field": true, "sales": true, "trust": true, "leases": true, "portal": true, "finance": true, "reports": true, "vendors": true, "security": true, "strategy": true, "analytics": true, "contracts": true, "documents": true, "inventory": true, "landlords": true, "locations": true, "workflows": true, "compliance": true, "properties": true, "maintenance": true, "integrations": true, "verification": true, "communications": true}
\.


--
-- Data for Name: units; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.units (id, name, code, type, "marketRent", area, bedrooms, bathrooms, status, "propertyId", "tenantId", images, "createdAt", "updatedAt") FROM stdin;
unit-harbour-401	Suite 401 - Corporate HQ	HCP-401	OFFICE	4500.000000000000000000000000000000	320	\N	\N	OCCUPIED	prop-harbour-city-01	90675491-25d0-4129-8084-6a38a591be6f	{}	2026-10-11 04:14:17.386	2026-10-11 04:14:17.386
unit-apex-penthouse	Penthouse Suite 3B	AH-3B	APARTMENT	2400.000000000000000000000000000000	180	3	2	AVAILABLE	prop-apex-res-02	90675491-25d0-4129-8084-6a38a591be6f	{}	2026-10-11 04:14:17.404	2026-10-11 04:14:17.404
unit-lae-bay1	Heavy Freight Bay 1	LMLP-B1	WAREHOUSE	6000.000000000000000000000000000000	1200	\N	\N	OCCUPIED	prop-lae-logistics-03	90675491-25d0-4129-8084-6a38a591be6f	{}	2026-10-11 04:14:17.412	2026-10-11 04:14:17.412
\.


--
-- Data for Name: user_groups; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.user_groups (id, name, description, tenant_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_location_access; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.user_location_access ("userId", "locationId") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.users (user_id, email, password, full_name, tenant_id, role_id, created_at, updated_at) FROM stdin;
f5c81372-b434-4e07-ac79-4b75da26f925	admin@remis.com	$2b$10$EKvpxU9IojtC9ekLLq59aONUvQzq8dfgIZdW4M7i7PtkVKrAqbcRu	Super Admin	90675491-25d0-4129-8084-6a38a591be6f	f74d46f4-03de-44cb-8964-088ed8f7def3	2026-07-24 17:14:19.465	2026-07-24 17:14:19.465
4be1de8b-f4a6-4359-9b9e-ee1766effef6	lawrencemukombo2@gmail.com	$2b$10$3DkVbJqiX7iKg1tIz4JaS.sCYMvxIePRuY9rPTBWg8Kh90A3S5TKe	Lawrence Mukombo	90675491-25d0-4129-8084-6a38a591be6f	f74d46f4-03de-44cb-8964-088ed8f7def3	2026-10-10 22:21:24.601	2026-10-10 22:21:24.601
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.vendors (vendor_id, name, email, phone, category, status, tenant_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: work_orders; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.work_orders (id, "ticketId", status, description, "assignedToPartyId", "scheduledDate", "completedDate", "costEstimate", "labourCost", "partsCost", "totalCost", "tenantId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: workflow_rules; Type: TABLE DATA; Schema: remis; Owner: -
--

COPY remis.workflow_rules (id, name, "triggerType", "triggerKey", "actionType", "actionData", is_active, tenant_id, created_at, updated_at) FROM stdin;
\.


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: compliance_records compliance_records_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.compliance_records
    ADD CONSTRAINT compliance_records_pkey PRIMARY KEY (id);


--
-- Name: contract_clause_usages contract_clause_usages_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.contract_clause_usages
    ADD CONSTRAINT contract_clause_usages_pkey PRIMARY KEY (id);


--
-- Name: contract_clauses contract_clauses_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.contract_clauses
    ADD CONSTRAINT contract_clauses_pkey PRIMARY KEY (id);


--
-- Name: contract_obligations contract_obligations_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.contract_obligations
    ADD CONSTRAINT contract_obligations_pkey PRIMARY KEY (id);


--
-- Name: contract_templates contract_templates_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.contract_templates
    ADD CONSTRAINT contract_templates_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: expressions_of_interest expressions_of_interest_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.expressions_of_interest
    ADD CONSTRAINT expressions_of_interest_pkey PRIMARY KEY (id);


--
-- Name: field_devices field_devices_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.field_devices
    ADD CONSTRAINT field_devices_pkey PRIMARY KEY (id);


--
-- Name: integration_connections integration_connections_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.integration_connections
    ADD CONSTRAINT integration_connections_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (invoice_id);


--
-- Name: landlords landlords_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.landlords
    ADD CONSTRAINT landlords_pkey PRIMARY KEY (id);


--
-- Name: lease_signatures lease_signatures_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.lease_signatures
    ADD CONSTRAINT lease_signatures_pkey PRIMARY KEY (id);


--
-- Name: leases leases_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.leases
    ADD CONSTRAINT leases_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: maintenance_tickets maintenance_tickets_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.maintenance_tickets
    ADD CONSTRAINT maintenance_tickets_pkey PRIMARY KEY (id);


--
-- Name: message_threads message_threads_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.message_threads
    ADD CONSTRAINT message_threads_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: ownership_history ownership_history_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.ownership_history
    ADD CONSTRAINT ownership_history_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: portal_configs portal_configs_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.portal_configs
    ADD CONSTRAINT portal_configs_pkey PRIMARY KEY (id);


--
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- Name: property_features property_features_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.property_features
    ADD CONSTRAINT property_features_pkey PRIMARY KEY (id);


--
-- Name: property_sales property_sales_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.property_sales
    ADD CONSTRAINT property_sales_pkey PRIMARY KEY (id);


--
-- Name: property_tags property_tags_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.property_tags
    ADD CONSTRAINT property_tags_pkey PRIMARY KEY (id);


--
-- Name: property_valuations property_valuations_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.property_valuations
    ADD CONSTRAINT property_valuations_pkey PRIMARY KEY (id);


--
-- Name: renters renters_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.renters
    ADD CONSTRAINT renters_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: sale_interests sale_interests_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.sale_interests
    ADD CONSTRAINT sale_interests_pkey PRIMARY KEY (id);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sales_transactions sales_transactions_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.sales_transactions
    ADD CONSTRAINT sales_transactions_pkey PRIMARY KEY (id);


--
-- Name: scam_blacklist scam_blacklist_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.scam_blacklist
    ADD CONSTRAINT scam_blacklist_pkey PRIMARY KEY (id);


--
-- Name: stock_transactions stock_transactions_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.stock_transactions
    ADD CONSTRAINT stock_transactions_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- Name: user_groups user_groups_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.user_groups
    ADD CONSTRAINT user_groups_pkey PRIMARY KEY (id);


--
-- Name: user_location_access user_location_access_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.user_location_access
    ADD CONSTRAINT user_location_access_pkey PRIMARY KEY ("userId", "locationId");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (vendor_id);


--
-- Name: work_orders work_orders_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.work_orders
    ADD CONSTRAINT work_orders_pkey PRIMARY KEY (id);


--
-- Name: workflow_rules workflow_rules_pkey; Type: CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.workflow_rules
    ADD CONSTRAINT workflow_rules_pkey PRIMARY KEY (id);


--
-- Name: _PermissionToRole_AB_unique; Type: INDEX; Schema: remis; Owner: -
--

CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON remis."_PermissionToRole" USING btree ("A", "B");


--
-- Name: _PermissionToRole_B_index; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX "_PermissionToRole_B_index" ON remis."_PermissionToRole" USING btree ("B");


--
-- Name: _UserToUserGroup_AB_unique; Type: INDEX; Schema: remis; Owner: -
--

CREATE UNIQUE INDEX "_UserToUserGroup_AB_unique" ON remis."_UserToUserGroup" USING btree ("A", "B");


--
-- Name: _UserToUserGroup_B_index; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX "_UserToUserGroup_B_index" ON remis."_UserToUserGroup" USING btree ("B");


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX audit_logs_action_idx ON remis.audit_logs USING btree (action);


--
-- Name: audit_logs_created_at_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX audit_logs_created_at_idx ON remis.audit_logs USING btree (created_at);


--
-- Name: audit_logs_tenant_id_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX audit_logs_tenant_id_idx ON remis.audit_logs USING btree (tenant_id);


--
-- Name: audit_logs_user_id_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX audit_logs_user_id_idx ON remis.audit_logs USING btree (user_id);


--
-- Name: compliance_records_expiry_date_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX compliance_records_expiry_date_idx ON remis.compliance_records USING btree (expiry_date);


--
-- Name: compliance_records_property_id_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX compliance_records_property_id_idx ON remis.compliance_records USING btree (property_id);


--
-- Name: compliance_records_tenant_id_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX compliance_records_tenant_id_idx ON remis.compliance_records USING btree (tenant_id);


--
-- Name: contracts_tenant_id_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX contracts_tenant_id_idx ON remis.contracts USING btree (tenant_id);


--
-- Name: employees_userId_key; Type: INDEX; Schema: remis; Owner: -
--

CREATE UNIQUE INDEX "employees_userId_key" ON remis.employees USING btree ("userId");


--
-- Name: field_devices_device_id_key; Type: INDEX; Schema: remis; Owner: -
--

CREATE UNIQUE INDEX field_devices_device_id_key ON remis.field_devices USING btree (device_id);


--
-- Name: field_devices_tenant_id_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX field_devices_tenant_id_idx ON remis.field_devices USING btree (tenant_id);


--
-- Name: integration_connections_tenant_id_provider_key; Type: INDEX; Schema: remis; Owner: -
--

CREATE UNIQUE INDEX integration_connections_tenant_id_provider_key ON remis.integration_connections USING btree (tenant_id, provider);


--
-- Name: inventory_items_sku_key; Type: INDEX; Schema: remis; Owner: -
--

CREATE UNIQUE INDEX inventory_items_sku_key ON remis.inventory_items USING btree (sku);


--
-- Name: inventory_items_tenant_id_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX inventory_items_tenant_id_idx ON remis.inventory_items USING btree (tenant_id);


--
-- Name: permissions_action_resource_key; Type: INDEX; Schema: remis; Owner: -
--

CREATE UNIQUE INDEX permissions_action_resource_key ON remis.permissions USING btree (action, resource);


--
-- Name: portal_configs_subdomain_key; Type: INDEX; Schema: remis; Owner: -
--

CREATE UNIQUE INDEX portal_configs_subdomain_key ON remis.portal_configs USING btree (subdomain);


--
-- Name: portal_configs_tenant_id_key; Type: INDEX; Schema: remis; Owner: -
--

CREATE UNIQUE INDEX portal_configs_tenant_id_key ON remis.portal_configs USING btree (tenant_id);


--
-- Name: property_features_property_id_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX property_features_property_id_idx ON remis.property_features USING btree (property_id);


--
-- Name: property_features_tenant_id_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX property_features_tenant_id_idx ON remis.property_features USING btree (tenant_id);


--
-- Name: property_tags_property_id_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX property_tags_property_id_idx ON remis.property_tags USING btree (property_id);


--
-- Name: property_tags_tenant_id_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX property_tags_tenant_id_idx ON remis.property_tags USING btree (tenant_id);


--
-- Name: property_valuations_property_id_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX property_valuations_property_id_idx ON remis.property_valuations USING btree (property_id);


--
-- Name: property_valuations_tenant_id_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX property_valuations_tenant_id_idx ON remis.property_valuations USING btree (tenant_id);


--
-- Name: roles_role_code_tenant_id_key; Type: INDEX; Schema: remis; Owner: -
--

CREATE UNIQUE INDEX roles_role_code_tenant_id_key ON remis.roles USING btree (role_code, tenant_id);


--
-- Name: sales_transactions_order_number_key; Type: INDEX; Schema: remis; Owner: -
--

CREATE UNIQUE INDEX sales_transactions_order_number_key ON remis.sales_transactions USING btree (order_number);


--
-- Name: sales_transactions_tenant_id_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX sales_transactions_tenant_id_idx ON remis.sales_transactions USING btree (tenant_id);


--
-- Name: stock_transactions_inventory_item_id_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX stock_transactions_inventory_item_id_idx ON remis.stock_transactions USING btree (inventory_item_id);


--
-- Name: stock_transactions_tenant_id_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX stock_transactions_tenant_id_idx ON remis.stock_transactions USING btree (tenant_id);


--
-- Name: tasks_assigned_to_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX tasks_assigned_to_idx ON remis.tasks USING btree (assigned_to);


--
-- Name: tasks_status_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX tasks_status_idx ON remis.tasks USING btree (status);


--
-- Name: tasks_tenant_id_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX tasks_tenant_id_idx ON remis.tasks USING btree (tenant_id);


--
-- Name: tenants_domain_key; Type: INDEX; Schema: remis; Owner: -
--

CREATE UNIQUE INDEX tenants_domain_key ON remis.tenants USING btree (domain);


--
-- Name: user_groups_tenant_id_name_key; Type: INDEX; Schema: remis; Owner: -
--

CREATE UNIQUE INDEX user_groups_tenant_id_name_key ON remis.user_groups USING btree (tenant_id, name);


--
-- Name: users_email_key; Type: INDEX; Schema: remis; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON remis.users USING btree (email);


--
-- Name: workflow_rules_tenant_id_idx; Type: INDEX; Schema: remis; Owner: -
--

CREATE INDEX workflow_rules_tenant_id_idx ON remis.workflow_rules USING btree (tenant_id);


--
-- Name: _PermissionToRole _PermissionToRole_A_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis."_PermissionToRole"
    ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES remis.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _PermissionToRole _PermissionToRole_B_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis."_PermissionToRole"
    ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES remis.roles(role_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserToUserGroup _UserToUserGroup_A_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis."_UserToUserGroup"
    ADD CONSTRAINT "_UserToUserGroup_A_fkey" FOREIGN KEY ("A") REFERENCES remis.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserToUserGroup _UserToUserGroup_B_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis."_UserToUserGroup"
    ADD CONSTRAINT "_UserToUserGroup_B_fkey" FOREIGN KEY ("B") REFERENCES remis.user_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.audit_logs
    ADD CONSTRAINT audit_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES remis.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: compliance_records compliance_records_property_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.compliance_records
    ADD CONSTRAINT compliance_records_property_id_fkey FOREIGN KEY (property_id) REFERENCES remis.properties(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: compliance_records compliance_records_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.compliance_records
    ADD CONSTRAINT compliance_records_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: contract_clause_usages contract_clause_usages_clause_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.contract_clause_usages
    ADD CONSTRAINT contract_clause_usages_clause_id_fkey FOREIGN KEY (clause_id) REFERENCES remis.contract_clauses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: contract_clause_usages contract_clause_usages_contract_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.contract_clause_usages
    ADD CONSTRAINT contract_clause_usages_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES remis.contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contract_clauses contract_clauses_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.contract_clauses
    ADD CONSTRAINT contract_clauses_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: contract_obligations contract_obligations_contract_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.contract_obligations
    ADD CONSTRAINT contract_obligations_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES remis.contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contract_templates contract_templates_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.contract_templates
    ADD CONSTRAINT contract_templates_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: contracts contracts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.contracts
    ADD CONSTRAINT contracts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: documents documents_tenantId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.documents
    ADD CONSTRAINT "documents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: employees employees_tenantId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.employees
    ADD CONSTRAINT "employees_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: employees employees_userId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.employees
    ADD CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES remis.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: expressions_of_interest expressions_of_interest_propertyId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.expressions_of_interest
    ADD CONSTRAINT "expressions_of_interest_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES remis.properties(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: expressions_of_interest expressions_of_interest_unitId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.expressions_of_interest
    ADD CONSTRAINT "expressions_of_interest_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES remis.units(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: expressions_of_interest expressions_of_interest_userId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.expressions_of_interest
    ADD CONSTRAINT "expressions_of_interest_userId_fkey" FOREIGN KEY ("userId") REFERENCES remis.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: field_devices field_devices_assigned_to_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.field_devices
    ADD CONSTRAINT field_devices_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES remis.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: field_devices field_devices_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.field_devices
    ADD CONSTRAINT field_devices_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: integration_connections integration_connections_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.integration_connections
    ADD CONSTRAINT integration_connections_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_items inventory_items_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.inventory_items
    ADD CONSTRAINT inventory_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_bill_to_party_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.invoices
    ADD CONSTRAINT invoices_bill_to_party_id_fkey FOREIGN KEY (bill_to_party_id) REFERENCES remis.renters(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_lease_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.invoices
    ADD CONSTRAINT invoices_lease_id_fkey FOREIGN KEY (lease_id) REFERENCES remis.leases(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.invoices
    ADD CONSTRAINT invoices_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: landlords landlords_tenantId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.landlords
    ADD CONSTRAINT "landlords_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lease_signatures lease_signatures_lease_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.lease_signatures
    ADD CONSTRAINT lease_signatures_lease_id_fkey FOREIGN KEY (lease_id) REFERENCES remis.leases(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lease_signatures lease_signatures_user_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.lease_signatures
    ADD CONSTRAINT lease_signatures_user_id_fkey FOREIGN KEY (user_id) REFERENCES remis.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leases leases_propertyId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.leases
    ADD CONSTRAINT "leases_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES remis.properties(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leases leases_renterId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.leases
    ADD CONSTRAINT "leases_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES remis.renters(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leases leases_tenantId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.leases
    ADD CONSTRAINT "leases_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: locations locations_parentId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.locations
    ADD CONSTRAINT "locations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES remis.locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: locations locations_tenantId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.locations
    ADD CONSTRAINT "locations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: maintenance_tickets maintenance_tickets_propertyId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.maintenance_tickets
    ADD CONSTRAINT "maintenance_tickets_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES remis.properties(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: maintenance_tickets maintenance_tickets_tenantId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.maintenance_tickets
    ADD CONSTRAINT "maintenance_tickets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: messages messages_thread_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.messages
    ADD CONSTRAINT messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES remis.message_threads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ownership_history ownership_history_property_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.ownership_history
    ADD CONSTRAINT ownership_history_property_id_fkey FOREIGN KEY (property_id) REFERENCES remis.properties(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_renterId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.payments
    ADD CONSTRAINT "payments_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES remis.renters(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_tenantId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.payments
    ADD CONSTRAINT "payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: portal_configs portal_configs_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.portal_configs
    ADD CONSTRAINT portal_configs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: properties properties_landlordId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.properties
    ADD CONSTRAINT "properties_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES remis.landlords(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: properties properties_locationId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.properties
    ADD CONSTRAINT "properties_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES remis.locations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: properties properties_tenantId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.properties
    ADD CONSTRAINT "properties_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: property_features property_features_property_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.property_features
    ADD CONSTRAINT property_features_property_id_fkey FOREIGN KEY (property_id) REFERENCES remis.properties(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: property_features property_features_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.property_features
    ADD CONSTRAINT property_features_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: property_sales property_sales_buyer_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.property_sales
    ADD CONSTRAINT property_sales_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES remis.users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: property_sales property_sales_property_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.property_sales
    ADD CONSTRAINT property_sales_property_id_fkey FOREIGN KEY (property_id) REFERENCES remis.properties(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: property_tags property_tags_property_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.property_tags
    ADD CONSTRAINT property_tags_property_id_fkey FOREIGN KEY (property_id) REFERENCES remis.properties(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: property_tags property_tags_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.property_tags
    ADD CONSTRAINT property_tags_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: property_valuations property_valuations_property_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.property_valuations
    ADD CONSTRAINT property_valuations_property_id_fkey FOREIGN KEY (property_id) REFERENCES remis.properties(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: property_valuations property_valuations_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.property_valuations
    ADD CONSTRAINT property_valuations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: renters renters_tenantId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.renters
    ADD CONSTRAINT "renters_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: roles roles_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.roles
    ADD CONSTRAINT roles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sale_interests sale_interests_property_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.sale_interests
    ADD CONSTRAINT sale_interests_property_id_fkey FOREIGN KEY (property_id) REFERENCES remis.properties(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sale_interests sale_interests_user_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.sale_interests
    ADD CONSTRAINT sale_interests_user_id_fkey FOREIGN KEY (user_id) REFERENCES remis.users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sale_items sale_items_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.sale_items
    ADD CONSTRAINT sale_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES remis.inventory_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sale_items sale_items_sale_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.sale_items
    ADD CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES remis.sales_transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales_transactions sales_transactions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.sales_transactions
    ADD CONSTRAINT sales_transactions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_transactions stock_transactions_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.stock_transactions
    ADD CONSTRAINT stock_transactions_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES remis.inventory_items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES remis.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_created_by_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.tasks
    ADD CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES remis.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.tasks
    ADD CONSTRAINT tasks_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: units units_propertyId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.units
    ADD CONSTRAINT "units_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES remis.properties(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: units units_tenantId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.units
    ADD CONSTRAINT "units_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_groups user_groups_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.user_groups
    ADD CONSTRAINT user_groups_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_location_access user_location_access_locationId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.user_location_access
    ADD CONSTRAINT "user_location_access_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES remis.locations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_location_access user_location_access_userId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.user_location_access
    ADD CONSTRAINT "user_location_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES remis.users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES remis.roles(role_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vendors vendors_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.vendors
    ADD CONSTRAINT vendors_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: work_orders work_orders_assignedToPartyId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.work_orders
    ADD CONSTRAINT "work_orders_assignedToPartyId_fkey" FOREIGN KEY ("assignedToPartyId") REFERENCES remis.vendors(vendor_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: work_orders work_orders_tenantId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.work_orders
    ADD CONSTRAINT "work_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: work_orders work_orders_ticketId_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.work_orders
    ADD CONSTRAINT "work_orders_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES remis.maintenance_tickets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: workflow_rules workflow_rules_tenant_id_fkey; Type: FK CONSTRAINT; Schema: remis; Owner: -
--

ALTER TABLE ONLY remis.workflow_rules
    ADD CONSTRAINT workflow_rules_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES remis.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict ZNg9fOcWrgy4fpPDtNvFlmQFZ6Xs40OmpSWFRFgA8H64WN6SSo4r55UfuqyFdEN

